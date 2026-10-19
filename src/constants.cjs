'use strict';

const APP_NAME = 'MOWAY';
const APP_VERSION = '0.9527.0';
const ESI_BASE_URL = 'https://esi.evetech.net';
const SSO_METADATA_URL = 'https://login.eveonline.com/.well-known/oauth-authorization-server';
const COMPATIBILITY_DATE = '2026-08-18';
const CALLBACK_HOST = '127.0.0.1';
const CALLBACK_PORT = 17890;
const CALLBACK_PATH = '/callback';
const CALLBACK_URL = `http://${CALLBACK_HOST}:${CALLBACK_PORT}${CALLBACK_PATH}`;
const REQUIRED_SCOPES = [
  'esi-location.read_online.v1',
  'esi-ui.write_waypoint.v1',
  'esi-search.search_structures.v1',
  'esi-universe.read_structures.v1',
];

module.exports = {
  APP_NAME,
  APP_VERSION,
  CALLBACK_HOST,
  CALLBACK_PATH,
  CALLBACK_PORT,
  CALLBACK_URL,
  COMPATIBILITY_DATE,
  ESI_BASE_URL,
  REQUIRED_SCOPES,
  SSO_METADATA_URL,
};
