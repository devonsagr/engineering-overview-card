import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import {
  Archive,
  ArrowDown,
  ArrowRight,
  BookOpen,
  Boxes,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Code2,
  FolderTree,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  History,
  LayoutDashboard,
  Link2,
  ListChecks,
  MessageSquare,
  Moon,
  PanelLeft,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Workflow,
} from "lucide-react";
import {
  CARD_MONITORS,
  CROSS_CARD_EXAMPLES,
  GLOBAL_DIRTY_FILES,
  ISOLATION_RULES,
  LEGACY_CARD_RECORDS,
  SNAPSHOT_META,
  WORKTREE_RECORDS,
  type CardHistoryRecord,
  type CardMonitor,
  type CardMonitorGroup,
  type CardMonitorTone,
  type CardWorkSnapshot,
  type WorktreeRecord,
} from "./cardMonitoringData";

type Theme = "day" | "night";
type SectionId = "overview" | "map" | "archive" | "loop" | "work" | "conflicts";
type ScopeId = "all" | "core" | "optional" | "runtime" | "independent";
type Tone = CardMonitorTone;

type ObjectRecord = {
  id: string;
  level: 0 | 1 | 2;
  title: string;
  kindLabel: string;
  status: string;
  tone: Tone;
  summary: string;
  goal: string;
  relationship: string;
  boundary: string;
  owner: string;
  repository: string;
  sourcePaths: string[];
  documentPaths: string[];
  source: string;
  route: string[];
  history: CardHistoryRecord[];
  milestones: Array<{ hash: string; date: string; label: string; note: string; tone: Tone }>;
  requirements: CardMonitor["requirements"];
  work: CardWorkSnapshot;
  group?: CardMonitorGroup;
  parent?: string;
};

type LoopView = "one-shot" | "iteration";
type LoopUnitStatus = "verified" | "evidence" | "active" | "waiting" | "untracked";
type LoopUnit = {
  label: string;
  status: LoopUnitStatus;
  note: string;
  evidence: string;
  registered: boolean;
  documentPaths: string[];
  codePaths: string[];
  requirements: CardMonitor["requirements"];
  history: CardHistoryRecord[];
};
type LoopSnapshot = {
  modeLabel: string;
  modeTone: Tone;
  stage: string;
  progress: string;
  progressNote: string;
  progressFormula: string;
  checkpoint: string;
  checkpointSource: string;
  next: string;
  units: LoopUnit[];
};

type ScopeMeta = { label: string; note: string; icon: ElementType };

const GROUP_ORDER: CardMonitorGroup[] = ["core", "optional", "runtime"];

const GROUP_META: Record<CardMonitorGroup, ScopeMeta> = {
  core: { label: "核心卡片", note: "今天会直接使用的主模块", icon: LayoutDashboard },
  optional: { label: "输入 / 知识卡片", note: "收集、日记和认知边界", icon: Boxes },
  runtime: { label: "运行时 / 扩展", note: "只登记桥接关系，不吞并外部工程", icon: Link2 },
  legacy: { label: "兼容记录", note: "旧布局可识别，但不进入当前工作线", icon: Archive },
};

const HISTORY_KIND_LABELS: Record<CardHistoryRecord["kind"], string> = {
  feature: "功能",
  style: "样式",
  baseline: "基线",
  "cross-card": "跨卡",
  branch: "分支",
};

const LOOP_STATUS_LABELS: Record<LoopUnitStatus, string> = {
  verified: "已验收",
  evidence: "有资料",
  active: "当前现场",
  waiting: "待验收",
  untracked: "未登记",
};

const LOOP_STATUS_TONES: Record<LoopUnitStatus, Tone> = {
  verified: "teal",
  evidence: "teal",
  active: "amber",
  waiting: "amber",
  untracked: "slate",
};

const NON_CODE_WORK: CardWorkSnapshot = {
  workspaceLabel: "不适用 · 非本地代码工作树",
  workspacePath: "—",
  branch: "—",
  branchState: "该对象不是当前仓库中的一条代码线",
  head: "—",
  headTitle: "没有本地 Git 快照",
  mergeState: "不适用",
  isolation: "不适用 · 全局目录或平级外部工程",
  isolationTone: "slate",
  pullRequest: "不适用 · 本页没有读取该外部工程",
  review: "不适用 · 本页没有读取该外部工程",
  ci: "不适用 · 本页没有读取该外部工程",
  note: "这不是当前仪表盘仓库里的真实工作树；这里只登记责任关系。",
  task: "未在本项目快照中登记",
  priority: "未登记",
  acceptance: "应回到该平级工程自己的验收入口",
};

const PRODUCT_WORK: CardWorkSnapshot = {
  workspaceLabel: "当前仪表盘工作树（产品现场）",
  workspacePath: "D:/AAAcodex项目/仪表盘",
  branch: SNAPSHOT_META.currentBranch,
  branchState: "当前分支；产品和部分卡片仍共用这条线",
  head: SNAPSHOT_META.currentHead,
  headTitle: SNAPSHOT_META.currentHeadTitle,
  mergeState: "未合入 master；当前 HEAD 是本地工程线",
  isolation: "未完全隔离：这是产品总工作树，不是单卡专用工作树",
  isolationTone: "amber",
  pullRequest: "GitHub 未连接；本地没有可验证的 PR",
  review: "GitHub 未连接；没有真实 PR 就没有真实 Review 记录",
  ci: "本地检查可运行；GitHub Actions 未连接",
  note: "本轮页面本身也在这棵工作树中；它不归给任何仪表盘卡片。",
  task: "维护个人 AI 仪表盘工程总线与面板验收",
  priority: "产品主线",
  acceptance: "本地测试、类型检查和构建通过后，再决定是否形成可合入版本",
  changedPaths: ["src/engineering/", "docs/project/"],
};

const PRODUCT_HISTORY: CardHistoryRecord[] = [
  { hash: "44219d8", date: "2026-09-04", title: "让随手记卡片样式单一归属", raw: "codex(scratchpad): make card styling single-owner", kind: "feature", note: "当前本地 HEAD；本页快照采集于 2026-09-04。" },
  { hash: "0549fe6", date: "2026-09-02", title: "暴露凝时夜间详情边界", raw: "codex(ningshi): expose night detail edge", kind: "feature", note: "仪表盘主工作线的前一处可读基线。" },
  { hash: "a5ce410", date: "2026-09-02", title: "收口卡片表面隔离与日间布局", raw: "codex(radar): isolate surfaces and restore day layout", kind: "feature", note: "仪表盘主工作线的更早可读基线。" },
  { hash: "488349a", date: "2026-09-02", title: "保护紧凑登记表面", raw: "codex(radar): protect compact register surface", kind: "feature", note: "项目雷达相关的最近提交。" },
  { hash: "4f71105", date: "2026-09-01", title: "重排项目雷达与随手记纸面", raw: "codex(dashboard): rebalance project radar and scratchpad surfaces", kind: "cross-card", note: "真实跨卡提交；不能被拆成两张卡各自完成。" },
  { hash: "2d925cd", date: "2026-09-01", title: "对齐全局 Git 快照标签", raw: "codex(engineering): align global git snapshot labels", kind: "baseline", note: "工程总览数据基线。" },
  { hash: "eda68f4", date: "2026-09-01", title: "登记卡片历史和工作树", raw: "codex(engineering): map card histories and worktrees", kind: "baseline", note: "逐卡监控的早期基础。" },
];

const PRODUCT_REQUIREMENTS = CARD_MONITORS.find((card) => card.id === "projects")?.requirements ?? [];

