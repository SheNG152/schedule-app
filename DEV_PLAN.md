# 个人日程管理系统 — 开发计划

> 基于 PRD.md v1.0 | 创建日期：2026-09-25

---

## 技术选型

| 项目 | 选择 | 理由 |
|------|------|------|
| 前端框架 | React 18 + Vite | 组件化开发，Vite 构建速度快，生态成熟 |
| 语言 | JavaScript (JSX) | 降低复杂度，适合第一版快速交付 |
| 数据存储 | localStorage | 无需后端，浏览器原生支持，满足个人使用场景 |
| 样式方案 | 原生 CSS + CSS Grid | 无额外依赖，CSS Grid 天然适合课表网格布局 |
| 通知 | Browser Notification API | 浏览器原生，无需第三方服务 |
| 部署 | Vite build → 静态文件托管 | 纯前端项目，构建后为静态文件，可部署到任意静态托管 |

---

## 项目文件结构

```
schedule-app/
├── PRD.md                  # 产品需求文档
├── DEV_PLAN.md             # 本开发计划
├── index.html              # HTML 入口
├── package.json            # 依赖配置
├── vite.config.js          # Vite 构建配置
└── src/
    ├── main.jsx            # React 入口
    ├── index.css           # 全局基础样式
    ├── App.jsx             # 主组件（框架 + Tab 路由）
    ├── App.css             # 应用样式（布局 + 响应式）
    ├── data.js             # 数据层（课程、校历、作息时间）
    ├── storage.js          # 存储层（localStorage 封装 + 通知）
    ├── components/
    │   ├── Home.jsx        # 首页组件
    │   ├── Home.css        # 首页样式
    │   ├── WeeklySchedule.jsx  # 周课表组件
    │   ├── WeeklySchedule.css  # 周课表样式
    │   ├── TodoList.jsx    # 待办组件
    │   └── TodoList.css    # 待办样式
    └── hooks/
        └── useWeek.js      # 周次计算 Hook
```

---

## 阶段总览

```
阶段 1: 项目初始化 + 数据层
    │
    ▼
阶段 2: 应用框架 + 导航
    │
    ├──▶ 阶段 3: 周课表模块 ──┐
    │                        │
    ├──▶ 阶段 4: 待办模块 ────┼──▶ 阶段 5: 首页模块（依赖 3+4）
    │                        │
    └──▶ (3 和 4 可并行)      │
                             ▼
                        阶段 6: 通知 + 响应式打磨
                             │
                             ▼
                        阶段 7: 构建 + 部署
```

---

## 阶段 1：项目初始化 + 数据层

**目标**：搭建项目骨架，定义所有静态数据和存储接口。

### 需要创建的文件

| 文件 | 内容 |
|------|------|
| `package.json` | 依赖：react, react-dom, vite, @vitejs/plugin-react |
| `vite.config.js` | Vite 配置，启用 React 插件 |
| `index.html` | HTML 入口，挂载 React 根节点 |
| `src/main.jsx` | React 入口，渲染 `<App />` |
| `src/index.css` | 全局 reset 样式 |
| `src/data.js` | 课程数据、校历常量、作息时间、周次计算函数 |
| `src/storage.js` | localStorage 读写封装、通知权限/发送函数 |

### 关键函数/数据

**`src/data.js`**：
- `COURSES` — 14门课程的数组，每门包含 id, name, teacher, weeks[], location, day, startPeriod, endPeriod
- `CALENDAR` — 校历常量（开学日期、总周数）
- `DAY_NAMES` — ['周一'...'周日']
- `TIME_SLOTS` — 14节课的时间段数组
- `getCurrentWeek()` — 根据今天日期和开学日计算当前周次

**`src/storage.js`**：
- `loadTodos()` / `saveTodos(todos)` — 待办列表读写
- `addTodo(todo)` / `updateTodo(id, updates)` / `deleteTodo(id)` — CRUD 操作
- `requestNotificationPermission()` — 请求浏览器通知权限
- `sendNotification(title, body)` — 发送浏览器通知
- `getNotifiedIds()` / `addNotifiedId(id)` — 防重复通知

### 完成标准
- [ ] `npm run dev` 能启动，页面显示空白但无报错
- [ ] `data.js` 中 14 门课程数据与 PRD 附录完全一致
- [ ] `getCurrentWeek()` 在 2026-09-25 返回 3
- [ ] `storage.js` 中 addTodo/updateTodo/deleteTodo 操作后 localStorage 数据正确变化

---

## 阶段 2：应用框架 + 导航

**目标**：搭建页面整体布局，实现 Tab 切换。

### 需要创建/修改的文件

| 文件 | 内容 |
|------|------|
| `src/App.jsx` | 主组件：Header + Tab Nav + 内容区占位 |
| `src/App.css` | 布局样式：顶栏、Tab 导航、响应式断点 |

### 关键组件/逻辑

