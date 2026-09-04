export type CardMonitorTone = "teal" | "amber" | "rose" | "slate";
export type CardMonitorGroup = "core" | "optional" | "runtime" | "legacy";
export type CardHistoryKind = "feature" | "style" | "baseline" | "cross-card" | "branch";

export type RequirementRecord = {
  id: string;
  source: string;
  original: string;
  must: string;
  landing: string;
  status: string;
  tone: CardMonitorTone;
};

export type CardHistoryRecord = {
  hash: string;
  date: string;
  title: string;
  raw: string;
  kind: CardHistoryKind;
  note: string;
};

export type CardWorkSnapshot = {
  workspaceLabel: string;
  workspacePath: string;
  branch: string;
  branchState: string;
  head: string;
  headTitle: string;
  mergeState: string;
  isolation: string;
  isolationTone: CardMonitorTone;
  pullRequest: string;
  review: string;
  ci: string;
  note: string;
  task?: string;
  priority?: string;
  acceptance?: string;
  changedPaths?: string[];
  linkedWorktreeId?: string;
};

export type CardMonitor = {
  id: string;
  title: string;
  cardId: string;
  group: CardMonitorGroup;
  groupLabel: string;
  status: string;
  tone: CardMonitorTone;
  summary: string;
  goal: string;
  relationship: string;
  dataBoundary: string;
  owner: string;
  repository: string;
  sourcePaths: string[];
  documentPaths: string[];
  requirements: RequirementRecord[];
  milestones: Array<{ hash: string; date: string; label: string; note: string; tone: CardMonitorTone }>;
  history: CardHistoryRecord[];
  work: CardWorkSnapshot;
};

export type WorktreeRecord = {
  id: string;
  label: string;
  kind: "current" | "card" | "integration" | "temporary";
  path: string;
  branch: string;
  head: string;
  headTitle: string;
  status: string;
  statusTone: CardMonitorTone;
  relationship: string;
  cardId?: string;
};

export type DirtyFileRecord = {
  path: string;
  status: string;
  note: string;
};

const REQ_BOUNDARY: RequirementRecord = {
  id: "REQ-BOUNDARY",
  source: "本轮用户原话摘录",
  original: "“我觉得你应该先把项目一个个分清楚吧……你都混在一起了。”",
  must: "先按全局 / 大项目 / 卡片模块 / 独立运行时分层；全局可以汇总，但不能代替单项目视图。",
  landing: "卡片目录、项目层级和当前卡片的独立档案。",
  status: "已落点",
  tone: "teal",
};

const REQ_TWO_LAYERS: RequirementRecord = {
  id: "REQ-TWO-LAYERS",
  source: "本轮用户原话摘录",
  original: "“这是两部分了吧，一部分是项目的监控，一部分是项目工作的监控……项目的架构的一个监控和更新。”",
  must: "把‘项目做什么、为什么做、怎么分’和‘现在在哪条代码线、有没有提交、能否验收’分成两种看法。",
  landing: "项目档案 / 工作现场两个标签页。",
  status: "已落点",
  tone: "teal",
};

const REQ_MEMORY: RequirementRecord = {
  id: "REQ-MEMORY",
  source: "本轮用户原话摘录",
  original: "“你提出了这个需求……后面做着做着你又忘记这些需求了……尤其是原文，一定要记录。”",
  must: "保留原文摘录，同时写清必须满足、落点、证据和当前状态；不把页面本身冒充权威事实源。",
  landing: "每张卡的‘需求原文保真’区块，事实仍回到本地文档和 Git。",
  status: "已落点",
  tone: "amber",
};

const REQ_ISOLATION: RequirementRecord = {
  id: "REQ-ISOLATION",
  source: "本轮用户原话摘录",
  original: "“不要我说一句他给我去隔离一次，而是让我能很清晰地看到这个情况。”",
  must: "持续显示工作树、分支、当前快照、未提交文件、合入状态和并行任务；隔离不是一句口号。",
  landing: "每张卡的‘工作现场’区块和全局并行工作区表。",
  status: "已落点",
  tone: "amber",
};

const REQ_READ_ONLY: RequirementRecord = {
  id: "REQ-READ-ONLY",
  source: "本轮用户原话摘录",
  original: "“不要去动那个仪表盘的代码，最多去看一下，把信息摘下来。”",
  must: "本轮只读取仪表盘生产代码、项目文档和本地 Git；只修改这个独立总览网站与说明文档。",
  landing: "页面页脚的来源声明；本轮不写入 obsidian-plugin/src，也不部署 Vault。",
  status: "本轮遵守",
  tone: "rose",
};

const SHARED_WORKTREE = "D:/AAAcodex项目/仪表盘";
const SHARED_BRANCH = "codex/dashboard-two-layouts";

export const SNAPSHOT_META = {
  date: "2026-09-04",
  source: "本地项目文档 + 本地 Git worktree 快照",
  currentBranch: SHARED_BRANCH,
  currentHead: "44219d8",
  currentHeadTitle: "codex(scratchpad): make card styling single-owner",
  currentStatus: "dirty · 15 个修改 / 删除 / 新增文件",
} as const;

function sharedWork(
  head: string,
  headTitle: string,
  note: string,
  pullRequest = "GitHub 未连接；本地没有可验证的 PR",
): CardWorkSnapshot {
  return {
    workspaceLabel: "当前总工作树（共享现场）",
    workspacePath: SHARED_WORKTREE,
    branch: SHARED_BRANCH,
    branchState: "当前分支；多个卡片曾在同一条开发线上推进",
    head,
    headTitle,
    mergeState: "未合入 master；当前 HEAD 是本地工程总览线",
    isolation: "未完全隔离：这张卡与当前总工作树共用一条分支",
    isolationTone: "amber",
    pullRequest,
    review: "GitHub 未连接；没有真实 PR 就没有真实 Review 记录",
    ci: "本地检查可运行；GitHub Actions 未连接",
    note,
  };
}

function isolatedWork(
  worktreeId: string,
  worktreePath: string,
  branch: string,
  head: string,
  headTitle: string,
  note: string,
): CardWorkSnapshot {
  return {
    workspaceLabel: "卡片专用工作树（并行任务）",
    workspacePath: worktreePath,
    branch,
    branchState: "独立分支；此目录只承载这条卡片线",
    head,
    headTitle,
    mergeState: "尚未合入当前仪表盘分支（本地证据）",
    isolation: "已建立隔离：分支 + 独立工作树",
    isolationTone: "teal",
    pullRequest: "GitHub 未连接；分支尚未形成真实 PR",
    review: "等待 PR；当前只有本地代码快照",
    ci: "本地检查可运行；GitHub Actions 未连接",
    note,
    linkedWorktreeId: worktreeId,
  };
}