const PORTFOLIO_RECORDS: ObjectRecord[] = [
  {
    id: "small-library", level: 0, title: "小库全局", kindLabel: "全局目录", status: "只汇总，不写事实", tone: "slate",
    summary: "把多个项目放在一张地图上，但不把各项目的代码、Git 和事实揉成一条线。",
    goal: "提供项目选择入口，让每个项目仍回到自己的文档、仓库和验收。",
    relationship: "顶层目录；不绑定单一代码仓库。",
    boundary: "只保存项目索引和精选 Markdown 镜像，不代替任何项目的事实源。",
    owner: "小库项目索引", repository: "多个项目分别维护", sourcePaths: ["各项目自己的工程根"], documentPaths: ["04_Vibecoding项目/项目索引.md"], source: "本地项目文档 + 精选 Markdown 镜像", route: ["项目索引", "选择项目", "进入该项目工作链"], history: [], milestones: [], requirements: [], work: NON_CODE_WORK,
  },
  {
    id: "dashboard", level: 1, title: "个人 AI 仪表盘", kindLabel: "产品项目", status: SNAPSHOT_META.currentStatus, tone: "amber",
    summary: "用 Obsidian 卡片组织行动、决策、项目、知识和本机运行时的个人工作台。",
    goal: "把输入、理解、行动和项目推进分开保存，又通过明确的出口连接起来。",
    relationship: "小库中的一个完整产品；下面的卡片是模块，凝时等是桥接运行时。",
    boundary: "仪表盘生产代码在本仓库；生产业务事实回到受保护的 Markdown / 本机运行时。",
    owner: "仪表盘仓库 · 产品总线", repository: "D:/AAAcodex项目/仪表盘", sourcePaths: ["obsidian-plugin/src", "src/information-inbox", "src/learning-landscape"], documentPaths: ["docs/project/当前产品路线图.md", "docs/project/当前交接.md", "docs/project/架构/"], source: "本地项目 Markdown + 本地 Git", route: ["唯一产品架构", "卡片模块", "隔离工作树", "本地质量门", "真实验收"], history: PRODUCT_HISTORY, milestones: PRODUCT_HISTORY.slice(0, 4).map((item) => ({ hash: item.hash, date: item.date, label: item.title, note: item.note, tone: item.kind === "cross-card" ? "amber" : "teal" })), requirements: PRODUCT_REQUIREMENTS, work: PRODUCT_WORK,
  },
  {
    id: "supervision", level: 1, title: "监督力", kindLabel: "平级独立项目", status: "独立工程 · 仅登记桥接", tone: "teal",
    summary: "凝时真正运行的本机监督工程，不属于仪表盘仓库。",
    goal: "由自己的工程负责监督运行时；仪表盘只显示经过 loopback 桥接的状态。",
    relationship: "凝时卡 → 监督力独立运行时；两边是桥接关系，不是一个仓库。",
    boundary: "源码、数据、Git、服务和验收归监督力；仪表盘不复制这些事实。",
    owner: "监督力项目自己负责", repository: "D:/AAAcodex项目/监督力", sourcePaths: ["仪表盘内的凝时桥接入口"], documentPaths: ["docs/project/架构/15_项目层级与工程边界.md"], source: "项目边界文档（本页不代读外部工程）", route: ["独立需求", "独立分支", "独立服务", "仪表盘只读桥接"], history: [], milestones: [], requirements: [], work: NON_CODE_WORK,
  },
  {
    id: "network", level: 1, title: "网络监控", kindLabel: "平级独立项目", status: "独立工程 · 路径待核对", tone: "slate",
    summary: "节点采样、SQLite 和健康快照的责任边界；仪表盘只显示桥接结果。",
    goal: "让网络健康状态和项目推进状态分开显示，网络失败不被误读成项目代码失败。",
    relationship: "节点监控卡的外部运行时；不把监控数据当成仪表盘项目历史。",
    boundary: "采样和存储由网络监控工程负责，本页只登记接口关系。",
    owner: "网络监控项目自己负责", repository: "D:/AAAcodex项目/网络监控", sourcePaths: ["仪表盘内的节点监控桥接入口"], documentPaths: ["docs/project/架构/15_项目层级与工程边界.md"], source: "项目边界文档（外部路径待核对）", route: ["采样工程", "本机快照", "仪表盘只读显示", "独立验收"], history: [], milestones: [], requirements: [], work: NON_CODE_WORK,
  },
  {
    id: "bilibili-tool", level: 1, title: "B 站倍速工具", kindLabel: "平级独立扩展", status: "独立扩展 · 仅登记桥接", tone: "slate",
    summary: "浏览器当前页面实际套用倍速的扩展工程，和仪表盘卡片不是同一责任。",
    goal: "保持浏览器小工具和仪表盘业务卡片的代码、发布和问题边界分开。",
    relationship: "仪表盘只提供配置和入口；扩展自己的代码、发布和问题单独看。",
    boundary: "浏览器扩展自身的仓库、构建和发布不进入仪表盘 Git 历史。",
    owner: "浏览器扩展项目自己负责", repository: "E:/B站倍速工具", sourcePaths: ["obsidian-plugin/src/ui/BilibiliSpeedPanel.tsx", "bilibili-speed-tool"], documentPaths: ["docs/project/架构/15_项目层级与工程边界.md"], source: "项目边界文档（外部工程未读取）", route: ["预设配置", "本机桥接", "当前 B 站页", "扩展回执"], history: [], milestones: [], requirements: [], work: NON_CODE_WORK,
  },
  {
    id: "chainiki", level: 1, title: "Chainiki", kindLabel: "平级独立项目", status: "路径待登记", tone: "slate",
    summary: "小库中的另一个持续项目，和仪表盘平级，不共享一条代码时间线。",
    goal: "拥有自己的需求、文档、分支、Git 和验收；被项目雷达提到不代表成为卡片。",
    relationship: "平级项目；和仪表盘只有项目索引层关系。",
    boundary: "当前总览没有读取它的代码或 Git，不在本页伪造工作现场。",
    owner: "Chainiki 项目自己负责", repository: "当前工程总览未登记", sourcePaths: [], documentPaths: ["04_Vibecoding项目/Chainiki/"], source: "系统/项目/项目雷达-Chainiki.md", route: ["自身需求", "自身分支", "自身质量门", "自身验收"], history: [], milestones: [], requirements: [], work: NON_CODE_WORK,
  },
  {
    id: "motion-mapping", level: 1, title: "体感映射", kindLabel: "平级独立项目", status: "路径待登记", tone: "slate",
    summary: "小库中的平级项目，是否和仪表盘接入要单独登记。",
    goal: "先维护自己的需求和代码线，再决定是否建立对仪表盘的桥接。",
    relationship: "平级项目；不能复用仪表盘 Commit 时间线。",
    boundary: "当前总览不读取它的仓库，不把它混进仪表盘卡片现场。",
    owner: "体感映射项目自己负责", repository: "当前工程总览未登记", sourcePaths: [], documentPaths: ["04_Vibecoding项目/体感映射/"], source: "系统/项目/项目雷达-体感映射.md", route: ["自身需求", "自身分支", "自身质量门", "自身验收"], history: [], milestones: [], requirements: [], work: NON_CODE_WORK,
  },
  {
    id: "harness", level: 1, title: "Obsidian 对接 / Harness", kindLabel: "平级支撑工程", status: "规则存在 · 工程路径待登记", tone: "amber",
    summary: "负责项目文档、Git、本地工程和精选镜像之间的边界约束。",
    goal: "让 AI 可以持续工作又不丢需求、不混项目、不把镜像当权威。",
    relationship: "可以约束仪表盘，但不是某张卡片，也不能成为第二套项目事实库。",
    boundary: "规则只记录边界和职责；当前状态回到项目文档、代码和 Git。",
    owner: "项目 AGENTS.md + 全局 Harness 规则", repository: "全局规则 + 各项目 AGENTS.md", sourcePaths: ["AGENTS.md"], documentPaths: ["D:/AAAcodex项目/仪表盘/AGENTS.md"], source: "项目规则与镜像约定", route: ["规则", "工程门禁", "镜像校验", "项目验收"], history: [], milestones: [], requirements: [], work: NON_CODE_WORK,
  },
];

function withWorkDefaults(work: CardWorkSnapshot, title: string): CardWorkSnapshot {
  return { ...work, task: work.task ?? `${title}：当前快照未单独登记任务标题`, priority: work.priority ?? "未单独登记", acceptance: work.acceptance ?? "当前快照未登记真实验收回执", changedPaths: work.changedPaths ?? [] };
}

function cardToObjectRecord(card: CardMonitor): ObjectRecord {
  return {
    id: `card-${card.id}`, level: 2, title: card.title, kindLabel: card.groupLabel, status: card.status, tone: card.tone, summary: card.summary, goal: card.goal, relationship: card.relationship, boundary: card.dataBoundary, owner: card.owner, repository: card.repository, sourcePaths: card.sourcePaths, documentPaths: card.documentPaths, source: "本地卡片监控登记 + 项目文档", route: card.milestones.map((milestone) => milestone.label), history: card.history, milestones: card.milestones, requirements: card.requirements, work: withWorkDefaults(card.work, card.title), group: card.group, parent: "个人 AI 仪表盘",
  };
}

const CARD_RECORDS = CARD_MONITORS.map(cardToObjectRecord);
const INDEPENDENT_RECORDS = PORTFOLIO_RECORDS.filter((record) => record.id !== "dashboard" && record.id !== "small-library");
const ALL_OBJECT_RECORDS = [PORTFOLIO_RECORDS[0], PORTFOLIO_RECORDS[1], ...CARD_RECORDS, ...INDEPENDENT_RECORDS];

