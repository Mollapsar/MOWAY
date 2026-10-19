'use strict';

const crypto = require('node:crypto');
const {
  CALLBACK_URL,
  REQUIRED_SCOPES,
  SSO_METADATA_URL,
} = require('./constants.cjs');
const { AppError } = require('./errors.cjs');

let metadataCache = null;
let jwksCache = null;
let cacheExpiresAt = 0;

function base64Url(buffer) {
  return Buffer.from(buffer).toString('base64url');
}

function createPkce() {
  const verifier = base64Url(crypto.randomBytes(48));
  const challenge = base64Url(crypto.createHash('sha256').update(verifier).digest());
  const state = base64Url(crypto.randomBytes(32));
  return { verifier, challenge, state };
}

async function getSsoConfiguration(fetchImpl = fetch) {
  if (metadataCache && jwksCache && Date.now() < cacheExpiresAt) {
    return { metadata: metadataCache, jwks: jwksCache };
  }

  const metadataResponse = await fetchImpl(SSO_METADATA_URL, { redirect: 'error' });
  if (!metadataResponse.ok) {
    throw new AppError('无法读取 EVE SSO 配置。', 'SSO_METADATA_FAILED');
  }
  const metadata = await metadataResponse.json();
  if (!metadata.authorization_endpoint || !metadata.token_endpoint || !metadata.jwks_uri) {
    throw new AppError('EVE SSO 配置不完整。', 'SSO_METADATA_INVALID');
  }

  const jwksResponse = await fetchImpl(metadata.jwks_uri, { redirect: 'error' });
  if (!jwksResponse.ok) throw new AppError('无法读取 EVE SSO 签名密钥。', 'SSO_JWKS_FAILED');
  const jwks = await jwksResponse.json();

  metadataCache = metadata;
  jwksCache = jwks;
  cacheExpiresAt = Date.now() + 5 * 60 * 1000;
  return { metadata, jwks };
}

function buildAuthorizationUrl({ authorizationEndpoint, clientId, challenge, state }) {
  const url = new URL(authorizationEndpoint);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', CALLBACK_URL);
  url.searchParams.set('scope', REQUIRED_SCOPES.join(' '));
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

async function exchangeAuthorizationCode({ tokenEndpoint, clientId, code, verifier, fetchImpl = fetch }) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    code_verifier: verifier,
    redirect_uri: CALLBACK_URL,
  });
  return requestToken(tokenEndpoint, body, fetchImpl);
}

async function refreshAccessToken({ tokenEndpoint, clientId, refreshToken, fetchImpl = fetch }) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  });
  return requestToken(tokenEndpoint, body, fetchImpl);
}

async function requestToken(tokenEndpoint, body, fetchImpl) {
  const response = await fetchImpl(tokenEndpoint, {
    method: 'POST',
    redirect: 'error',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.access_token) {
    const reason = payload?.error_description || payload?.error || `HTTP ${response.status}`;
    throw new AppError(`EVE SSO 拒绝了授权：${reason}`, 'SSO_TOKEN_FAILED');
  }
  return payload;
}

function decodePart(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function audienceIncludes(audience, value) {
  return Array.isArray(audience) ? audience.includes(value) : audience === value;
}

function extractScopes(payload) {
  if (Array.isArray(payload.scp)) return payload.scp;
  if (typeof payload.scp === 'string') return payload.scp.split(' ').filter(Boolean);
  return [];
}

async function validateAccessToken(accessToken, clientId, fetchImpl = fetch) {
  const parts = String(accessToken).split('.');
  if (parts.length !== 3) throw new AppError('EVE 返回了无效的访问令牌。', 'JWT_INVALID');
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  let header;
  let payload;
  try {
    header = decodePart(encodedHeader);
    payload = decodePart(encodedPayload);
  } catch {
    throw new AppError('无法解析 EVE 访问令牌。', 'JWT_INVALID');
  }

  if (header.alg !== 'RS256' || !header.kid) {
    throw new AppError('EVE 访问令牌使用了不受支持的签名方式。', 'JWT_ALGORITHM_INVALID');
  }

  const { jwks } = await getSsoConfiguration(fetchImpl);
  const jwk = jwks.keys?.find((key) => key.kid === header.kid && key.kty === 'RSA');
  if (!jwk) throw new AppError('找不到 EVE 访问令牌的签名密钥。', 'JWT_KEY_NOT_FOUND');

  const signingInput = Buffer.from(`${encodedHeader}.${encodedPayload}`);
  const signature = Buffer.from(encodedSignature, 'base64url');
  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const validSignature = crypto.verify('RSA-SHA256', signingInput, publicKey, signature);
  if (!validSignature) throw new AppError('EVE 访问令牌签名校验失败。', 'JWT_SIGNATURE_INVALID');

  const acceptedIssuers = new Set([
    'https://login.eveonline.com/',
    'https://login.eveonline.com',
    'login.eveonline.com',
  ]);
  if (!acceptedIssuers.has(payload.iss)) {
    throw new AppError('EVE 访问令牌签发方不可信。', 'JWT_ISSUER_INVALID');
  }
  if (!Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) {
    throw new AppError('EVE 访问令牌已经过期。', 'JWT_EXPIRED');
  }
  if (!audienceIncludes(payload.aud, clientId) || !audienceIncludes(payload.aud, 'EVE Online')) {
    throw new AppError('EVE 访问令牌并非签发给本应用。', 'JWT_AUDIENCE_INVALID');
  }

  const scopes = extractScopes(payload);
  const missingScopes = REQUIRED_SCOPES.filter((scope) => !scopes.includes(scope));
  if (missingScopes.length) {
    throw new AppError('授权缺少必要的 ESI 权限，请重新绑定角色。', 'JWT_SCOPES_MISSING', {
      missingScopes,
    });
  }

  const match = /^CHARACTER:EVE:(\d+)$/.exec(payload.sub || '');
  if (!match || !payload.name) {
    throw new AppError('EVE 访问令牌没有有效的角色信息。', 'JWT_SUBJECT_INVALID');
  }

  return {
    characterId: match[1],
    name: payload.name,
    scopes,
    expiresAt: payload.exp * 1000,
  };
}

module.exports = {
  buildAuthorizationUrl,
  createPkce,
  exchangeAuthorizationCode,
  getSsoConfiguration,
  refreshAccessToken,
  validateAccessToken,
};