const todayHistory: CardHistoryRecord[] = [
  { hash: "a950088", date: "2026-08-26", title: "收口 V38 仪表盘运行时", raw: "codex(plugin): consolidate V38 dashboard runtime", kind: "baseline", note: "当前主线中与今日安排路径相关的最近基线。" },
  { hash: "3a09f2a", date: "2026-08-14", title: "重做夜间事项修订单", raw: "codex(ui): 重做夜间事项修订单", kind: "feature", note: "今日安排的夜间编辑与事项修订表面。" },
  { hash: "521ee11", date: "2026-08-13", title: "重做夜间今日安排放大账本", raw: "codex(ui): 重做夜间今日安排放大账本", kind: "feature", note: "把放大态的安排记录单独落成快照。" },
  { hash: "3482648", date: "2026-08-13", title: "重做夜间主画布与紧凑卡", raw: "codex(ui): 重做夜间主画布与紧凑卡", kind: "style", note: "与多张核心卡共享画布外壳，属于跨表面基线。" },
  { hash: "447a40e", date: "2026-08-09", title: "收口画布交互与拼贴接入", raw: "codex(dashboard): 收口画布交互与赛博拼贴接入", kind: "cross-card", note: "画布层提交，不能当作今日安排单卡历史。" },
];

const ningshiHistory: CardHistoryRecord[] = [
  { hash: "a2689f9", date: "2026-09-02", title: "平衡展开轨道与紧凑控制", raw: "codex(ningshi): balance expanded rails and compact controls", kind: "style", note: "当前主线中最近的凝时卡片快照。" },
  { hash: "2f7864d", date: "2026-09-02", title: "稳定紧凑控制和详情轨道", raw: "codex(ningshi): stabilize compact controls and detail rails", kind: "style", note: "只描述仪表盘里的凝时桥接表面。" },
  { hash: "8e9defd", date: "2026-09-02", title: "补出紧凑会话控制", raw: "codex(ningshi): surface compact session controls", kind: "feature", note: "桥接卡的本机控制入口。" },
  { hash: "730b35c", date: "2026-09-02", title: "把底边扩到安全区", raw: "codex(ningshi): extend bottom edge to minus six percent", kind: "style", note: "展开卡纸面比例调整。" },
  { hash: "38c40d5", date: "2026-09-02", title: "让底边越过外壳", raw: "codex(ningshi): extend bottom edge beyond shell", kind: "style", note: "连续的视觉修订快照。" },
  { hash: "422db00", date: "2026-09-02", title: "调整展开面底边", raw: "codex(ningshi): extend expanded panel bottom edge", kind: "style", note: "连续的视觉修订快照。" },
  { hash: "9e07f37", date: "2026-09-02", title: "恢复展开面拼贴画布", raw: "codex(ningshi): restore collage canvas around expanded panel", kind: "style", note: "恢复凝时展开态与画布关系。" },
  { hash: "8e16e80", date: "2026-09-02", title: "打磨展开面外壳", raw: "codex(ningshi): polish expanded panel shell", kind: "style", note: "凝时外壳的前置修订。" },
];

const requestsHistory: CardHistoryRecord[] = [
  { hash: "a950088", date: "2026-08-26", title: "收口 V38 运行时", raw: "codex(plugin): consolidate V38 dashboard runtime", kind: "baseline", note: "当前主线中与待我决策路径相关的最近基线。" },
  { hash: "98dee3b", date: "2026-08-10", title: "精简项目雷达并保护决策操作", raw: "codex(cards): 精简项目雷达并保护决策操作", kind: "feature", note: "待我决策和项目雷达曾在同一能力收口中共同调整。" },
  { hash: "269ded4", date: "2026-08-09", title: "重做语义项目监控与卡片裁切", raw: "codex(radar): 重做语义项目监控与卡片裁切", kind: "feature", note: "决策入口与项目状态的语义边界。" },
  { hash: "b4c5347", date: "2026-08-09", title: "完成待我决策与项目雷达", raw: "codex(cards): 完成待我决策与项目雷达", kind: "cross-card", note: "真实的跨卡片提交，面板保留这个事实而不是拆假历史。" },
  { hash: "447a40e", date: "2026-08-09", title: "收口画布交互与拼贴接入", raw: "codex(dashboard): 收口画布交互与赛博拼贴接入", kind: "cross-card", note: "画布层共享提交。" },
];

const projectHistory: CardHistoryRecord[] = [
  { hash: "eecc3e5", date: "2026-09-01", title: "细化随手记与项目雷达表面", raw: "codex(cards): refine scratchpad and radar surfaces", kind: "cross-card", note: "同时触及项目雷达和随手记；这是需要回看边界的真实例子。" },
  { hash: "86d411f", date: "2026-09-01", title: "对齐项目雷达阶段按钮", raw: "style(design): FINDING-001 — align radar stage buttons", kind: "style", note: "项目雷达单卡样式提交。" },
  { hash: "98dee3b", date: "2026-08-10", title: "精简项目雷达并保护决策操作", raw: "codex(cards): 精简项目雷达并保护决策操作", kind: "feature", note: "项目雷达的语义与操作边界。" },
  { hash: "269ded4", date: "2026-08-09", title: "重做语义项目监控与卡片裁切", raw: "codex(radar): 重做语义项目监控与卡片裁切", kind: "feature", note: "建立项目雷达的当前语义结构。" },
  { hash: "b4c5347", date: "2026-08-09", title: "完成待我决策与项目雷达", raw: "codex(cards): 完成待我决策与项目雷达", kind: "cross-card", note: "项目雷达与待我决策共同交付。" },
  { hash: "4f71105", date: "2026-08-30", title: "重排项目雷达与随手记纸面", raw: "codex(frontend): 重排项目雷达与随手记纸面", kind: "cross-card", note: "同时改动 project-radar-v8.css 与 scratchpad-v2.css。不是错误，但不是单卡隔离提交。" },
  { hash: "45c3af5", date: "2026-08-31", title: "稳定两卡放大滚动纸面", raw: "codex(frontend): 稳定两卡放大滚动纸面", kind: "cross-card", note: "同时改动项目雷达和随手记样式；面板将其标成跨卡快照。" },
  { hash: "9fdbd35", date: "2026-08-27", title: "让项目雷达与随手记贴合夜间外壳", raw: "codex(ui): align radar and scratchpad with night shells", kind: "cross-card", note: "两张纸面共同调整。" },
];