function buildLoopSnapshot(record: ObjectRecord): LoopSnapshot {
  const hasRequirements = record.requirements.length > 0;
  const hasDocuments = record.documentPaths.length > 0;
  const hasCodeLine = record.work.branch !== "—";
  const hasHistory = record.history.length > 0;
  const hasAcceptance = Boolean(record.work.acceptance && !record.work.acceptance.includes("未登记"));
  const pickDocuments = (...needles: string[]) => record.documentPaths.filter((path) => needles.some((needle) => path.includes(needle)));
  const pickRequirements = (...ids: string[]) => record.requirements.filter((requirement) => ids.includes(requirement.id));
  const units: LoopUnit[] = record.id === "card-projects"
    ? [
        {
          label: "项目地图 / 单对象档案",
          status: "verified",
          registered: true,
          note: "把小库全局、仪表盘产品、卡片模块和平级工程分开；点一个对象，只展开这一份档案。",
          evidence: "定向测试 · 地图与档案断言",
          documentPaths: pickDocuments("当前产品路线图", "当前交接", "15_项目层级"),
          codePaths: ["src/engineering/EngineeringControlRoom.tsx", "src/engineering/cardMonitoringData.ts"],
          requirements: pickRequirements("REQ-BOUNDARY", "REQ-READ-ONLY"),
          history: record.history.slice(0, 2),
        },
        {
          label: "首轮 / 后续迭代分开看",
          status: "verified",
          registered: true,
          note: "One-shot 看路线、功能单元和文档入口；后续迭代看分区、当前任务、分支、检查和交接。",
          evidence: "定向测试 · Loop 切换断言",
          documentPaths: pickDocuments("04_项目雷达", "11_看板", "12_长期"),
          codePaths: ["src/engineering/EngineeringControlRoom.tsx", "src/engineering/EngineeringControlRoom.test.tsx"],
          requirements: pickRequirements("REQ-TWO-LAYERS", "REQ-MEMORY"),
          history: record.history.slice(2, 4),
        },
        {
          label: "工程现场 / 冲突隔离",
          status: "verified",
          registered: true,
          note: "按真实目录展示工作树、未提交现场、跨卡提交和隔离规则；混合提交保留原样，不拆成假历史。",
          evidence: "定向测试 · 现场与冲突断言",
          documentPaths: pickDocuments("11_看板", "15_项目层级", "当前交接"),
          codePaths: ["src/engineering/engineering.css", "src/engineering/cardMonitoringData.ts"],
          requirements: pickRequirements("REQ-BOUNDARY", "REQ-ISOLATION"),
          history: record.history.slice(4),
        },
        {
          label: "用户验收 / 真实源接入",
          status: "waiting",
          registered: true,
          note: "等待你验收阅读结构；GitHub、Linear、CI 仍保持快照边界，不把静态页面冒充成实时同步。",
          evidence: "本地 6/6 + build；等待用户验收",
          documentPaths: pickDocuments("当前交接", "历史日志"),
          codePaths: [],
          requirements: pickRequirements("REQ-READ-ONLY"),
          history: [],
        },
      ]
    : [
        {
          label: "需求 / 头脑风暴",
          status: hasRequirements ? "evidence" : "untracked",
          registered: false,
          note: hasRequirements ? `${record.requirements.length} 条原文需求已登记；先把它们落到可验收的首轮工作单元。` : "当前对象没有可读取的需求原文。",
          evidence: hasRequirements ? "原文可回看；尚未登记功能单元" : "没有需求原文证据",
          documentPaths: record.documentPaths.slice(0, 1),
          codePaths: [],
          requirements: record.requirements.slice(0, 2),
          history: [],
        },
        {
          label: "架构 / 唯一路线",
          status: hasDocuments ? "evidence" : "untracked",
          registered: false,
          note: hasDocuments ? `${record.documentPaths.length} 个文档入口可回看；正文仍以项目 Markdown 为准。` : "当前对象没有单独登记架构或路线入口。",
          evidence: hasDocuments ? "文档入口可回看；尚未登记功能单元" : "没有架构入口证据",
          documentPaths: record.documentPaths.slice(1),
          codePaths: [],
          requirements: record.requirements.slice(2),
          history: [],
        },
        {
          label: "功能单元 / 依赖",
          status: "untracked",
          registered: false,
          note: "当前静态快照尚未把路线拆成可计算的功能单元、依赖和完成条件。",
          evidence: "未登记验收证据",
          documentPaths: [],
          codePaths: [],
          requirements: [],
          history: [],
        },
        {
          label: "分区实施 / 代码线",
          status: hasCodeLine ? "active" : "untracked",
          registered: false,
          note: hasCodeLine ? `当前能看到 ${record.work.branch} 和对应工作树；这只是现场证据，不等于单元完成。` : "没有本地分支或工作树证据。",
          evidence: hasCodeLine ? "工程现场可回看；不等于单元完成" : "没有分支证据",
          documentPaths: [],
          codePaths: record.sourcePaths,
          requirements: [],
          history: record.history.slice(0, 4),
        },
        {
          label: "集成 / 首版验收",
          status: hasAcceptance ? "waiting" : hasHistory ? "waiting" : "untracked",
          registered: false,
          note: hasAcceptance ? record.work.acceptance ?? "等待验收" : "当前快照不能证明首轮已经集成或通过用户验收。",
          evidence: hasAcceptance ? "有验收文字；尚未登记功能单元" : "没有验收证据",
          documentPaths: record.documentPaths.slice(-1),
          codePaths: [],
          requirements: [],
          history: record.history.slice(0, 2),
        },
      ];
  const registeredUnits = units.filter((unit) => unit.registered);
  const verifiedUnits = registeredUnits.filter((unit) => unit.status === "verified");
  const progress = registeredUnits.length > 0
    ? `${verifiedUnits.length}/${registeredUnits.length} · ${Math.round((verifiedUnits.length / registeredUnits.length) * 100)}%`
    : "首轮进度不计算";
  const progressNote = registeredUnits.length > 0
    ? `计算口径：有验收证据的已完成功能单元 ÷ 已登记功能单元。当前 ${verifiedUnits.length}/${registeredUnits.length}；Commit 数量不进入分母。`
    : "当前对象没有登记可计算的路线图功能单元；阶段资料和 Commit 只作上下文，不冒充进度。";
  const latest = record.history[0];
  return {
    modeLabel: record.work.workspacePath === "—" ? "工作模式待登记" : record.id === "card-projects" ? "工程总览卡 · 首轮路线" : record.id === "dashboard" ? "后续迭代 · 当前主线" : "迭代现场可见",
    modeTone: record.work.workspacePath === "—" ? "slate" : "amber",
    stage: record.work.task ?? "尚未登记当前工作单元",
    progress,
    progressNote,
    progressFormula: registeredUnits.length > 0 ? "已验收功能单元 / 已登记功能单元" : "等待登记路线图功能单元",
    checkpoint: latest ? `${latest.date} · ${latest.hash}` : "无本地检查点",
    checkpointSource: latest ? latest.title : "当前项目快照没有可回看的 Commit 检查点",
    next: record.id === "card-projects" ? "你先验收这张工程总览卡；通过后再接真实 GitHub / Linear / CI 读取" : record.work.workspacePath === "—" ? "先登记该对象自己的工程入口和工作模式" : "先把当前任务拆成一个有完成条件的工作单元，再继续执行或交接",
    units,
  };
}

const CONFLICT_FACTS = [
  { label: "布局", tone: "teal" as Tone, status: "已分开", fact: "flow-v1 负责可见矩形不相交；stack 是有意重叠的自由布局。", source: "docs/project/架构/11_看板画布架构.md" },
  { label: "责任", tone: "teal" as Tone, status: "已登记", fact: "卡片模块、独立运行时和平级项目分层；桥接不吞并外部仓库。", source: "docs/project/架构/15_项目层级与工程边界.md" },
  { label: "数据写入", tone: "amber" as Tone, status: "持续防覆盖", fact: "项目雷达、随手记、日记和信息收集各回自己的事实源；总览只读快照。", source: "docs/project/架构/12_长期产品与体验合同.md" },
  { label: "代码仓库", tone: "amber" as Tone, status: "现场可见", fact: "当前总工作树、卡片工作树、集成区和临时 detached 区分开显示。", source: "本地 Git worktree 快照 · 2026-09-04" },
  { label: "云端镜像", tone: "rose" as Tone, status: "待人工核对", fact: "本地权威文档先裁决；云端独有或同时修改的文件不自动覆盖。", source: "D:/AAAcodex项目/仪表盘/AGENTS.md" },
];

const COMPACT_NAV_ITEMS: Array<{ id: SectionId; label: string; note: string; icon: ElementType }> = [
  { id: "overview", label: "总览", note: "快照与阅读顺序", icon: PanelLeft },
  { id: "map", label: "项目地图", note: "目录、仓库与卡片层级", icon: FolderTree },
  { id: "archive", label: "当前档案", note: "只展开一个项目", icon: Archive },
  { id: "loop", label: "首轮 / 迭代", note: "项目雷达与检查点", icon: Workflow },
  { id: "work", label: "工程现场", note: "工作树与交付证据", icon: GitBranch },
  { id: "conflicts", label: "冲突检查", note: "真正需要处理的边界", icon: ScanLine },
];

const DOCUMENT_ROWS = [
  { path: "docs/project/当前产品路线图.md", role: "唯一产品路线和总体架构", update: "目标、阶段、模块关系发生变化时" },
  { path: "docs/project/架构/**/*.md", role: "长期有效的模块、边界和接口说明", update: "架构、职责或验收标准变化时" },
  { path: "docs/project/当前交接.md", role: "眼前状态、直接下一步和监控摘要", update: "阶段完成、等待用户或发生阻塞时" },
  { path: "docs/project/历史日志/**/*.md", role: "独立历史价值的阶段快照和本轮需求原文", update: "形成可回溯里程碑时" },
  { path: "AGENTS.md", role: "项目边界、命令、镜像和安全门禁", update: "项目合同或边界跨任务生效时" },
  { path: "Obsidian 精选镜像", role: "本地权威文档的 exact 阅读副本", update: "本地先更新并通过冲突核对后" },
];

function toneClass(tone: Tone) {
  return "engineering-tone engineering-tone--" + tone;
}

