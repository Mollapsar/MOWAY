MOWAY V0.9527

**A Windows route planner and waypoint manager for EVE Online.**

MOWAY plans and optimizes multi-stop routes outside the game, saves frequently used routes,
and sends them to multiple selected online characters through EVE ESI.

Its defining feature is **batch waypoint delivery at exact station or player-structure level**.
If several destinations are located in the same solar system, MOWAY keeps every station or
structure as a separate waypoint instead of collapsing them into one system-level destination.

> This program was written entirely by AI and has not received an independent professional
> security audit. Its security is uncertain. Use it at your own risk.

## Features

- Plan multi-stop EVE routes outside the game
- Search solar systems, NPC stations, and character-visible player structures
- Preserve exact station and player-structure destination IDs
- Optimize stop order for the lowest total stargate jump count
- Keep the starting point fixed
- Optionally keep the final destination fixed
- Support up to 15 stops during exact automatic optimization
- Send one route to multiple selected online characters
- Skip offline characters without interrupting the others
- Save, load, and delete frequently used routes
- Choose between planned-stop and jump-by-jump waypoint modes
- Switch between dark and light themes
- Switch between Chinese and English UI
- Keep all EVE character and location names in their original ESI form

## Downloads

### Fast folder version — recommended

Download `MOWAY-V0.9527-fast-folder.zip`, extract the complete folder, and run `MOWAY.exe`.

Do not move only `MOWAY.exe` out of the extracted folder. It requires the DLL files, locale
files, and `resources` folder beside it.

### Single-file portable version

Download `MOWAY-V0.9527-route-optimizer-portable.exe` and run it directly.

The portable version normally starts more slowly because it must extract temporary files
each time it is launched.

## System Requirements

- 64-bit Windows 10 or Windows 11
- Internet access to EVE SSO and ESI
- An EVE Online account
- An EVE Developer application Client ID

## EVE SSO Setup

Create an **Authentication & API Access** application at:

https://developers.eveonline.com/applications

Use this callback URL exactly:

```text
http://127.0.0.1:17890/callback
```

Add these four scopes:

```text
esi-location.read_online.v1
esi-ui.write_waypoint.v1
esi-search.search_structures.v1
esi-universe.read_structures.v1
```

Save the application and paste its public Client ID into **Settings & Security** in MOWAY.

MOWAY uses Authorization Code with PKCE. A desktop PKCE application does not need a Client
Secret, so never enter or share one.

Every user must authorize their own characters through the official EVE SSO page. MOWAY has
no password field and never reads the user's EVE password.

## Basic Usage

1. Configure the EVE application Client ID.
2. Bind each character through official EVE SSO.
3. Select the characters that should receive navigation routes.
4. Enter at least three characters to search for a location.
5. Choose solar systems, NPC stations, or accessible player structures.
6. Add any required intermediate stops.
7. Select a route preference.
8. Optionally enable automatic stop-order optimization.
9. Calculate and review the route.
10. Send it to the selected online characters.

## Route Optimization

Automatic optimization keeps the start fixed and rearranges the remaining stops to minimize
the total number of stargate jumps. The destination can optionally remain fixed.

Ten or fewer stops are recommended. Exact optimization supports up to 15 stops. Routes near
the limit may require many ESI requests and take longer to calculate.

Different stations or player structures in the same system remain separate exact waypoints.
Travel between them costs zero stargate jumps, so MOWAY optimizes inter-system jump order but
does not claim to determine the best in-system order by warp distance.

Optimization does not understand live gate camps, bubbles, wars, hostile groups, or other
tactical conditions. Always review the route before sending it to characters.

## Waypoint Modes

### Write planned stops only

Writes only the selected systems, stations, structures, and intermediate stops. This mode
uses fewer ESI requests.

### Lock the complete route jump by jump

Writes every calculated jump in order. This makes more ESI requests, so long routes and
multiple characters require more time.

Writing a new route clears the character's existing autopilot waypoints.

## Language Support

Use the **EN / 中文** button in the upper-right corner to switch the interface language.
The choice is saved locally.

Only MOWAY interface text is translated. Solar systems, NPC stations, player structures,
character names, and other data received from ESI remain unchanged.

## Local Data and Security

MOWAY stores its local data under:

```text
%APPDATA%\moway
```

The main data file is:

```text
%APPDATA%\moway\navigator-data.json
```

Refresh tokens are encrypted through Electron `safeStorage` and Windows protection. Access
tokens remain in process memory. MOWAY does not include an author server, advertising,
analytics, telemetry, or cloud synchronization.

Do not share:

- Client Secret
- `navigator-data.json`
- The `%APPDATA%\moway` folder
- Access tokens or refresh tokens
- A copy of personal application data containing bound characters
- Configuration files containing a private email address or Discord contact

The current EXE does not have a commercial code-signing certificate. Windows SmartScreen
may therefore display an **Unknown publisher** warning. Obtain MOWAY from a trusted source
and verify its SHA-256 hash.

Read the included Chinese or English safety notice before using MOWAY.

## SHA-256

```text
AF5F01056ADA8939797679ADDFCEE2631F0121571E40D49BA5DFAAC5CE0DED97
MOWAY-V0.9527-fast-folder.zip

51307BBD08E25105F77A04B83791BD7D3B00FFB01DA7943B37DD3D2B1375CB0B
MOWAY-V0.9527-route-optimizer-portable.exe
```

## 中文简介

MOWAY 是一款面向 Windows 的 EVE Online 第三方路线规划工具。

它可以在游戏外规划和保存路线，通过 ESI 将路线批量写入多个已选择且在线的角色。
其特色是精确保留 NPC 空间站和玩家建筑级别的路径点：即使多个停靠点位于同一星系，
程序也不会把它们合并成一个星系点，而会分别写入各自的建筑 ID。

自动优化以总星门跳数最少为目标，固定起点并可选择是否固定终点。推荐不超过 10 个
节点，最多支持 15 个优化节点。同星系建筑之间按 0 个星门跳跃计算，因此程序不会
根据星系内跃迁距离判断建筑先后。

界面支持中文和英文切换，但通过 ESI 取得的星系、空间站、玩家建筑及角色名称始终
保留 EVE 返回的原文。

本程序全部由 AI 编写，未经过独立专业安全审计，不确定安全性，使用请自行承担风险。

## Disclaimer

MOWAY is not affiliated with or endorsed by CCP Games.

EVE Online, ESI, and related names and trademarks belong to CCP hf.

**Author:** Mo Freeman  
**Version:** V0.9527  
**V1.0 may never happen.**