const reviewHistory: CardHistoryRecord[] = [
  { hash: "3482648", date: "2026-08-13", title: "重做夜间主画布与紧凑卡", raw: "codex(ui): 重做夜间主画布与紧凑卡", kind: "style", note: "本周复盘的当前表面基线。" },
  { hash: "8be8e47", date: "2026-08-12", title: "恢复 V10 并建立源码基线", raw: "codex(plugin): 恢复 V10 并建立源码基线", kind: "baseline", note: "复盘卡依赖的生产基线。" },
  { hash: "447a40e", date: "2026-08-09", title: "收口画布交互与拼贴接入", raw: "codex(dashboard): 收口画布交互与赛博拼贴接入", kind: "cross-card", note: "共享画布层提交。" },
  { hash: "80f49a1", date: "2026-08-05", title: "完成展开态分析表面", raw: "feat(canvas): complete expanded analytics surfaces", kind: "feature", note: "复盘与诊断的展开数据入口。" },
  { hash: "719c37e", date: "2026-08-03", title: "补出功能模块入口", raw: "codex(workbench): add functional module entry points", kind: "feature", note: "早期工作台功能入口。" },
];

const diagnosticsHistory: CardHistoryRecord[] = [
  { hash: "3482648", date: "2026-08-13", title: "重做夜间主画布与紧凑卡", raw: "codex(ui): 重做夜间主画布与紧凑卡", kind: "style", note: "诊断卡当前表面基线。" },
  { hash: "8be8e47", date: "2026-08-12", title: "恢复 V10 并建立源码基线", raw: "codex(plugin): 恢复 V10 并建立源码基线", kind: "baseline", note: "诊断卡的生产基线。" },
  { hash: "80f49a1", date: "2026-08-05", title: "完成展开态分析表面", raw: "feat(canvas): complete expanded analytics surfaces", kind: "feature", note: "诊断数据与展开分析入口。" },
  { hash: "408ed7e", date: "2026-08-01", title: "完成反馈状态", raw: "codex(plugin): complete dashboard feedback states", kind: "feature", note: "异常、空态和反馈状态。" },
  { hash: "1480b7e", date: "2026-08-01", title: "建立候选稳定基线", raw: "codex(dashboard): establish candidate stable baseline", kind: "baseline", note: "诊断卡能追溯到的早期稳定点。" },
];

const scratchpadHistory: CardHistoryRecord[] = [
  { hash: "9e9b592", date: "2026-09-02", title: "下移编辑器横线基线", raw: "codex(scratchpad): lower editor ruling baseline", kind: "style", note: "当前主线最近的随手记快照。" },
  { hash: "1906e67", date: "2026-09-02", title: "保持编辑器横线同步", raw: "codex(scratchpad): keep editor ruling synced", kind: "style", note: "连续的纸面修订。" },
  { hash: "782f3fa", date: "2026-09-02", title: "对齐编辑器横线", raw: "codex(scratchpad): align editor ruling", kind: "style", note: "连续的纸面修订。" },
  { hash: "f708aad", date: "2026-09-02", title: "上移托盘构图", raw: "codex(scratchpad): push tray composition upward", kind: "style", note: "连续的纸面修订。" },
  { hash: "eecc3e5", date: "2026-09-01", title: "细化随手记与项目雷达表面", raw: "codex(cards): refine scratchpad and radar surfaces", kind: "cross-card", note: "与项目雷达共同修改。" },
  { hash: "ad34901", date: "2026-09-01", title: "下移随手记托盘外壳", raw: "style(design): FINDING-002 — lower scratchpad tray shell", kind: "style", note: "随手记单卡样式修订。" },
  { hash: "ca5cd82", date: "2026-08-31", title: "稳定随手记紧凑操作栏", raw: "codex(frontend): 稳定随手记紧凑操作栏", kind: "feature", note: "紧凑态操作入口。" },
  { hash: "4f71105", date: "2026-08-30", title: "重排项目雷达与随手记纸面", raw: "codex(frontend): 重排项目雷达与随手记纸面", kind: "cross-card", note: "与项目雷达共同修改。" },
  { hash: "45c3af5", date: "2026-08-31", title: "稳定两卡放大滚动纸面", raw: "codex(frontend): 稳定两卡放大滚动纸面", kind: "cross-card", note: "与项目雷达共同修改。" },
];

const informationHistory: CardHistoryRecord[] = [
  { hash: "a950088", date: "2026-08-26", title: "收口 V38 仪表盘运行时", raw: "codex(plugin): consolidate V38 dashboard runtime", kind: "baseline", note: "当前主线中信息收集卡能看到的最近基线。" },
  { hash: "fc57742", date: "2026-08-22", title: "打开材料前先卸载放大覆盖层", raw: "codex(info): 打开材料前先卸载放大覆盖层", kind: "feature", note: "材料查看流程的安全边界。" },
  { hash: "30d3177", date: "2026-08-22", title: "完成五平台闭环与采集扩展基线", raw: "codex(info): 信息收集卡五平台闭环与采集扩展基线", kind: "baseline", note: "五平台只读采集基线。" },
  { hash: "0eeab6f", date: "2026-08-21", title: "收口五平台信息收集卡", raw: "codex(information): 收口五平台信息收集卡", kind: "feature", note: "当前信息卡的主要功能收口。" },
  { hash: "3f3a072", date: "2026-08-21", title: "收口五平台信息收集卡", raw: "codex(information): 收口五平台信息收集卡", kind: "feature", note: "另一条平行开发线上的同主题快照。" },
  { hash: "be50ea7", date: "2026-08-19", title: "建立只读多平台采集器", raw: "codex(card): add read-only multi-platform collector", kind: "branch", note: "独立卡片分支的起点。" },
  { hash: "1bf4fa2", date: "2026-08-21", title: "记录五平台信息收集交付", raw: "codex(docs): 记录五平台信息收集交付", kind: "branch", note: "当前独立分支工作树的 HEAD。" },
];

const diaryHistory: CardHistoryRecord[] = [
  { hash: "b978776", date: "2026-08-31", title: "平滑日期录入交互", raw: "codex(diary): smooth date entry interactions", kind: "feature", note: "日记卡专用分支工作树的后续快照。" },
  { hash: "9646615", date: "2026-08-31", title: "加入稳定日记工作台", raw: "codex(diary): add stable journal workbench", kind: "feature", note: "日记卡的主要工作台实现。" },
  { hash: "7242820", date: "2026-08-28", title: "加入日记工作台卡片", raw: "codex(diary): add diary workbench card", kind: "branch", note: "独立卡片分支与工作树的起点。" },
];