function StatusMark({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={toneClass(tone)}>
      <span className="engineering-status-dot" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}

function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  meta,
  titleId,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  titleId: string;
}) {
  return (
    <div className="engineering-section-header">
      <div className="engineering-section-header__index">{index}</div>
      <div className="engineering-section-header__copy">
        <p className="engineering-eyebrow">{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>
      <span className="engineering-section-header__meta">{meta}</span>
    </div>
  );
}

function compactValue(value: string, fallback = "未登记") {
  if (!value) return fallback;
  if (value.includes("不适用")) return "不适用";
  if (value.includes("未连接")) return "未连接";
  if (value.includes("未创建")) return "未创建";
  if (value.includes("等待")) return "等待";
  if (value.includes("未合入") || value.includes("尚未合入")) return "未合入";
  if (value.includes("未登记")) return "未登记";
  if (value.includes("未完全隔离")) return "共享";
  if (value.includes("已建立隔离")) return "已隔离";
  if (value.includes("detached")) return "detached";
  return value;
}

function valueTone(value: string, fallback: Tone = "slate"): Tone {
  if (value.includes("未连接") || value.includes("未合入") || value.includes("未登记") || value.includes("等待") || value.includes("共享")) return "amber";
  if (value.includes("已建立隔离") || value.includes("已隔离") || value.includes("通过") || value.includes("已落点")) return "teal";
  if (value.includes("不适用") || value.includes("detached")) return "slate";
  return fallback;
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={"engineering-field " + className}>
      <span className="engineering-field__label">{label}</span>
      <div className="engineering-field__value">{children}</div>
    </div>
  );
}

function PathList({ paths, empty = "未登记路径" }: { paths: string[]; empty?: string }) {
  if (paths.length === 0) return <span className="engineering-empty-value">{empty}</span>;
  return (
    <ul className="engineering-path-list">
      {paths.map((path) => (
        <li key={path}>
          <code>{path}</code>
        </li>
      ))}
    </ul>
  );
}

function RequirementList({ requirements }: { requirements: CardMonitor["requirements"] }) {
  if (requirements.length === 0) return <span className="engineering-empty-value">本对象没有单独登记的原文需求</span>;
  return (
    <div className="engineering-requirement-list">
      {requirements.map((requirement) => (
        <article className="engineering-requirement" key={requirement.id}>
          <div className="engineering-requirement__top">
            <code>{requirement.id}</code>
            <StatusMark tone={requirement.tone}>{requirement.status}</StatusMark>
          </div>
          <p className="engineering-requirement__original">{requirement.original}</p>
          <p>{requirement.must}</p>
          <small>落点：{requirement.landing} · 来源：{requirement.source}</small>
        </article>
      ))}
    </div>
  );
}