**`App` 组件**：
- 状态：`activeTab`（'home' | 'weekly' | 'todos'）
- 顶栏：显示「📚 课程表」+ 当前周次（调用 `getCurrentWeek()`）
- Tab 导航：三个按钮，点击切换 `activeTab`
- 内容区：根据 `activeTab` 渲染对应组件（阶段 3-5 再填充）

**`App.css`**：
- CSS 变量定义（颜色、间距、圆角）
- 顶栏样式（渐变背景、白色文字）
- Tab 导航样式（底部边框指示当前选中）
- 响应式断点：768px（平板/手机分界）、480px（小屏手机）

### 完成标准
- [ ] 页面显示蓝色顶栏，标题「📚 课程表」和「第 3 周」
- [ ] 三个 Tab 按钮可见，点击后视觉状态切换（高亮/边框）
- [ ] 内容区随 Tab 切换显示不同占位文字
- [ ] 手机宽度下 Tab 正常排列，不溢出

---

## 阶段 3：周课表模块

**目标**：实现完整的周课表网格视图。

**依赖**：阶段 1（数据层）、阶段 2（应用框架）

### 需要创建的文件

| 文件 | 内容 |
|------|------|
| `src/components/WeeklySchedule.jsx` | 周课表组件 |
| `src/components/WeeklySchedule.css` | 课表网格样式 |

### 关键组件/逻辑

**`WeeklySchedule` 组件**：
- 接收当前周次（从 `getCurrentWeek()` 获取）
- 过滤课程：`COURSES.filter(c => c.weeks.includes(week))`
- 渲染 CSS Grid：8列（1时间 + 7天）× 15行（1表头 + 14节次）
- 课程块定位：`gridColumn: day + 1`，`gridRow: startPeriod + 1 / span (endPeriod - startPeriod + 1)`
- 课程块内容：课程名、教师、教室（文字溢出省略）

**`WeeklySchedule.css`**：
- Grid 布局：`grid-template-columns: 80px repeat(7, 1fr)`
- 表头行：浅蓝背景，星期名称居中
- 时间列：灰色背景，显示节次编号 + 时间段
- 课程块：浅蓝背景 + 左侧蓝色边框，圆角
- 响应式：小屏下减小列宽，允许横向滚动

### 完成标准
- [ ] 点击「周课表」Tab 显示完整网格（7天 × 14节）
- [ ] 14门课程全部出现在正确位置（PRD 验收 C1）
- [ ] 多节次课程正确纵向合并（PRD 验收 C2）
- [ ] 周次显示正确（PRD 验收 C3）
- [ ] 每门课显示课程名、教师、教室（PRD 验收 C4）
- [ ] 手机宽度下课表可横向滚动（PRD 验收 C5）

---

## 阶段 4：待办模块

**目标**：实现待办事项的完整 CRUD。

**依赖**：阶段 1（数据层）、阶段 2（应用框架）

### 需要创建的文件

| 文件 | 内容 |
|------|------|
| `src/components/TodoList.jsx` | 待办组件 |
| `src/components/TodoList.css` | 待办样式 |

### 关键组件/逻辑

**`TodoList` 组件**：
- 状态：`todos`（从 `loadTodos()` 初始化）、`newText`、`newDate`
- 添加：输入文字 + 可选日期 → 调用 `addTodo()` → 更新状态
- 完成：点击复选框 → 调用 `updateTodo(id, {completed})` → 切换状态
- 删除：点击 ✕ → 调用 `deleteTodo(id)` → 从列表移除
- 渲染：待办列表，已完成项文字加删除线，显示日期标签

**`TodoList.css`**：
- 表单布局：输入框 + 日期选择器 + 添加按钮（横向排列）
- 列表项：复选框 + 文字 + 日期标签 + 删除按钮
- 已完成样式：文字删除线 + 灰色
- 响应式：小屏下表单纵向排列

### 完成标准
- [ ] 可以添加待办，列表出现新项（PRD 验收 T1）
- [ ] 点击复选框标记完成，文字出现删除线（PRD 验收 T2）
- [ ] 点击 ✕ 删除待办，该项消失（PRD 验收 T3）
- [ ] 刷新页面后待办数据仍在（PRD 验收 T4）
- [ ] 添加时可选日期，列表中显示日期标签（PRD 验收 T5）

---

## 阶段 5：首页模块

**目标**：实现今日总览，聚合课程和待办信息。

**依赖**：阶段 1（数据层）、阶段 2（应用框架）、阶段 3（周课表数据）、阶段 4（待办数据）

> 首页从阶段 3 的课程数据和阶段 4 的待办数据中提取今日信息，因此需要等 3 和 4 完成后开发。

### 需要创建的文件

| 文件 | 内容 |
|------|------|
| `src/components/Home.jsx` | 首页组件 |
| `src/components/Home.css` | 首页样式 |

### 关键组件/逻辑

**`Home` 组件**：
- 计算今天星期几：`new Date().getDay()`（周日=0 转为 7）
- 获取当前周次：`getCurrentWeek()`
- 筛选今日课程：`COURSES.filter(c => c.day === todayDay && c.weeks.includes(week))`
- 按开始时间排序课程
- 课程卡片渲染：时间范围（startPeriod 开始时间 - endPeriod 结束时间）、课程名、教师·教室
- 空状态：无课时显示「今天没有课 🎉」
- 内嵌待办快捷操作（复用 TodoList 的添加逻辑，或引用 TodoList 组件）