const landscapeHistory: CardHistoryRecord[] = [
  { hash: "abe6413", date: "2026-09-01", title: "收口仪表盘与 B 站工具", raw: "codex(dashboard): finalize dashboard and Bilibili speed tool", kind: "cross-card", note: "共享仪表盘收口提交，不能当作知识景观单卡历史。" },
  { hash: "a950088", date: "2026-08-26", title: "收口 V38 仪表盘运行时", raw: "codex(plugin): consolidate V38 dashboard runtime", kind: "baseline", note: "当前主线能看到的最近共享基线。" },
  { hash: "3b38c11", date: "2026-08-17", title: "加入知识景观参考原型", raw: "codex(card): add learning landscape reference prototype", kind: "branch", note: "独立卡片分支与工作树的原型起点。" },
];

const twMonitorHistory: CardHistoryRecord[] = [
  { hash: "3d1da92", date: "2026-09-01", title: "默认图表聚合为 30 分钟", raw: "fix(tw-monitor): default chart aggregation to 30m", kind: "feature", note: "当前主线最近的节点监控快照。" },
  { hash: "da105d4", date: "2026-09-01", title: "硬失败立即切换线路", raw: "fix(tw-monitor): fail over immediately on hard failure", kind: "feature", note: "节点路由失败语义。" },
  { hash: "b6357d1", date: "2026-08-31", title: "让路由生效并打磨卡片外壳", raw: "feat(tw-monitor): make routing effective and polish card shell", kind: "feature", note: "网络监控卡独立运行时接入。" },
];

const bilibiliHistory: CardHistoryRecord[] = [
  { hash: "02c4ad9", date: "2026-09-02", title: "让弹窗立即绘制", raw: "codex(bilibili): render popup immediately", kind: "feature", note: "当前主线最近的浏览器扩展快照。" },
  { hash: "5da7ea0", date: "2026-09-02", title: "完成弹窗预设管理", raw: "codex(bilibili): complete popup preset management", kind: "feature", note: "新建、另存、删除、改名和映射编辑。" },
  { hash: "abe6413", date: "2026-09-01", title: "收口仪表盘与 B 站工具", raw: "codex(dashboard): finalize dashboard and Bilibili speed tool", kind: "cross-card", note: "共享仪表盘与浏览器工具共同收口。" },
];

const milestones = (
  records: CardHistoryRecord[],
  indexes: number[],
  tone: CardMonitorTone = "teal",
) => indexes.map((index) => ({
  hash: records[index].hash,
  date: records[index].date,
  label: records[index].title,
  note: records[index].note,
  tone: records[index].kind === "cross-card" ? "amber" : tone,
}));