function HistoryTable({ history }: { history: CardHistoryRecord[] }) {
  if (history.length === 0) return <span className="engineering-empty-value">没有读取到该项目的本地 Git 历史；不在此处猜测。</span>;
  return (
    <div className="engineering-history-table-wrap">
      <table className="engineering-history-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>Commit</th>
            <th>类型</th>
            <th>提交标题</th>
            <th>这条快照说明什么</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.hash}>
              <td>{item.date}</td>
              <td><code>{item.hash}</code></td>
              <td><span className="engineering-history-kind" data-kind={item.kind}>{HISTORY_KIND_LABELS[item.kind]}</span></td>
              <td><strong>{item.title}</strong><small>{item.raw}</small></td>
              <td>{item.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoopRequirementList({ requirements }: { requirements: CardMonitor["requirements"] }) {
  if (requirements.length === 0) return <span className="engineering-empty-value">本分区没有单独登记的用户原文；回到对象档案继续核对。</span>;
  return (
    <div className="engineering-loop-requirement-list">
      {requirements.map((requirement) => (
        <article className="engineering-loop-requirement" key={requirement.id}>
          <div className="engineering-loop-trace-row__top">
            <code>{requirement.id}</code>
            <StatusMark tone={requirement.tone}>{requirement.status}</StatusMark>
          </div>
          <p className="engineering-loop-requirement__original">原文：{requirement.original}</p>
          <p>必须满足：{requirement.must}</p>
          <small>落点：{requirement.landing} · 来源：{requirement.source}</small>
        </article>
      ))}
    </div>
  );
}

function LoopHistoryList({ history }: { history: CardHistoryRecord[] }) {
  if (history.length === 0) return <span className="engineering-empty-value">本分区没有可回看的 Commit 快照；不在此处补写假历史。</span>;
  return (
    <ol className="engineering-loop-history-list">
      {history.map((item) => (
        <li key={item.hash}>
          <div className="engineering-loop-trace-row__top">
            <span>{item.date}</span>
            <code>{item.hash}</code>
            <span className="engineering-history-kind" data-kind={item.kind}>{HISTORY_KIND_LABELS[item.kind]}</span>
          </div>
          <strong>{item.title}</strong>
          <small>{item.raw}</small>
          <p>{item.note}</p>
        </li>
      ))}
    </ol>
  );
}

function LoopUnitLedger({ unit, index }: { unit: LoopUnit; index: number }) {
  return (
    <details className="engineering-loop-unit" data-status={unit.status} data-registered={unit.registered} open={index === 0}>
      <summary>
        <span className="engineering-loop-unit__index">{String(index + 1).padStart(2, "0")}</span>
        <span className="engineering-loop-unit__title"><strong>{unit.label}</strong><small>{unit.registered ? "进入首轮进度分母" : "资料上下文 · 不进入首轮进度分母"} · 文档 {unit.documentPaths.length} · 原文 {unit.requirements.length} · Git {unit.history.length}</small></span>
        <StatusMark tone={LOOP_STATUS_TONES[unit.status]}>{LOOP_STATUS_LABELS[unit.status]}</StatusMark>
        <ChevronDown className="engineering-loop-unit__chevron" size={16} aria-hidden="true" />
      </summary>
      <div className="engineering-loop-unit__body">
        <div className="engineering-loop-unit__intro">
          <p>{unit.note}</p>
          <small>验收 / 证据：{unit.evidence}</small>
        </div>
        <div className="engineering-loop-trace-grid">
          <section className="engineering-loop-trace-block">
            <div className="engineering-loop-trace-heading"><BookOpen size={14} aria-hidden="true" /><h4>Markdown / 交接位置</h4></div>
            <PathList paths={unit.documentPaths} empty="本分区没有单独登记文档入口" />
          </section>
          <section className="engineering-loop-trace-block">
            <div className="engineering-loop-trace-heading"><Code2 size={14} aria-hidden="true" /><h4>代码入口 / 文件范围</h4></div>
            <PathList paths={unit.codePaths} empty="本分区没有单独代码入口" />
          </section>
          <section className="engineering-loop-trace-block">
            <div className="engineering-loop-trace-heading"><MessageSquare size={14} aria-hidden="true" /><h4>用户原文 / 必须满足</h4></div>
            <LoopRequirementList requirements={unit.requirements} />
          </section>
          <section className="engineering-loop-trace-block">
            <div className="engineering-loop-trace-heading"><GitCommitHorizontal size={14} aria-hidden="true" /><h4>Git 快照 / 这条历史说明什么</h4></div>
            <LoopHistoryList history={unit.history} />
          </section>
        </div>
      </div>
    </details>
  );
}

function WorkFacts({ work }: { work: CardWorkSnapshot }) {
  const fields = [
    { label: "任务", value: work.task ?? "未单独登记" },
    { label: "优先级", value: work.priority ?? "未登记" },
    { label: "工作树目录", value: work.workspacePath },
    { label: "工作树类型", value: work.workspaceLabel },
    { label: "分支状态", value: work.branchState },
    { label: "HEAD 标题", value: work.headTitle },
    { label: "合入状态", value: work.mergeState },
    { label: "隔离状态", value: work.isolation },
    { label: "Pull Request", value: work.pullRequest },
    { label: "Code Review", value: work.review },
    { label: "CI 检查", value: work.ci },
    { label: "验收", value: work.acceptance ?? "当前快照未登记真实验收回执" },
  ];
  const longLabels = new Set(["任务", "工作树目录", "工作树类型", "分支状态", "HEAD 标题", "合入状态", "隔离状态", "Pull Request", "Code Review", "CI 检查", "验收"]);
  return (
    <div className="engineering-fact-grid">
      {fields.map((field) => (
        <Field label={field.label} key={field.label}>
          <strong className={longLabels.has(field.label) ? "engineering-fact-value engineering-fact-value--long" : "engineering-fact-value"}>
            {longLabels.has(field.label) ? field.value : compactValue(field.value)}
          </strong>
          {longLabels.has(field.label) && compactValue(field.value) !== field.value ? <small>{compactValue(field.value)}</small> : null}
        </Field>
      ))}
      <Field label="当前分支">
        <code>{work.branch}</code>
      </Field>
      <Field label="当前 HEAD">
        <code>{work.head}</code>
      </Field>
      <Field label="改动路径">
        <PathList paths={work.changedPaths ?? []} empty="没有按卡片分配的改动路径" />
      </Field>
      <p className="engineering-fact-note">{work.note}</p>
    </div>
  );
}

function LoopMonitor({ record }: { record: ObjectRecord }) {
  const [view, setView] = useState<LoopView>("iteration");
  const snapshot = buildLoopSnapshot(record);
  return (
    <section id="engineering-loop" className="engineering-section engineering-section--loop" aria-labelledby="loop-title">
      <SectionHeader
        index="03"
        eyebrow="PROJECT RADAR · MINIMAL LOOP"
        title="首轮路线和后续迭代，分开看"
        description="同一个项目有两种工作模式；这里先看路线和检查点，不把 Commit 数量冒充项目进度。"
        meta={record.title + " · " + snapshot.modeLabel}
        titleId="loop-title"
      />
      <div className="engineering-loop-shell">
        <div className="engineering-loop-toolbar">
          <div className="engineering-loop-identity">
            <span>当前对象</span>
            <strong>{record.title}</strong>
            <StatusMark tone={snapshot.modeTone}>{snapshot.modeLabel}</StatusMark>
          </div>
          <div className="engineering-loop-tabs" role="tablist" aria-label="项目工作模式">
            <button type="button" role="tab" aria-selected={view === "one-shot"} aria-controls="engineering-loop-one-shot" data-active={view === "one-shot"} onClick={() => setView("one-shot")}>首轮构建</button>
            <button type="button" role="tab" aria-selected={view === "iteration"} aria-controls="engineering-loop-iteration" data-active={view === "iteration"} onClick={() => setView("iteration")}>后续迭代</button>
          </div>
        </div>
        {view === "one-shot" ? (
          <div id="engineering-loop-one-shot" className="engineering-loop-panel" role="tabpanel">
            <div className="engineering-loop-summary">
              <div><span>首轮进度</span><strong>{snapshot.progress}</strong><p>{snapshot.progressNote}</p><code className="engineering-loop-summary__formula">口径：{snapshot.progressFormula}</code></div>
              <div><span>最近检查点</span><code>{snapshot.checkpoint}</code><p>{snapshot.checkpointSource}</p></div>
              <div><span>当前下一步</span><strong>{snapshot.next}</strong><p>完成一个单元后再写一次交接，不按聊天消息频率刷新。</p></div>
            </div>
            <section className="engineering-loop-document-index" aria-label="当前对象的路线与架构文档入口">
              <div className="engineering-loop-document-index__heading">
                <div><span className="engineering-eyebrow">DOCUMENT-LED ROUTE</span><h3>本对象路线 / 架构入口</h3></div>
                <strong>{record.documentPaths.length} 个 Markdown 入口</strong>
              </div>
              <p>这里列真实文档位置；首轮不是一段概括文字。打开每个功能单元，还能看到它对应的用户原文、代码入口和 Git 验收证据。</p>
              <PathList paths={record.documentPaths} empty="当前对象没有登记路线或架构文档" />
            </section>
            <ol className="engineering-loop-ledger">
              {snapshot.units.map((unit, index) => <li key={unit.label}><LoopUnitLedger unit={unit} index={index} /></li>)}
            </ol>
            <p className="engineering-loop-disclaimer"><ShieldCheck size={15} aria-hidden="true" />进度只统计“已登记功能单元”中有验收证据的单元；没有登记分母时显示“未计算”，不会用 Commit 数量代替完成度。</p>
          </div>
        ) : (
          <div id="engineering-loop-iteration" className="engineering-loop-panel" role="tabpanel">
            <div className="engineering-iteration-layout">
              <div className="engineering-iteration-main">
                <div className="engineering-iteration-heading"><div><span className="engineering-eyebrow">CURRENT ITERATION</span><h3>{snapshot.stage}</h3></div><StatusMark tone={snapshot.modeTone}>{snapshot.modeLabel}</StatusMark></div>
                <div className="engineering-iteration-fields">
                  <Field label="任务"><strong>{record.work.task ?? "未单独登记"}</strong></Field>
                  <Field label="工作树"><code>{record.work.workspacePath}</code></Field>
                  <Field label="分支"><code>{record.work.branch}</code></Field>
                  <Field label="HEAD"><code>{record.work.head}</code><small>{record.work.headTitle}</small></Field>
                  <Field label="检查"><span>{record.work.ci}</span></Field>
                  <Field label="交付链"><span>{record.work.mergeState}</span></Field>
                </div>
              </div>
              <aside className="engineering-iteration-checkpoint">
                <span className="engineering-eyebrow">CHECKPOINT</span>
                <code>{snapshot.checkpoint}</code>
                <strong>{snapshot.checkpointSource}</strong>
                <p>下一步：{snapshot.next}</p>
              </aside>
            </div>
            <div className="engineering-iteration-trace">
              <section className="engineering-iteration-trace__block">
                <div className="engineering-loop-trace-heading"><MessageSquare size={14} aria-hidden="true" /><div><span className="engineering-eyebrow">REQUIREMENT TRACE</span><h4>这个对象的原始要求</h4></div></div>
                <LoopRequirementList requirements={record.requirements} />
              </section>
              <section className="engineering-iteration-trace__block">
                <div className="engineering-loop-trace-heading"><History size={14} aria-hidden="true" /><div><span className="engineering-eyebrow">ITERATION HISTORY</span><h4>这个对象的迭代历史</h4></div></div>
                <LoopHistoryList history={record.history} />
              </section>
              <section className="engineering-iteration-trace__block engineering-iteration-trace__block--wide">
                <div className="engineering-loop-trace-heading"><BookOpen size={14} aria-hidden="true" /><div><span className="engineering-eyebrow">AUTHORITATIVE LOCATIONS</span><h4>文档与代码落点</h4></div></div>
                <div className="engineering-iteration-trace__paths">
                  <div><span>Markdown / 交接</span><PathList paths={record.documentPaths} empty="没有登记文档入口" /></div>
                  <div><span>代码入口</span><PathList paths={record.sourcePaths} empty="没有登记代码入口" /></div>
                </div>
              </section>
            </div>
            <p className="engineering-loop-disclaimer"><GitCommitHorizontal size={15} aria-hidden="true" />迭代现场按对象保留原始要求、分区历史、文档位置和代码入口；PR、Review、CI、未提交文件仍在上方当前档案和下方工程现场查看。</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectNode({
  record,
  selected,
  onSelect,
}: {
  record: ObjectRecord;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const location = record.level > 0 && record.work.workspacePath !== "—" ? record.work.workspacePath : record.repository;
  const entry = record.level === 2 ? (record.sourcePaths[0] || "代码入口未登记") : record.level === 1 ? record.repository : "多个项目分别维护";
  const statusTone = record.level === 2 ? record.work.isolationTone : record.tone;
  const statusLabel = record.level === 0 ? "导航节点" : record.id === "dashboard" ? "共享主线" : record.level === 2 ? compactValue(record.work.isolation) : "平级工程";
  return (
    <button
      className="engineering-map-node"
      data-selected={selected}
      type="button"
      aria-pressed={selected}
      aria-label={record.title + "，" + record.kindLabel}
      onClick={() => onSelect(record.id)}
    >
      <span className="engineering-map-node__topline">
        <span className="engineering-level">L{record.level}</span>
        <StatusMark tone={statusTone}>{statusLabel}</StatusMark>
      </span>
      <strong>{record.title}</strong>
      <small>{record.kindLabel}</small>
      <code>{location}</code>
      <small className="engineering-map-node__entry">入口 · {entry}</small>
    </button>
  );
}

function ProjectMap({
  root,
  dashboard,
  cards,
  independent,
  selectedId,
  onSelect,
  queryActive,
  scope,
}: {
  root: ObjectRecord;
  dashboard?: ObjectRecord;
  cards: ObjectRecord[];
  independent: ObjectRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  queryActive: boolean;
  scope: ScopeId;
}) {
  const [productOpen, setProductOpen] = useState(true);
  const [independentOpen, setIndependentOpen] = useState(false);
  const visibleGroups = GROUP_ORDER
    .map((group) => ({ group, records: cards.filter((record) => record.group === group) }))
    .filter((item) => item.records.length > 0);
  const showProduct = scope !== "independent" && (!queryActive || cards.length > 0);
  const showIndependent = scope === "all" || scope === "independent" || independent.length > 0;
  return (
    <section id="engineering-map" className="engineering-section engineering-section--map" aria-labelledby="map-title">
      <SectionHeader
        index="01"
        eyebrow="PROJECT MAP · HIERARCHY FIRST"
        title="先看项目在哪里，再看它现在怎么走"
        description="地图只放层级、目录和责任边界；点选一个对象，下面只展开这一份完整档案。"
        meta={cards.length + independent.length + " 个可选对象"}
        titleId="map-title"
      />
      <div className="engineering-map-legend" aria-label="隔离状态图例">
        <span><StatusMark tone="teal">已隔离</StatusMark><small>独立分支 + 独立工作树</small></span>
        <span><StatusMark tone="amber">共享 / 待核对</StatusMark><small>仍和总工作树有关系</small></span>
        <span><StatusMark tone="slate">不适用</StatusMark><small>平级工程或只登记关系</small></span>
      </div>
      <div className="engineering-map-canvas">
        <div className="engineering-map-root">
          <div className="engineering-map-root__label"><FolderTree size={15} aria-hidden="true" /><span>小库目录根</span><ArrowDown size={15} aria-hidden="true" /></div>
          <ProjectNode record={root} selected={selectedId === root.id} onSelect={onSelect} />
        </div>
        <div className="engineering-map-branches">
          {showProduct ? (
            <section className="engineering-map-branch engineering-map-branch--product" aria-labelledby="product-tree-title">
              <div className="engineering-map-branch__head">
                <button
                  type="button"
                  className="engineering-map-branch__head-toggle"
                  aria-expanded={productOpen}
                  aria-controls="engineering-product-tree"
                  aria-label={`${productOpen ? "收起" : "展开"}个人 AI 仪表盘卡片`}
                  onClick={() => setProductOpen((open) => !open)}
                >
                  <div className="engineering-map-branch__title"><ArrowRight size={15} aria-hidden="true" /><div><span>产品树 · L1</span><h3 id="product-tree-title">个人 AI 仪表盘</h3></div></div>
                  <ChevronDown className={productOpen ? "" : "is-collapsed"} size={16} aria-hidden="true" />
                </button>
                <code>D:/AAAcodex项目/仪表盘</code>
              </div>
              {productOpen ? (
                <div id="engineering-product-tree">
                  {dashboard ? <div className="engineering-map-branch__root"><ProjectNode record={dashboard} selected={selectedId === dashboard.id} onSelect={onSelect} /></div> : null}
                  <div className="engineering-map-lanes">
                    {visibleGroups.map(({ group, records }) => {
                      const meta = GROUP_META[group];
                      const Icon = meta.icon;
                      return (
                        <section className="engineering-map-lane" key={group} aria-labelledby={"map-lane-" + group}>
                          <div className="engineering-map-lane__head">
                            <Icon size={14} aria-hidden="true" />
                            <div><h4 id={"map-lane-" + group}>{meta.label}</h4><span>{meta.note}</span></div>
                            <strong>{records.length}</strong>
                          </div>
                          <div className="engineering-map-node-grid">
                            {records.map((record) => <ProjectNode key={record.id} record={record} selected={selectedId === record.id} onSelect={onSelect} />)}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                  {visibleGroups.length === 0 ? <p className="engineering-map-empty">当前筛选下没有卡片；地图只保留产品根节点。</p> : null}
                </div>
              ) : <p className="engineering-map-empty engineering-map-empty--collapsed">L1 已折叠；展开后查看仪表盘产品节点和各卡片分区。</p>}
            </section>
          ) : null}
          {showIndependent ? (
            <section className="engineering-map-branch engineering-map-branch--independent" aria-labelledby="independent-tree-title">
              <div className="engineering-map-branch__head">
                <button
                  type="button"
                  className="engineering-map-branch__head-toggle"
                  aria-expanded={independentOpen}
                  aria-controls="engineering-independent-tree"
                  aria-label={`${independentOpen ? "收起" : "展开"}平级工程`}
                  onClick={() => setIndependentOpen((open) => !open)}
                >
                  <div className="engineering-map-branch__title"><ArrowRight size={15} aria-hidden="true" /><div><span>平级工程 · L1</span><h3 id="independent-tree-title">不进入仪表盘卡片仓库</h3></div></div>
                  <ChevronDown className={independentOpen ? "" : "is-collapsed"} size={16} aria-hidden="true" />
                </button>
                <code>小库 / 04_Vibecoding项目</code>
              </div>
              {independentOpen ? (
                <div id="engineering-independent-tree">
                  <div className="engineering-map-node-grid engineering-map-node-grid--independent">
                    {independent.map((record) => <ProjectNode key={record.id} record={record} selected={selectedId === record.id} onSelect={onSelect} />)}
                  </div>
                  {independent.length === 0 ? <p className="engineering-map-empty">当前筛选下没有匹配的平级工程。</p> : null}
                </div>
              ) : <p className="engineering-map-empty engineering-map-empty--collapsed">平级工程默认收起；它们拥有自己的仓库、分支和验收，不进入仪表盘卡片时间线。</p>}
            </section>
          ) : null}
        </div>
      </div>
      {cards.length === 0 && independent.length === 0 && queryActive ? (
        <div className="engineering-empty-state"><Search size={18} aria-hidden="true" /><strong>没有匹配对象</strong><span>换一个卡片名、目录、分支或 Commit。</span></div>
      ) : null}
      <details className="engineering-legacy">
        <summary><ChevronDown size={15} aria-hidden="true" />兼容记录 · {LEGACY_CARD_RECORDS.length} 张旧卡，不进入当前项目树</summary>
        <div className="engineering-legacy__list">
          {LEGACY_CARD_RECORDS.map((record) => <div key={record.id}><strong>{record.title}</strong><span>{record.id}</span><p>{record.note}</p></div>)}
        </div>
      </details>
    </section>
  );
}

function DocumentTable() {
  return (
    <div className="engineering-document-table">
      <div className="engineering-document-table__head"><span>文件 / 位置</span><span>它负责什么</span><span>什么时候更新</span></div>
      {DOCUMENT_ROWS.map((row) => (
        <div className="engineering-document-table__row" key={row.path}>
          <code>{row.path}</code><span>{row.role}</span><span>{row.update}</span>
        </div>
      ))}
    </div>
  );
}

function SelectedRecord({ record }: { record: ObjectRecord }) {
  const route = record.route.length > 0 ? record.route.join(" → ") : "未登记路线";
  return (
    <section id="engineering-archive" className="engineering-section engineering-section--archive" aria-labelledby="archive-title">
      <SectionHeader
        index="02"
        eyebrow="SELECTED ARCHIVE · ONE OBJECT AT A TIME"
        title="当前项目档案"
        description="地图上的每一个对象都有这些字段，但默认只打开当前选中的一个，避免 20 份重复资料同时占满页面。"
        meta={record.title + " · L" + record.level}
        titleId="archive-title"
      />
      <article className="engineering-selected-record" data-level={record.level} data-tone={record.tone}>
        <div className="engineering-selected-record__identity">
          <div className="engineering-selected-record__identity-top">
            <span className="engineering-level">L{record.level}</span>
            {record.parent ? <span className="engineering-parent">↳ {record.parent}</span> : null}
            <StatusMark tone={record.tone}>{record.status}</StatusMark>
          </div>
          <h3>{record.title}</h3>
          <span>{record.kindLabel}</span>
        </div>
        <div className="engineering-selected-summary">
          <div><span>目标</span><p>{record.goal}</p></div>
          <div><span>职责</span><p>{record.summary}</p></div>
          <div><span>关系 / 边界</span><p>{record.relationship} {record.boundary}</p></div>
        </div>
        <details className="engineering-accordion" open>
          <summary><Workflow size={16} aria-hidden="true" /><span>当前工程现场</span><small>工作树、分支、HEAD、PR、Review、CI、合入、验收</small><ChevronDown size={15} aria-hidden="true" /></summary>
          <div className="engineering-accordion__body"><WorkFacts work={record.work} /></div>
        </details>
        <details className="engineering-accordion">
          <summary><Target size={16} aria-hidden="true" /><span>项目职责与需求</span><small>负责人、代码边界、文档入口、需求原文</small><ChevronDown size={15} aria-hidden="true" /></summary>
          <div className="engineering-accordion__body">
            <div className="engineering-detail-grid">
              <Field label="负责方"><strong>{record.owner}</strong></Field>
              <Field label="代码仓库"><code>{record.repository}</code></Field>
              <Field label="事实来源"><span>{record.source}</span></Field>
              <Field label="代码入口"><PathList paths={record.sourcePaths} /></Field>
              <Field label="文档入口"><PathList paths={record.documentPaths} /></Field>
              <Field label="数据边界"><span>{record.boundary}</span></Field>
            </div>
            <div className="engineering-subsection-heading"><MessageSquare size={15} aria-hidden="true" /><h4>需求原文保真</h4><span>{record.requirements.length} 条</span></div>
            <RequirementList requirements={record.requirements} />
          </div>
        </details>
        <details className="engineering-accordion">
          <summary><History size={16} aria-hidden="true" /><span>迭代路线与历史</span><small>{record.history.length} 个 Git 快照 · 先看路线，再看提交</small><ChevronDown size={15} aria-hidden="true" /></summary>
          <div className="engineering-accordion__body">
            <div className="engineering-route-line"><span>路线</span><strong>{route}</strong></div>
            <HistoryTable history={record.history} />
          </div>
        </details>
        <details className="engineering-accordion">
          <summary><BookOpen size={16} aria-hidden="true" /><span>权威文档地图</span><small>同一套项目文档职责，不在每个对象里重复新建</small><ChevronDown size={15} aria-hidden="true" /></summary>
          <div className="engineering-accordion__body"><DocumentTable /></div>
        </details>
      </article>
    </section>
  );
}

function WorktreeTable({
  kind,
  title,
  note,
  onSelect,
}: {
  kind: WorktreeRecord["kind"];
  title: string;
  note: string;
  onSelect: (id: string) => void;
}) {
  const rows = WORKTREE_RECORDS.filter((record) => record.kind === kind);
  return (
    <section className="engineering-worktree-group" aria-labelledby={"worktree-" + kind}>
      <div className="engineering-worktree-group__head">
        <div><h3 id={"worktree-" + kind}>{title}</h3><p>{note}</p></div>
        <span>{rows.length} 个</span>
      </div>
      <div className="engineering-table-scroll">
        <table className="engineering-worktree-table">
          <thead><tr><th>归属</th><th>实际目录</th><th>分支 · HEAD</th><th>现场状态</th></tr></thead>
          <tbody>
            {rows.map((record) => {
              const targetId = record.cardId ? "card-" + record.cardId : "dashboard";
              return (
                <tr key={record.id}>
                  <td>
                    <button type="button" className="engineering-worktree-link" onClick={() => onSelect(targetId)}>{record.label}</button>
                    <small>{record.cardId ? "卡片 · " + record.cardId : "产品主线 / 未归属单张卡"}</small>
                  </td>
                  <td><code>{record.path}</code></td>
                  <td><code>{record.branch}</code><small>{record.head} · {record.headTitle}</small></td>
                  <td><StatusMark tone={record.statusTone}>{record.status}</StatusMark><small>{record.relationship}</small></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DirtyFiles() {
  return (
    <details className="engineering-dirty-panel">
      <summary><div><p className="engineering-eyebrow">CURRENT WORKTREE</p><h3>当前工作树的未提交文件</h3></div><StatusMark tone="amber">{GLOBAL_DIRTY_FILES.length} 个</StatusMark><ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="engineering-dirty-panel__body">
        <p className="engineering-dirty-panel__note">“未提交”只表示文件还没有进入 Commit，不等于代码有错；先看它归属于哪条工作线，再决定是否保留、提交或拆开。</p>
        <div className="engineering-dirty-list">
          {GLOBAL_DIRTY_FILES.map((file) => <div className="engineering-dirty-row" key={file.path}><code><span>{file.status}</span> {file.path}</code><p>{file.note}</p></div>)}
        </div>
      </div>
    </details>
  );
}

function ConflictSection() {
  return (
    <section id="engineering-conflicts" className="engineering-section engineering-section--conflicts" aria-labelledby="conflicts-title">
      <SectionHeader
        index="05"
        eyebrow="CONFLICT AUDIT · EVIDENCE ONLY"
        title="只看真正需要处理的冲突"
        description="这里不再重复每张卡的完整状态，只列会影响隔离、覆盖和回溯的事实。"
        meta={CONFLICT_FACTS.length + " 个边界信号 · " + CROSS_CARD_EXAMPLES.length + " 个跨卡提交"}
        titleId="conflicts-title"
      />
      <div className="engineering-conflict-layout">
        <section className="engineering-conflict-card" aria-labelledby="boundary-facts-title">
          <div className="engineering-panel-heading"><ShieldCheck size={16} aria-hidden="true" /><div><p className="engineering-eyebrow">BOUNDARY SIGNALS</p><h3 id="boundary-facts-title">项目之间的边界</h3></div></div>
          <div className="engineering-conflict-list">
            {CONFLICT_FACTS.map((fact) => <article key={fact.label} data-tone={fact.tone}><div><strong>{fact.label}</strong><StatusMark tone={fact.tone}>{fact.status}</StatusMark></div><p>{fact.fact}</p><code>{fact.source}</code></article>)}
          </div>
        </section>
        <section className="engineering-conflict-card" aria-labelledby="cross-card-title">
          <div className="engineering-panel-heading"><GitFork size={16} aria-hidden="true" /><div><p className="engineering-eyebrow">LOCAL GIT EVIDENCE</p><h3 id="cross-card-title">真实的跨卡提交</h3></div></div>
          <div className="engineering-cross-card__list">
            {CROSS_CARD_EXAMPLES.map((item) => <article key={item.hash}><div><code>{item.hash}</code><span>{item.cards}</span></div><strong>{item.title}</strong><p>{item.detail}</p></article>)}
          </div>
        </section>
      </div>
      <details className="engineering-isolation-panel">
        <summary><ShieldCheck size={16} aria-hidden="true" /><span>一张卡重新开始时，要留下哪些证据？</span><small>展开查看隔离协议</small><ChevronDown size={15} aria-hidden="true" /></summary>
        <div className="engineering-isolation-panel__body">
          <ol className="engineering-isolation-list">
            {ISOLATION_RULES.map((rule) => <li key={rule.number}><span>{rule.number}</span><div><strong>{rule.label}</strong><p>{rule.detail}</p></div></li>)}
          </ol>
        </div>
      </details>
    </section>
  );
}

function matchesQuery(record: ObjectRecord, query: string) {
  const values = [
    record.title,
    record.kindLabel,
    record.status,
    record.summary,
    record.goal,
    record.relationship,
    record.boundary,
    record.owner,
    record.repository,
    record.source,
    ...record.sourcePaths,
    ...record.documentPaths,
    ...record.route,
    ...record.history.flatMap((item) => [item.hash, item.title, item.raw, item.note]),
    ...record.requirements.flatMap((item) => [item.id, item.original, item.must]),
    record.work.workspacePath,
    record.work.branch,
    record.work.head,
    record.work.headTitle,
    record.work.pullRequest,
    record.work.review,
    record.work.ci,
    ...(record.work.changedPaths ?? []),
  ];
  const normalized = query.toLocaleLowerCase();
  return values.some((value) => value.toLocaleLowerCase().includes(normalized));
}

function scopeMatches(record: ObjectRecord, scope: ScopeId) {
  if (scope === "all") return true;
  if (scope === "independent") return record.level === 1 && record.id !== "dashboard";
  return record.id === "small-library" || record.id === "dashboard" || record.group === scope;
}

export function EngineeringControlRoom() {
  const [theme, setTheme] = useState<Theme>("day");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ScopeId>("all");
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [selectedId, setSelectedId] = useState("dashboard");
  useEffect(() => {
    const updateActiveSection = () => {
      const targets = COMPACT_NAV_ITEMS.map((item) => {
        const targetId = item.id === "overview" ? "engineering-overview" : "engineering-" + item.id;
        const element = document.getElementById(targetId);
        const rect = element?.getBoundingClientRect();
        return { id: item.id, top: rect?.top ?? Number.POSITIVE_INFINITY, bottom: rect?.bottom ?? Number.NEGATIVE_INFINITY };
      });
      const hasLayout = targets.some((target) => Number.isFinite(target.top) && (target.top !== 0 || target.bottom !== 0));
      if (!hasLayout) return;
      const marker = Math.min(180, Math.max(120, window.innerHeight * 0.28));
      const passed = targets.filter((target) => target.top <= marker && target.bottom > 0);
      const next = passed.length > 0 ? passed[passed.length - 1].id : "overview";
      setActiveSection((current) => current === next ? current : next);
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);
  const normalizedQuery = query.trim();
  const filteredRecords = useMemo(
    () => ALL_OBJECT_RECORDS.filter((record) => scopeMatches(record, scope) && (!normalizedQuery || matchesQuery(record, normalizedQuery))),
    [normalizedQuery, scope],
  );
  const filteredCards = filteredRecords.filter((record) => record.level === 2);
  const filteredIndependentProjects = filteredRecords.filter((record) => record.level === 1 && record.id !== "dashboard");
  const dashboardRecord = ALL_OBJECT_RECORDS.find((record) => record.id === "dashboard");
  const rootRecord = ALL_OBJECT_RECORDS.find((record) => record.id === "small-library") ?? ALL_OBJECT_RECORDS[0];
  const selectedRecord = normalizedQuery
    ? filteredRecords.find((record) => record.title.toLocaleLowerCase().includes(normalizedQuery.toLocaleLowerCase())) ?? filteredRecords.find((record) => record.level === 2) ?? filteredRecords.find((record) => record.id === selectedId) ?? filteredRecords.find((record) => record.id === "dashboard") ?? filteredRecords[0] ?? rootRecord
    : scope !== "all"
      ? filteredRecords.find((record) => record.id === selectedId) ?? filteredRecords.find((record) => record.id === "dashboard") ?? filteredRecords[0] ?? rootRecord
    : ALL_OBJECT_RECORDS.find((record) => record.id === selectedId) ?? dashboardRecord ?? rootRecord;
  const isolatedCardCount = CARD_RECORDS.filter((card) => card.work.isolationTone === "teal").length;
  const sharedCardCount = CARD_RECORDS.length - isolatedCardCount;
  const dirtyWorktreeCount = WORKTREE_RECORDS.filter((record) => record.status.includes("dirty")).length;
  const detachedCount = WORKTREE_RECORDS.filter((record) => record.branch === "detached HEAD").length;
  const chooseRecord = (id: string) => {
    setSelectedId(id);
    setActiveSection("archive");
    window.setTimeout(() => {
      document.getElementById("engineering-archive")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }, 0);
  };
  const scopeOptions: Array<{ id: ScopeId; label: string }> = [
    { id: "all", label: "全部" },
    { id: "core", label: "核心卡片" },
    { id: "optional", label: "输入 / 知识" },
    { id: "runtime", label: "运行时 / 扩展" },
    { id: "independent", label: "平级工程" },
  ];
  const activeNavItem = COMPACT_NAV_ITEMS.find((item) => item.id === activeSection) ?? COMPACT_NAV_ITEMS[0];

  return (
    <div className="engineering-app" data-engineering-theme={theme}>
      <a className="engineering-skip-link" href="#engineering-main">跳到主要内容</a>
      <div className="engineering-shell">
        <aside className="engineering-sidebar">
          <div className="engineering-brand-lockup">
            <span className="engineering-brand-mark"><PanelLeft size={17} aria-hidden="true" /></span>
            <div><span>LOCAL FACTS / LEDGER</span><strong>工程总览</strong></div>
          </div>
          <div className="engineering-sidebar__rule" />
          <p className="engineering-sidebar__label">阅读顺序</p>
          <nav className="engineering-nav" aria-label="工程总览导航">
            {COMPACT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const target = item.id === "overview" ? "engineering-overview" : "engineering-" + item.id;
              return (
                <a
                  aria-current={isActive ? "location" : undefined}
                  className="engineering-nav__item"
                  data-active={isActive}
                  href={"#" + target}
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span><strong>{item.label}</strong><small>{item.note}</small></span>
                  <ChevronRight size={14} aria-hidden="true" />
                </a>
              );
            })}
          </nav>
          <div className="engineering-sidebar__current" aria-live="polite">
            <span className="engineering-sidebar__current-label">当前阅读</span>
            <strong>{activeNavItem.label}</strong>
            <small>{activeNavItem.note}</small>
            <div><span>当前对象</span><strong>{selectedRecord?.title ?? "—"}</strong></div>
          </div>
          <div className="engineering-sidebar__tree">
            <div><FolderTree size={14} aria-hidden="true" /><strong>小库全局</strong><span>1</span></div>
            <div className="engineering-sidebar__tree-indent">
              <div><LayoutDashboard size={14} aria-hidden="true" /><strong>仪表盘产品树</strong><span>{CARD_RECORDS.length} 卡</span></div>
              <span>核心 {CARD_RECORDS.filter((card) => card.group === "core").length}</span>
              <span>输入 / 知识 {CARD_RECORDS.filter((card) => card.group === "optional").length}</span>
              <span>运行时 / 扩展 {CARD_RECORDS.filter((card) => card.group === "runtime").length}</span>
            </div>
            <div><GitFork size={14} aria-hidden="true" /><strong>平级工程</strong><span>{INDEPENDENT_RECORDS.length}</span></div>
          </div>
          <div className="engineering-sidebar__bottom">
            <div className="engineering-sidebar__stamp"><CircleDot size={14} aria-hidden="true" /><div><strong>本地快照</strong><span>{SNAPSHOT_META.date}</span></div></div>
            <p>工程总览只读本地事实；GitHub 仅保留发布快照，Linear 不在本页实时读取。</p>
          </div>
        </aside>
        <main className="engineering-main" id="engineering-main">
          <div className="engineering-topbar">
            <div className="engineering-topbar__path"><span>小库全局</span><ChevronRight size={14} aria-hidden="true" /><strong>个人 AI 仪表盘</strong><ChevronRight size={14} aria-hidden="true" /><span>工程总览卡</span></div>
            <div className="engineering-topbar__actions">
              <span className="engineering-source-chip engineering-source-chip--local"><Code2 size={13} aria-hidden="true" />本地 Git</span>
              <span className="engineering-source-chip"><GitPullRequest size={13} aria-hidden="true" />GitHub · 发布快照</span>
              <span className="engineering-source-chip"><Target size={13} aria-hidden="true" />Linear · 未接入</span>
              <button type="button" className="engineering-theme-button" aria-label={theme === "day" ? "切换到夜间主题" : "切换到日间主题"} onClick={() => setTheme(theme === "day" ? "night" : "day")}>
                {theme === "day" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
                <span>{theme === "day" ? "夜间" : "日间"}</span>
              </button>
            </div>
          </div>
          <header id="engineering-overview" className="engineering-hero">
            <div className="engineering-hero__topline"><span className="engineering-eyebrow">ENGINEERING OVERVIEW CARD · SNAPSHOT {SNAPSHOT_META.date}</span><StatusMark tone="amber">{SNAPSHOT_META.currentStatus}</StatusMark></div>
            <div className="engineering-hero__title">
              <div><h1>工程总览卡 <span>· 项目雷达</span></h1><p>只回答四个工程问题：项目在哪个目录、现在在哪条代码线、是否隔离、接下来怎样验收。</p></div>
              <div className="engineering-hero__head"><span>当前 HEAD</span><code>{SNAPSHOT_META.currentHead}</code><small>{SNAPSHOT_META.currentHeadTitle}</small></div>
            </div>
            <div className="engineering-summary-strip" aria-label="当前快照统计">
              <div><strong>{CARD_RECORDS.length + INDEPENDENT_RECORDS.length}</strong><span>登记工程对象</span><small>{CARD_RECORDS.length} 卡片 + {INDEPENDENT_RECORDS.length} 平级工程</small></div>
              <div><strong>{CARD_RECORDS.length}</strong><span>仪表盘卡片</span><small>都挂在同一个产品仓库下</small></div>
              <div><strong>{WORKTREE_RECORDS.length}</strong><span>工作树现场</span><small>{isolatedCardCount} 张卡已建立隔离</small></div>
              <div><strong>{GLOBAL_DIRTY_FILES.length}</strong><span>未提交文件</span><small>{dirtyWorktreeCount} 个工作树含 dirty 状态</small></div>
            </div>
          </header>
          <div className="engineering-toolbar">
            <div className="engineering-toolbar__copy"><ListChecks size={16} aria-hidden="true" /><span>这张卡只管工程现场；总体信息流、知识沉淀和今日安排由其他卡片负责。</span></div>
            <label className="engineering-search">
              <Search size={16} aria-hidden="true" />
              <span className="engineering-visually-hidden">筛选项目或卡片</span>
              <input aria-label="筛选项目或卡片" name="engineering-filter" placeholder="搜项目、目录、分支或 Commit" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
              {query ? <button type="button" aria-label="清空筛选" onClick={() => setQuery("")}>清空</button> : null}
            </label>
          </div>
          <div className="engineering-scope-bar" aria-label="对象范围筛选">
            <span className="engineering-scope-bar__label">看哪一层</span>
            {scopeOptions.map((item) => <button type="button" className="engineering-scope-button" data-active={scope === item.id} key={item.id} onClick={() => setScope(item.id)}>{item.label}</button>)}
          </div>
           {rootRecord ? <ProjectMap root={rootRecord} dashboard={dashboardRecord} cards={filteredCards} independent={filteredIndependentProjects} selectedId={selectedId} onSelect={chooseRecord} queryActive={Boolean(normalizedQuery)} scope={scope} /> : null}
           {selectedRecord ? <SelectedRecord record={selectedRecord} /> : null}
           {selectedRecord ? <LoopMonitor record={selectedRecord} /> : null}
           <section id="engineering-work" className="engineering-section engineering-section--work" aria-labelledby="work-title">
             <SectionHeader
               index="04"
              eyebrow="WORKTREE MONITOR · ONE ROW PER REAL DIRECTORY"
              title="工程现场总览"
              description="工作树按实际目录分组；这里不再为每张卡复制一整套字段，点归属即可回到上面的当前档案。"
              meta={sharedCardCount + " 共享 · " + isolatedCardCount + " 已隔离 · " + WORKTREE_RECORDS.length + " 工作树"}
              titleId="work-title"
            />
            <div className="engineering-work-stats">
              <div><strong>{WORKTREE_RECORDS.filter((record) => record.kind === "current").length}</strong><span>产品主线</span><small>当前仓库根目录</small></div>
              <div><strong>{WORKTREE_RECORDS.filter((record) => record.kind === "card").length}</strong><span>卡片专用树</span><small>可并行推进的隔离现场</small></div>
              <div><strong>{WORKTREE_RECORDS.filter((record) => record.kind === "integration").length}</strong><span>集成实验区</span><small>比较 / 拼装，不等于合入</small></div>
              <div><strong>{WORKTREE_RECORDS.filter((record) => record.kind === "temporary").length}</strong><span>临时 detached 区</span><small>先确认归属再处理</small></div>
            </div>
            <div className="engineering-worktree-grid">
              <WorktreeTable kind="current" title="产品主线" note="主仓库当前工作树；多个卡片可能在这里留下改动。" onSelect={chooseRecord} />
              <WorktreeTable kind="card" title="卡片专用工作树" note="目录和分支都单独存在，适合一张卡重新开始。" onSelect={chooseRecord} />
              <WorktreeTable kind="integration" title="集成实验区" note="用于比较或拼装；完成前不能当成主线历史。" onSelect={chooseRecord} />
              <WorktreeTable kind="temporary" title="临时 detached 区" note="没有稳定分支名称；处理前先确认它属于谁。" onSelect={chooseRecord} />
            </div>
            <DirtyFiles />
           </section>
           <ConflictSection />
           <footer className="engineering-footer">
            <div><span className="engineering-footer__mark"><Sparkles size={14} aria-hidden="true" /></span><strong>工程总览卡 v0.9</strong><span>地图优先 · 文档台账 · 证据进度</span></div>
            <p>本页是只读工程总览；正文仍以项目 Markdown 和 Git 为准，外部服务只作为发布或未来接入的旁路证据。</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