**`Home.css`**：
- 课程卡片：左侧蓝色竖条 + 浅蓝背景 + 圆角
- 时间文字：蓝色加粗
- 课程名：大号加粗
- 教师/教室：小号灰色
- 分割线分隔课程区和待办区

### 完成标准
- [ ] 首页顶部显示「今天 (周X)」和「第 X 周」（PRD 验收 H1, H2）
- [ ] 今日课程按时间从早到晚排列（PRD 验收 H3）
- [ ] 课程时间显示正确格式如「08:00 - 11:25」（PRD 验收 H4）
- [ ] 周末打开显示「今天没有课 🎉」（PRD 验收 H5）
- [ ] 首页底部显示待办列表，可快速添加

---

## 阶段 6：通知 + 响应式打磨

**目标**：添加课前提醒通知，全面测试响应式。

**依赖**：阶段 3-5（所有模块完成）

### 需要修改的文件

| 文件 | 修改内容 |
|------|----------|
| `src/components/Home.jsx` | 添加通知检查逻辑（组件挂载时 + 定时轮询） |
| `src/App.css` | 微调响应式细节 |

### 关键逻辑

**通知检查**（在 Home 组件 `useEffect` 中）：
1. 页面加载时调用 `requestNotificationPermission()`
2. 计算当前时间距下一节课的分钟差
3. 如果差值在 0-30 分钟内且未通知过 → 调用 `sendNotification()`
4. 记录已通知的课程 ID，避免重复
5. 每分钟轮询一次（`setInterval`）

**响应式打磨**：
- 375px 宽度下全面检查：Tab 不挤压、课表可滚动、待办表单不换行错乱
- 1200px 宽度下检查：课表不显得过宽、留白合理

### 完成标准
- [ ] 首次打开时浏览器弹出通知权限请求（PRD 验收 G3）
- [ ] 课前 30 分钟内收到浏览器通知
- [ ] 同一节课不重复通知
- [ ] 375px 和 1200px 宽度下均无布局错乱（PRD 验收 G1）
- [ ] 浏览器 Console 无红色报错（PRD 验收 G4）

---

## 阶段 7：构建 + 部署

**目标**：生产构建，部署到可访问的 URL。

**依赖**：阶段 6（所有功能完成）

### 执行步骤

1. 运行 `npm run build` 生成 `dist/` 目录
2. 选择部署方案（以下任选其一）：
   - **方案 A**：直接用浏览器打开 `dist/index.html`（纯本地使用）
   - **方案 B**：部署到 GitHub Pages（免费，需 GitHub 仓库）
   - **方案 C**：部署到 Netlify/Vercel（拖拽 `dist/` 文件夹即可）
3. 验证部署后的 URL 功能正常

### 完成标准
- [ ] `npm run build` 无报错，生成 `dist/` 目录
- [ ] 部署后 URL 可访问，三个 Tab 功能正常
- [ ] 刷新页面数据不丢失
- [ ] 手机端浏览器访问布局正常

---

## 阶段依赖关系总结

```
阶段 1 (数据层)
  │
  ├── 无依赖，最先执行
  │
  ▼
阶段 2 (应用框架)
  │
  ├── 依赖阶段 1
  │
  ▼
阶段 3 (周课表) ──┐
  │               │
  ├── 依赖阶段 1+2 │
  │               ▼
阶段 4 (待办) ──────▶ 阶段 5 (首页)
  │               │       │
  ├── 依赖阶段 1+2 │       ├── 依赖阶段 1+2+3+4
  │               │       │
  └── 可与阶段 3   │       ▼
      并行开发     │   阶段 6 (通知+打磨)
                  │       │
                  │       ├── 依赖阶段 3+4+5
                  │       │
                  └───────┘
                          ▼
                      阶段 7 (部署)
                        │
                        ├── 依赖阶段 6
                        │
                        └── 最终交付
```

**并行机会**：阶段 3（周课表）和阶段 4（待办）互不依赖，可以同时开发。

---

## 当前进度

| 阶段 | 状态 | 说明 |
|------|------|------|
| 阶段 1 | ✅ 已完成 | data.js、storage.js 已创建 |
| 阶段 2 | ✅ 已完成 | App.jsx 框架 + Tab 导航已实现 |
| 阶段 3 | ✅ 已完成 | WeeklySchedule 组件已实现，CSS Grid 课表正常 |
| 阶段 4 | ✅ 已完成 | TodoList 组件已实现，CRUD + 持久化正常 |
| 阶段 5 | ✅ 已完成 | Home 组件已实现，今日课程 + 待办聚合正常 |
| 阶段 6 |  部分完成 | 通知逻辑已写入，需实际测试提醒触发 |
| 阶段 7 | ⬜ 未开始 | 未进行生产构建和部署 |