export const CARD_MONITORS: CardMonitor[] = [
  {
    id: "today",
    title: "今日安排",
    cardId: "today",
    group: "core",
    groupLabel: "核心卡片",
    status: "当前核心表面",
    tone: "teal",
    summary: "把今天要做、正在做和完成后的记录放在一个可行动入口里。",
    goal: "负责今天的行动面；它不是整个项目的路线图，也不拥有其他卡片的代码。",
    relationship: "个人 AI 仪表盘 → 核心卡片；与待我决策、项目雷达共享画布，不共享业务责任。",
    dataBoundary: "组件和测试在仪表盘仓库；事实数据回到小库的项目 / 任务 Markdown。",
    owner: "仪表盘仓库 · 卡片模块",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/TodayPanel.tsx", "obsidian-plugin/src/ui/TodayCardFlow.test.tsx", "obsidian-plugin/src/layout/layoutTypes.ts"],
    documentPaths: ["docs/project/当前产品路线图.md", "docs/project/架构/04_项目进度汇总与每日规划.md"],
    requirements: [REQ_BOUNDARY, REQ_TWO_LAYERS, REQ_READ_ONLY],
    milestones: milestones(todayHistory, [4, 2, 0]),
    history: todayHistory,
    work: sharedWork(SNAPSHOT_META.currentHead, SNAPSHOT_META.currentHeadTitle, "今日安排没有专用分支；它的代码沿当前仪表盘总线推进。"),
  },
  {
    id: "ningshi",
    title: "凝时",
    cardId: "ningshi",
    group: "core",
    groupLabel: "核心卡片",
    status: "桥接运行时",
    tone: "amber",
    summary: "在仪表盘里显示本机监督入口；真正的凝时运行时仍是另一个独立项目。",
    goal: "提供本机监督状态和常用控制的入口，不把监督力源码、SQLite 或完整历史复制进仪表盘。",
    relationship: "仪表盘卡片 → 监督力独立运行时；两边是桥接关系，不是一个仓库。",
    dataBoundary: "卡片桥接在仪表盘；运行时事实由 D:/AAAcodex项目/监督力 自己负责。",
    owner: "仪表盘桥接 + 监督力独立项目",
    repository: "D:/AAAcodex项目/仪表盘（桥接） · D:/AAAcodex项目/监督力（运行时）",
    sourcePaths: ["obsidian-plugin/src/ui/NingshiPanel.tsx", "obsidian-plugin/src/styles/ningshi-card.css", "obsidian-plugin/src/integrations/"],
    documentPaths: ["docs/project/架构/12_长期产品与体验合同.md", "docs/project/架构/15_项目层级与工程边界.md"],
    requirements: [REQ_BOUNDARY, REQ_TWO_LAYERS, REQ_READ_ONLY],
    milestones: milestones(ningshiHistory, [7, 3, 0], "amber"),
    history: ningshiHistory,
    work: sharedWork(SNAPSHOT_META.currentHead, SNAPSHOT_META.currentHeadTitle, "这里显示的是仪表盘桥接表面的 Git；监督力独立仓库没有被本轮页面冒充成同一条历史。"),
  },
  {
    id: "requests",
    title: "待我决策",
    cardId: "requests",
    group: "core",
    groupLabel: "核心卡片",
    status: "决策入口",
    tone: "rose",
    summary: "把需要你判断、接受、拒绝或补充信息的事项单独拉出来。",
    goal: "让需要人的决定从自动推进队列里分离出来；不替项目雷达承担完整的项目档案。",
    relationship: "个人 AI 仪表盘 → 决策卡片；可引用项目雷达中的项目，但不吞并项目雷达历史。",
    dataBoundary: "卡片组件在仪表盘仓库；决定结果回到受保护的项目 / 需要我 Markdown。",
    owner: "仪表盘仓库 · 卡片模块",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/RequestsPanel.tsx", "obsidian-plugin/src/domain/types.ts", "obsidian-plugin/src/ui/DecisionRadarPanels.test.tsx"],
    documentPaths: ["docs/project/架构/04_项目进度汇总与每日规划.md", "docs/project/当前交接.md"],
    requirements: [REQ_BOUNDARY, REQ_TWO_LAYERS, REQ_MEMORY],
    milestones: milestones(requestsHistory, [2, 1, 0], "rose"),
    history: requestsHistory,
    work: sharedWork(SNAPSHOT_META.currentHead, SNAPSHOT_META.currentHeadTitle, "待我决策与项目雷达曾有共同交付提交；面板将共同提交标为跨卡，而不是硬拆。"),
  },
  {
    id: "projects",
    title: "项目雷达",
    cardId: "projects",
    group: "core",
    groupLabel: "核心卡片",
    status: "重点监控对象",
    tone: "teal",
    summary: "显示项目目标、阶段、阻塞和下一步；它是项目工作的入口，不是 Git 历史的替代物。",
    goal: "把小库里的项目推进投影到可读卡片，同时保持项目原文、路线图和当前交接的权威性。",
    relationship: "个人 AI 仪表盘 → 项目监控卡；下面可以列项目模块，但模块不自动变成独立仓库。",
    dataBoundary: "读取项目投影与 Markdown；代码历史必须按选中卡片的路径过滤，不能把全仓库 log 直接堆进来。",
    owner: "仪表盘仓库 · 项目监控模块",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/ProjectsPanel.tsx", "obsidian-plugin/src/styles/project-radar-v8.css", "obsidian-plugin/src/view/DashboardItemView.ts"],
    documentPaths: [
      "docs/project/当前产品路线图.md",
      "docs/project/当前交接.md",
      "docs/project/架构/卡片/04_项目雷达.md",
      "docs/project/架构/15_项目层级与工程边界.md",
      "docs/project/架构/11_看板画布架构.md",
      "docs/project/架构/12_长期产品与体验合同.md",
      "docs/project/历史日志/2026-09-04_仪表盘产品需求与工作系统完整快照.md",
    ],
    requirements: [REQ_BOUNDARY, REQ_TWO_LAYERS, REQ_MEMORY, REQ_ISOLATION, REQ_READ_ONLY],
    milestones: milestones(projectHistory, [7, 5, 1, 0], "teal"),
    history: projectHistory,
    work: sharedWork(SNAPSHOT_META.currentHead, SNAPSHOT_META.currentHeadTitle, "这是当前最需要治理的卡片：最近仍有与随手记共同修改的提交，说明历史边界还没有完全按卡片隔开。"),
  },
  {
    id: "review",
    title: "本周复盘",
    cardId: "review",
    group: "core",
    groupLabel: "核心卡片",
    status: "周期回看",
    tone: "amber",
    summary: "回答这段时间发生了什么、哪些事情完成了、系统是否需要调整。",
    goal: "把历史转成可读的复盘，而不是让你每天手动翻全部 Commit。",
    relationship: "个人 AI 仪表盘 → 复盘卡；消费项目和任务的结果，但不拥有它们的代码线。",
    dataBoundary: "复盘卡是阅读入口；项目事实仍来自项目 Markdown，代码证据仍来自对应仓库 Git。",
    owner: "仪表盘仓库 · 卡片模块",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/ReviewPanel.tsx", "obsidian-plugin/src/ui/OverviewPanel.tsx"],
    documentPaths: ["docs/project/架构/04_项目进度汇总与每日规划.md", "docs/project/架构/07_上下文检索冲突恢复与历史治理.md"],
    requirements: [REQ_TWO_LAYERS, REQ_MEMORY, REQ_READ_ONLY],
    milestones: milestones(reviewHistory, [3, 1, 0], "amber"),
    history: reviewHistory,
    work: sharedWork(SNAPSHOT_META.currentHead, SNAPSHOT_META.currentHeadTitle, "复盘卡主要随仪表盘工作台基线推进，目前没有自己的卡片分支。"),
  },
  {
    id: "diagnostics",
    title: "数据诊断",
    cardId: "diagnostics",
    group: "core",
    groupLabel: "核心卡片",
    status: "问题定位入口",
    tone: "rose",
    summary: "把缺失、异常、来源和反馈状态放在一个检查入口里。",
    goal: "发现数据和渲染链路的问题，但不直接替其他卡片修改它们的事实源。",
    relationship: "个人 AI 仪表盘 → 诊断卡；观察多个模块，修复仍要回到发生问题的卡片或来源。",
    dataBoundary: "诊断是只读检查入口；具体修复要落在原模块代码、项目文档或受限数据写入点。",
    owner: "仪表盘仓库 · 卡片模块",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/DiagnosticsPanel.tsx", "obsidian-plugin/src/ui/DashboardCardErrorBoundary.tsx"],
    documentPaths: ["docs/project/架构/07_上下文检索冲突恢复与历史治理.md", "docs/project/架构/11_看板画布架构.md"],
    requirements: [REQ_BOUNDARY, REQ_TWO_LAYERS, REQ_ISOLATION],
    milestones: milestones(diagnosticsHistory, [2, 1, 0], "rose"),
    history: diagnosticsHistory,
    work: sharedWork(SNAPSHOT_META.currentHead, SNAPSHOT_META.currentHeadTitle, "诊断卡没有单独工作树；它应该观察冲突，但不和被观察卡片共享一条修复提交。"),
  },
  {
    id: "scratchpad",
    title: "随手记",
    cardId: "scratchpad",
    group: "optional",
    groupLabel: "已接入卡片",
    status: "当前有跨卡历史",
    tone: "amber",
    summary: "快速保存原文和临时想法，后续再决定是否进入项目、决策或日记。",
    goal: "先保留输入原文，再把处理动作和项目归属分开；它不应该覆盖项目雷达的目标记录。",
    relationship: "个人 AI 仪表盘 → 输入卡；可以把内容送往其他流程，但不拥有那些项目的路线图。",
    dataBoundary: "卡片状态回到随手记专用存储；原文和后续归档不能被项目雷达的摘要覆盖。",
    owner: "仪表盘仓库 · 输入模块",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/ScratchpadPanel.tsx", "obsidian-plugin/src/styles/scratchpad-v2.css"],
    documentPaths: ["docs/project/架构/12_长期产品与体验合同.md", "docs/project/当前交接.md"],
    requirements: [REQ_MEMORY, REQ_ISOLATION, REQ_READ_ONLY],
    milestones: milestones(scratchpadHistory, [7, 5, 1, 0], "amber"),
    history: scratchpadHistory,
    work: sharedWork(SNAPSHOT_META.currentHead, SNAPSHOT_META.currentHeadTitle, "随手记最近连续推进，但它和项目雷达共用过几次跨卡提交；重新开始时应优先单独开分支。"),
  },
  {
    id: "information",
    title: "信息收集",
    cardId: "information",
    group: "optional",
    groupLabel: "已接入卡片",
    status: "独立分支待合入",
    tone: "teal",
    summary: "从明确授权的平台收集材料，保留来源和证据，再进入知识处理。",
    goal: "把外部材料的收集和项目决策分开，先留下可追溯的来源，不直接改写项目目标。",
    relationship: "个人 AI 仪表盘 → 信息入口 → 知识 / 项目流程；是输入边界，不是项目雷达的替身。",
    dataBoundary: "生产组件在仪表盘仓库；采集结果和来源证据按信息收集约定写入受限目录。",
    owner: "仪表盘仓库 · 信息收集模块",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/InformationPanel.tsx", "src/information-inbox/InformationInboxCard.tsx", "obsidian-plugin/src/styles/information-inbox-card.css"],
    documentPaths: ["docs/project/当前产品路线图.md", "docs/project/架构/12_长期产品与体验合同.md"],
    requirements: [REQ_BOUNDARY, REQ_MEMORY, REQ_ISOLATION],
    milestones: milestones(informationHistory, [5, 2, 1], "teal"),
    history: informationHistory,
    work: isolatedWork("information-branch", "D:/AAAcodex项目/仪表盘-info-integration", "codex/card-information-inbox", "1bf4fa2", "记录五平台信息收集交付", "真实存在独立卡片工作树；它当前没有合入仪表盘当前分支。"),
  },
  {
    id: "diary",
    title: "日记接入",
    cardId: "diary",
    group: "optional",
    groupLabel: "已接入卡片",
    status: "独立分支待合入",
    tone: "teal",
    summary: "按日记工作台保存每天的原文和整理版本，让日记不和项目推进互相覆盖。",
    goal: "把每日记录保留为独立事实，再按规则向项目或复盘提供摘要。",
    relationship: "个人 AI 仪表盘 → 日记输入；可以被复盘读取，但不直接变成项目雷达的当前状态。",
    dataBoundary: "日记组件和卡片样式在仪表盘仓库；日记数据由日记管线的独立约定负责。",
    owner: "仪表盘仓库 · 日记模块",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/DiaryPanel.tsx", "obsidian-plugin/src/styles/diary-card.css", "obsidian-plugin/src/ui/DiaryCardIntegration.test.tsx"],
    documentPaths: ["docs/project/当前交接.md", "docs/project/架构/04_项目进度汇总与每日规划.md"],
    requirements: [REQ_BOUNDARY, REQ_MEMORY, REQ_ISOLATION],
    milestones: milestones(diaryHistory, [2, 1, 0], "teal"),
    history: diaryHistory,
    work: isolatedWork("diary-branch", "D:/AAAcodex项目/仪表盘-card-diary", "codex/card-diary", "7242820", "加入日记工作台卡片", "真实存在独立卡片工作树；它当前没有合入仪表盘当前分支。"),
  },
  {
    id: "sources",
    title: "知识景观",
    cardId: "sources",
    group: "optional",
    groupLabel: "已接入卡片",
    status: "原型分支待合入",
    tone: "amber",
    summary: "把收集到的来源整理成可阅读的知识关系；它消费材料，不代替来源本身。",
    goal: "形成来源、主题和关系的阅读视图，让知识整理和项目推进有明确的连接点。",
    relationship: "个人 AI 仪表盘 → sources 卡；与信息收集有输入关系，但两张卡保留各自历史。",
    dataBoundary: "组件在仪表盘仓库；根目录 learning-landscape 只保留预览壳，不复制第二套业务组件。",
    owner: "仪表盘仓库 · 知识景观模块",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/KnowledgeLandscapePanel.tsx", "obsidian-plugin/src/styles/landscape-card.css", "src/learning-landscape"],
    documentPaths: ["docs/project/架构/12_长期产品与体验合同.md", "docs/project/当前产品路线图.md"],
    requirements: [REQ_BOUNDARY, REQ_TWO_LAYERS, REQ_ISOLATION],
    milestones: milestones(landscapeHistory, [2, 0], "amber"),
    history: landscapeHistory,
    work: isolatedWork("landscape-branch", "D:/AAAcodex项目/仪表盘-card-learning-landscape", "codex/card-learning-landscape", "3b38c11", "加入知识景观参考原型", "真实存在独立原型工作树；当前分支仍未合入主工作线。"),
  },
  {
    id: "tw-monitor",
    title: "节点监控",
    cardId: "tw-monitor",
    group: "runtime",
    groupLabel: "独立运行时 / 扩展",
    status: "共享分支中的运行时卡",
    tone: "amber",
    summary: "监控本机网络节点和趋势；它是外部运行时入口，不是项目工作状态。",
    goal: "让网络健康状态和项目推进状态分开显示；网络失败不能被误读成项目代码失败。",
    relationship: "个人 AI 仪表盘 → 本机网络运行时；以状态接入，不把网络监控当作业务模块。",
    dataBoundary: "卡片桥接和样式在仪表盘；节点数据由本机网络监控运行时负责。",
    owner: "仪表盘桥接 + 本机网络监控",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/TwMonitorPanel.tsx", "obsidian-plugin/src/styles/tw-monitor-card.css"],
    documentPaths: ["docs/project/架构/15_项目层级与工程边界.md", "docs/project/当前交接.md"],
    requirements: [REQ_BOUNDARY, REQ_TWO_LAYERS, REQ_READ_ONLY],
    milestones: milestones(twMonitorHistory, [2, 1, 0], "amber"),
    history: twMonitorHistory,
    work: isolatedWork("runtime-monitor-branch", "D:/AAAcodex项目/仪表盘-card-runtime-monitor", "codex/card-runtime-monitor", "bb99c70", "加入独立运行时监控原型", "有独立原型工作树；当前主线还显示了后续共享分支中的运行时修订。"),
  },
  {
    id: "bilibili-speed",
    title: "B 站倍速",
    cardId: "bilibili-speed",
    group: "runtime",
    groupLabel: "独立运行时 / 扩展",
    status: "浏览器扩展入口",
    tone: "slate",
    summary: "把 B 站当前页面的倍速控制送到本机扩展，不参与项目规划。",
    goal: "保持浏览器小工具和仪表盘业务卡片的代码、发布和问题边界分开。",
    relationship: "个人 AI 仪表盘 → 浏览器扩展入口；属于外部工具接入，不是项目雷达子模块。",
    dataBoundary: "卡片桥接和弹窗入口在当前仓库；浏览器扩展本身按独立工具边界验收。",
    owner: "仪表盘桥接 + 浏览器扩展",
    repository: SHARED_WORKTREE,
    sourcePaths: ["obsidian-plugin/src/ui/BilibiliSpeedPanel.tsx", "obsidian-plugin/src/styles/bilibili-speed-card.css", "bilibili-speed-tool"],
    documentPaths: ["docs/project/架构/15_项目层级与工程边界.md", "docs/project/当前交接.md"],
    requirements: [REQ_BOUNDARY, REQ_ISOLATION, REQ_READ_ONLY],
    milestones: milestones(bilibiliHistory, [2, 1, 0], "slate"),
    history: bilibiliHistory,
    work: sharedWork(SNAPSHOT_META.currentHead, SNAPSHOT_META.currentHeadTitle, "B 站工具目前和仪表盘总线共享当前工作树；如果要持续迭代，应把扩展单独开线。"),
  },
];

