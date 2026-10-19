# Changelog

## MOWAY V0.9527 — 2026-10-17

### 中文

#### 新增

- 新增路线库文件夹，可自行归类已保存路线。
- 新增路线及路线文件夹重命名。
- 新增拖动路线调整顺序，或将路线移动到其他文件夹。
- 新增路线库导入与导出，可用于路线分享、备份和恢复。
- 新增拖动中间途经点调整顺序；手动拖动时起点和终点保持固定。
- 新增导航角色文件夹，可对绑定角色进行归类。
- 新增角色本机备注。
- 新增拖动角色调整顺序，或将角色移动到其他文件夹。
- 新增中英文 UI 切换；ESI 返回的地点、建筑和角色名称保持原文。
- 新增白底主题，并保留原有深色主题。
- 自动路线优化最多支持 15 个节点，推荐控制在 10 个以内。

#### 调整

- 删除角色文件夹时，其中的角色会移动到“未归类角色”，不会删除角色授权。
- 同一星系内的不同 NPC 空间站或玩家建筑始终保留为独立路径点。
- 路线优化继续以总星门跳数最少为目标；同星系地点之间按 0 跳计算。
- 整体放大界面文字和控件，改善普通及高 DPI 屏幕上的可读性。
- 改善中英文界面以及深色、白底主题下的布局稳定性。

#### 修复

- 修复勾选“自动优化停靠顺序”后，界面底部出现大块白边和布局错位的问题。
- 修复“新建文件夹”按钮点击后没有反应的问题。
- 修复部分环境下新增途经点时可能出现 `Cannot read properties of undefined (reading 'add')` 的问题。
- 修复程序内部请求来源校验过严，导致正常主界面操作被误判为“非 MOWAY 主界面的请求”的问题。

### English

#### Added

- Added route-library folders for organizing saved routes.
- Added route and route-folder renaming.
- Added drag-and-drop route reordering and moving routes between folders.
- Added route-library import and export for sharing, backup, and recovery.
- Added drag-and-drop reordering for intermediate waypoints; the start and destination remain fixed during manual dragging.
- Added navigation-character folders for organizing bound characters.
- Added local character notes.
- Added drag-and-drop character reordering and moving characters between folders.
- Added Chinese/English UI switching; location, structure, and character names returned by ESI remain unchanged.
- Added a light theme while retaining the original dark theme.
- Exact automatic route optimization now supports up to 15 stops; 10 or fewer are recommended.

#### Changed

- Deleting a character folder now moves its characters to **Unfiled Characters** without removing authorization.
- Different NPC stations and player structures in the same solar system always remain separate exact waypoints.
- Route optimization continues to minimize total stargate jumps; locations in the same system count as zero jumps.
- Increased general text and control sizes for improved readability, including on high-DPI displays.
- Improved layout stability across both interface languages and both themes.

#### Fixed

- Fixed the large white blank area and layout shift that could appear after enabling **Optimize stop order automatically**.
- Fixed the **New Folder** button doing nothing.
- Fixed `Cannot read properties of undefined (reading 'add')` that could occur when adding a waypoint in some environments.
- Relaxed an overly strict internal request-origin check that could incorrectly reject legitimate actions from the MOWAY main interface.
