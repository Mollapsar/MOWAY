# Building MOWAY from Source / 从源码构建 MOWAY

[English](#english) | [简体中文](#简体中文)

Last verified / 最后验证：2026-10-20

<a id="english"></a>

## English

### 1. What is included

The public source tree contains the Electron main process, preload bridge, renderer UI,
ESI and SSO modules, local-data store, automated tests, dependency lockfile, documentation,
and screenshots.

It intentionally excludes:

- `node_modules`
- compiled EXE and unpacked build output
- `%APPDATA%\moway` and `navigator-data.json`
- EVE Client IDs entered by users
- access tokens and refresh tokens
- personal email or Discord configuration

No EVE Client Secret is required or used. Each user provides their own public EVE application
Client ID at runtime and authorizes characters through the official EVE SSO page.

### 2. Tested build environment

- Windows 10 or Windows 11, 64-bit
- Node.js `24.19.0`
- pnpm `11.25.0`
- Electron `44.7.2`
- electron-builder `26.15.3`

Other compatible Node.js versions may work, but the versions above are the verified toolchain.
The first dependency installation and first Electron build require internet access.

### 3. Install the toolchain

Install Node.js from its official website, then open PowerShell in the repository folder.

If Corepack is available:

```powershell
corepack enable
corepack prepare pnpm@11.25.0 --activate
```

If Corepack is unavailable:

```powershell
npm install --global pnpm@11.25.0
```

Install the exact dependency versions recorded in `pnpm-lock.yaml`:

```powershell
pnpm install --frozen-lockfile
```

### 4. Run the automated tests

```powershell
pnpm test
```

The current source contains 16 core tests covering PKCE, JWT validation, exact station and
structure waypoints, route optimization, the 15-stop limit, IPC request validation, route
folders, character folders and notes, drag ordering, and route-library import/export.

### 5. Run in development mode

```powershell
pnpm start
```

An EVE Developer application is not required to open or inspect the UI. A public Client ID
and the documented ESI scopes are required only when testing live login and ESI operations.

### 6. Build the single-file portable EXE

```powershell
pnpm pack:win
```

The output is created under `outputs` and normally uses the package version in its filename:

```text
outputs\MOWAY-0.9527.0-portable.exe
```

The public release file may be renamed to:

```text
MOWAY-V0.9527-route-optimizer-portable.exe
```

### 7. Build the fast folder version

```powershell
pnpm pack:folder
```

The unpacked application is created at:

```text
outputs\win-unpacked
```

Rename or copy that entire directory as `MOWAY-V0.9527`, then compress the complete folder.
Do not distribute only `MOWAY.exe`; it requires the adjacent DLL files, locales, and
`resources` directory.

### 8. Generate a SHA-256 checksum

```powershell
Get-FileHash -Algorithm SHA256 .\outputs\MOWAY-0.9527.0-portable.exe
```

Run the same command for the ZIP after creating the fast-folder archive.

Builds made on different computers or at different times may not be byte-for-byte identical
because packaging metadata and timestamps can differ. Review the source and lockfile, run the
tests, and compare behavior rather than expecting an identical EXE hash from every build.

### 9. Source layout

```text
main.cjs                 Electron main process and IPC handlers
preload.cjs              Restricted renderer-to-main bridge
src/                     ESI, SSO, storage, errors, and IPC security
renderer/                HTML, CSS, localization, and UI logic
tests/                   Automated core tests
package.json             Commands and packaging configuration
pnpm-lock.yaml           Locked dependency versions
```

The project is provided under the [MIT License](LICENSE). The security notices describe the
known trust boundaries and local data created by the application.

---

<a id="简体中文"></a>

## 简体中文

### 1. 源码包包含的内容

公开源码包含 Electron 主进程、预加载桥接、界面代码、ESI 与 SSO 模块、本地数据存储、
自动测试、依赖锁定文件、说明文档和截图。

源码包特意排除了：

- `node_modules`
- 已编译的 EXE 和解包后的程序文件
- `%APPDATA%\moway` 和 `navigator-data.json`
- 用户填写的 EVE Client ID
- 访问令牌和刷新令牌
- 私人邮箱或 Discord 配置

MOWAY 不需要也不会使用 EVE Client Secret。每位用户在运行时填写自己的公开 EVE
应用 Client ID，并通过 EVE 官方 SSO 页面授权角色。

### 2. 已验证的构建环境

- 64 位 Windows 10 或 Windows 11
- Node.js `24.19.0`
- pnpm `11.25.0`
- Electron `44.7.2`
- electron-builder `26.15.3`

其他兼容版本可能也能工作，但以上是经过验证的工具链。第一次安装依赖和第一次构建
Electron 程序时需要联网下载文件。

### 3. 安装构建工具

从 Node.js 官方网站安装 Node.js，然后在源码文件夹中打开 PowerShell。

如果系统提供 Corepack：

```powershell
corepack enable
corepack prepare pnpm@11.25.0 --activate
```

如果没有 Corepack：

```powershell
npm install --global pnpm@11.25.0
```

按照 `pnpm-lock.yaml` 安装锁定的依赖版本：

```powershell
pnpm install --frozen-lockfile
```

### 4. 运行自动测试

```powershell
pnpm test
```

当前源码包含 16 项核心测试，覆盖 PKCE、JWT 验证、精确空间站和建筑路径点、路线优化、
15 节点限制、IPC 请求校验、路线文件夹、角色文件夹与备注、拖动排序和路线库导入导出。

### 5. 以开发模式运行

```powershell
pnpm start
```

打开和检查界面不需要 EVE Developer 应用。只有测试真实登录和 ESI 操作时，才需要公开
Client ID 及说明文档中列出的 ESI 权限。

### 6. 编译单文件便携版

```powershell
pnpm pack:win
```

文件会生成在 `outputs` 目录，默认使用 `package.json` 中的版本号命名：

```text
outputs\MOWAY-0.9527.0-portable.exe
```

公开发布时可以将其重命名为：

```text
MOWAY-V0.9527-route-optimizer-portable.exe
```

### 7. 编译快速文件夹版

```powershell
pnpm pack:folder
```

解包后的程序位于：

```text
outputs\win-unpacked
```

将整个目录重命名或复制为 `MOWAY-V0.9527`，然后压缩完整文件夹。不要只分发
`MOWAY.exe`，它还需要旁边的 DLL、语言文件和 `resources` 目录。

### 8. 生成 SHA-256

```powershell
Get-FileHash -Algorithm SHA256 .\outputs\MOWAY-0.9527.0-portable.exe
```

完成文件夹版 ZIP 后，对 ZIP 运行同样的命令。

不同电脑或不同时间进行构建时，打包元数据和时间戳可能导致最终文件无法做到逐字节一致。
审查时应核对源码和锁定文件、运行测试并比较程序行为，而不是要求每次生成完全相同的
EXE SHA-256。

### 9. 源码结构

```text
main.cjs                 Electron 主进程与 IPC 处理
preload.cjs              受限的界面到主进程桥接
src/                     ESI、SSO、存储、错误与 IPC 安全
renderer/                HTML、CSS、多语言和界面逻辑
tests/                   核心自动测试
package.json             运行、测试和打包命令
pnpm-lock.yaml           锁定的依赖版本
```

项目采用 [MIT License](LICENSE)。中英文安全说明列出了程序的已知风险、信任边界和本地
产生的数据。