export const LEGACY_CARD_RECORDS: Array<{ id: string; title: string; note: string }> = [
  { id: "agenda", title: "日程", note: "保留布局 / 解析兼容，当前不作为主工作台卡片。" },
  { id: "focus", title: "专注", note: "保留布局 / 解析兼容，当前不作为主工作台卡片。" },
  { id: "deadline", title: "截止日期", note: "保留布局 / 解析兼容，当前不作为主工作台卡片。" },
  { id: "life", title: "生活", note: "保留布局 / 解析兼容，当前不作为主工作台卡片。" },
  { id: "workload", title: "工作负荷", note: "保留布局 / 解析兼容，当前不作为主工作台卡片。" },
  { id: "rhythm", title: "节奏", note: "保留布局 / 解析兼容，当前不作为主工作台卡片。" },
  { id: "tomorrow", title: "明日", note: "保留布局 / 解析兼容，当前不作为主工作台卡片。" },
  { id: "completed", title: "已完成", note: "保留布局 / 解析兼容，当前不作为主工作台卡片。" },
  { id: "activity", title: "活动", note: "保留布局 / 解析兼容，当前不作为主工作台卡片。" },
  { id: "qq", title: "QQ 外部来源", note: "保留布局 / 解析兼容；当前没有独立登记的卡片迭代线。" },
];

export const GLOBAL_DIRTY_FILES: DirtyFileRecord[] = [
  { path: "CODEX_HISTORY.md", status: "M", note: "历史记录文件；当前来源待核对，不能自动归给某张卡。" },
  { path: "docs/project/当前交接.md", status: "M", note: "项目交接文件；可能包含当前任务和前序任务的连续记录。" },
  { path: "docs/project/当前产品路线图.md", status: "M", note: "本轮同步产品核心需求和工程总览入口；不属于任意一张业务卡。" },
  { path: "docs/project/架构/12_长期产品与体验合同.md", status: "M", note: "本轮沉淀长期需求合同；不属于任意一张业务卡。" },
  { path: "docs/project/架构/15_项目层级与工程边界.md", status: "M", note: "本轮同步对象层级与列式记录边界；不属于任意一张业务卡。" },
  { path: "docs/project/架构/卡片/04_项目雷达.md", status: "M", note: "本轮补充项目雷达/工程总览卡的 One-shot、Loop 和 Harness 合同。" },
  { path: "docs/project/项目索引.md", status: "M", note: "本轮增加需求快照入口；不属于任意一张业务卡。" },
  { path: "obsidian-plugin/scripts/install-to-vault-lib.mjs", status: "M", note: "安装脚本；不属于本轮卡片网站变更。" },
  { path: "obsidian-plugin/scripts/install-to-vault.test.ts", status: "M", note: "安装脚本测试；不属于本轮卡片网站变更。" },
  { path: "src/engineering/EngineeringControlRoom.tsx", status: "M", note: "本轮工程总览网站；不归给任何仪表盘卡片。" },
  { path: "src/engineering/EngineeringControlRoom.test.tsx", status: "M", note: "本轮工程总览网站测试；不归给任何仪表盘卡片。" },
  { path: "src/engineering/cardMonitoringData.ts", status: "M", note: "本轮工程总览快照数据；不归给任何仪表盘卡片。" },
  { path: "src/engineering/engineering.css", status: "M", note: "本轮工程总览网站样式；不归给任何仪表盘卡片。" },
  { path: "src/engineering/CardMonitoringSection.tsx", status: "D", note: "本轮移除旧的选中式重复卡片详情组件；不归给任何仪表盘卡片。" },
  { path: "docs/project/历史日志/2026-09-04_仪表盘产品需求与工作系统完整快照.md", status: "??", note: "本轮需求原文和产品关系的完整快照；待文档收口后单独归档。" },
];

export const WORKTREE_RECORDS: WorktreeRecord[] = [
  {
    id: "current-dashboard",
    label: "当前仪表盘工作树",
    kind: "current",
    path: "D:/AAAcodex项目/仪表盘",
    branch: "codex/dashboard-two-layouts",
    head: SNAPSHOT_META.currentHead,
    headTitle: SNAPSHOT_META.currentHeadTitle,
    status: "dirty · 15 个修改 / 删除 / 新增文件",
    statusTone: "amber",
    relationship: "共享总工作树；本轮总览网站就在这里。",
  },
  {
    id: "diary-branch",
    label: "日记卡片任务",
    kind: "card",
    path: "D:/AAAcodex项目/仪表盘-card-diary",
    branch: "codex/card-diary",
    head: "7242820",
    headTitle: "加入日记工作台卡片",
    status: "dirty · 1 个未提交文件",
    statusTone: "teal",
    relationship: "日记接入；尚未合入当前仪表盘分支。",
    cardId: "diary",
  },
  {
    id: "information-branch",
    label: "信息收集卡片任务",
    kind: "card",
    path: "D:/AAAcodex项目/仪表盘-card-information-inbox",
    branch: "codex/card-information-inbox",
    head: "1bf4fa2",
    headTitle: "记录五平台信息收集交付",
    status: "dirty · 1 个未提交文件",
    statusTone: "teal",
    relationship: "信息收集；尚未合入当前仪表盘分支。",
    cardId: "information",
  },
  {
    id: "landscape-branch",
    label: "知识景观任务",
    kind: "card",
    path: "D:/AAAcodex项目/仪表盘-card-learning-landscape",
    branch: "codex/card-learning-landscape",
    head: "3b38c11",
    headTitle: "加入知识景观参考原型",
    status: "dirty · 2 个未提交文件",
    statusTone: "amber",
    relationship: "知识景观；原型尚未合入当前仪表盘分支。",
    cardId: "sources",
  },
  {
    id: "runtime-monitor-branch",
    label: "节点监控任务",
    kind: "card",
    path: "D:/AAAcodex项目/仪表盘-card-runtime-monitor",
    branch: "codex/card-runtime-monitor",
    head: "bb99c70",
    headTitle: "加入独立运行时监控原型",
    status: "dirty · 1 个未提交文件",
    statusTone: "amber",
    relationship: "节点监控；原型尚未合入当前仪表盘分支。",
    cardId: "tw-monitor",
  },
  {
    id: "usage-branch",
    label: "使用统计任务",
    kind: "card",
    path: "D:/AAAcodex项目/电脑使用统计实验区/dashboard-integration",
    branch: "codex/usage-tracking-card",
    head: "547549a",
    headTitle: "对齐使用统计卡表面",
    status: "dirty · 1 个未提交文件",
    statusTone: "amber",
    relationship: "仪表盘外的使用统计卡；当前未列入仪表盘 CARD_IDS 主线。",
  },
  {
    id: "temp-5523",
    label: "临时任务工作区 5523",
    kind: "temporary",
    path: "C:/Users/DevonSage/.codex/worktrees/5523/仪表盘",
    branch: "detached HEAD",
    head: "1fe0fb5",
    headTitle: "无分支快照",
    status: "dirty · 1 个未提交文件 · detached",
    statusTone: "slate",
    relationship: "其他任务留下的临时工作区；没有分支名，不能直接当作可合入卡片。",
  },
  {
    id: "temp-61b6",
    label: "临时任务工作区 61b6",
    kind: "temporary",
    path: "C:/Users/DevonSage/.codex/worktrees/61b6/仪表盘",
    branch: "detached HEAD",
    head: "1fe0fb5",
    headTitle: "无分支快照",
    status: "dirty · 1 个未提交文件 · detached",
    statusTone: "slate",
    relationship: "其他任务留下的临时工作区；需要先确认归属再处理。",
  },
  {
    id: "temp-90f0",
    label: "临时任务工作区 90f0",
    kind: "temporary",
    path: "C:/Users/DevonSage/.codex/worktrees/90f0/仪表盘",
    branch: "detached HEAD",
    head: "1fe0fb5",
    headTitle: "无分支快照",
    status: "dirty · 1 个未提交文件 · detached",
    statusTone: "slate",
    relationship: "其他任务留下的临时工作区；需要先确认归属再处理。",
  },
  {
    id: "info-integration",
    label: "信息集成临时区",
    kind: "integration",
    path: "D:/AAAcodex项目/仪表盘-info-integration",
    branch: "detached HEAD",
    head: "da0a55a",
    headTitle: "信息收集集成快照",
    status: "dirty · 1 个未提交文件 · detached",
    statusTone: "slate",
    relationship: "信息收集的临时集成快照；不要和正式分支的提交混算。",
    cardId: "information",
  },
  {
    id: "formal-integration-v2",
    label: "正式集成 v2",
    kind: "integration",
    path: "D:/AAAcodex项目/电脑使用统计实验区/formal-integration-v2",
    branch: "detached HEAD",
    head: "d8e2bc5",
    headTitle: "凝时展开工作台",
    status: "dirty · 66 个未提交文件 · detached",
    statusTone: "slate",
    relationship: "整合实验区；不代表当前仪表盘主线。",
  },
  {
    id: "merge-base-33fc583",
    label: "合并基线 33fc583",
    kind: "integration",
    path: "D:/AAAcodex项目/电脑使用统计实验区/merge-base-33fc583",
    branch: "detached HEAD",
    head: "33fc583",
    headTitle: "并行任务合并基线",
    status: "dirty · 1 个未提交文件 · detached",
    statusTone: "slate",
    relationship: "用于比较并行任务，不是可直接发布的分支。",
  },
  {
    id: "release-integration-v3",
    label: "发布集成 v3",
    kind: "integration",
    path: "D:/AAAcodex项目/电脑使用统计实验区/release-integration-v3",
    branch: "detached HEAD",
    head: "2bbf301",
    headTitle: "记录运行时重启",
    status: "clean",
    statusTone: "slate",
    relationship: "发布整合实验区；不等于当前主线已发布。",
    cardId: "tw-monitor",
  },
];

export const CROSS_CARD_EXAMPLES = [
  {
    hash: "4f71105",
    title: "重排项目雷达与随手记纸面",
    cards: "项目雷达 + 随手记",
    detail: "一个 Commit 同时触及 project-radar-v8.css 与 scratchpad-v2.css；这不是 Git 错误，但回滚、评审和归因会更难。",
  },
  {
    hash: "45c3af5",
    title: "稳定两卡放大滚动纸面",
    cards: "项目雷达 + 随手记",
    detail: "同一提交同时改动两张卡的样式；应作为跨卡基础修订保留，之后的新功能最好拆开。",
  },
  {
    hash: "eecc3e5",
    title: "细化随手记与项目雷达表面",
    cards: "项目雷达 + 随手记",
    detail: "最近的真实跨卡提交；面板不会把它伪造成两个独立快照。",
  },
];

export const ISOLATION_RULES = [
  { number: "01", label: "一张卡 / 一个目标", detail: "先写清这次只解决哪张卡、哪件事；跨卡就明确标成共同基础任务。" },
  { number: "02", label: "一条分支 / 一个工作树", detail: "分支是代码线路，工作树是这条线路在磁盘上的独立目录；两者一起才能隔开未提交现场。" },
  { number: "03", label: "一个逻辑改变 / 一个提交", detail: "Commit 是可回溯快照；不要把雷达、随手记和安装脚本顺手塞进同一个快照。" },
  { number: "04", label: "检查后再合入", detail: "先跑本地测试、类型检查和构建，再由 PR / 评审 / CI 决定是否进入主线。" },
];

