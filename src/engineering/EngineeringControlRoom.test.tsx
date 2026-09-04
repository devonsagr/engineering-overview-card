import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { EngineeringControlRoom } from "./EngineeringControlRoom";

it("uses one engineering overview card with a map-first reading order", () => {
  render(<EngineeringControlRoom />);

  expect(screen.getByRole("heading", { name: "工程总览卡 · 项目雷达", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "先看项目在哪里，再看它现在怎么走", level: 2 })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "当前项目档案", level: 2 })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "首轮路线和后续迭代，分开看", level: 2 })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "工程现场总览", level: 2 })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "只看真正需要处理的冲突", level: 2 })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "先看输入怎么流，再看每张卡各自负责什么", level: 2 })).not.toBeInTheDocument();
  expect(screen.getByText("这张卡只管工程现场；总体信息流、知识沉淀和今日安排由其他卡片负责。")).toBeInTheDocument();
  expect(screen.getByText("GitHub · 未连接")).toBeInTheDocument();
  expect(screen.getByText("Linear · 未连接")).toBeInTheDocument();
});

it("shows the project folder map and opens only the selected object archive", async () => {
  const user = userEvent.setup();
  render(<EngineeringControlRoom />);

  const map = screen.getByRole("region", { name: "先看项目在哪里，再看它现在怎么走" });
  expect(within(map).getByRole("button", { name: "个人 AI 仪表盘，产品项目" })).toBeInTheDocument();
  expect(within(map).getByRole("button", { name: "日记接入，已接入卡片" })).toBeInTheDocument();
  expect(within(map).getAllByText("D:/AAAcodex项目/仪表盘").length).toBeGreaterThanOrEqual(1);
  expect(within(map).getByText("D:/AAAcodex项目/仪表盘-card-diary")).toBeInTheDocument();

  const archive = screen.getByRole("region", { name: "当前项目档案" });
  expect(within(archive).getByRole("heading", { name: "个人 AI 仪表盘", level: 3 })).toBeInTheDocument();

  await user.click(within(map).getByRole("button", { name: "日记接入，已接入卡片" }));
  expect(within(archive).getByRole("heading", { name: "日记接入", level: 3 })).toBeInTheDocument();
  expect(within(archive).getByText("codex/card-diary")).toBeInTheDocument();
  expect(within(archive).getByText("D:/AAAcodex项目/仪表盘-card-diary")).toBeInTheDocument();
});

it("keeps detailed fields and iteration history folded instead of repeating every card", () => {
  render(<EngineeringControlRoom />);

  const archive = screen.getByRole("region", { name: "当前项目档案" });
  expect(archive.querySelectorAll(".engineering-accordion")).toHaveLength(4);
  expect(archive.querySelectorAll(".engineering-accordion[open]")).toHaveLength(1);
  expect(within(archive).getByText("当前工程现场")).toBeInTheDocument();
  expect(within(archive).getByText("项目职责与需求")).toBeInTheDocument();
  expect(within(archive).getByText("迭代路线与历史")).toBeInTheDocument();

  const work = screen.getByRole("region", { name: "工程现场总览" });
  expect(work.querySelectorAll(".engineering-work-block")).toHaveLength(0);
  expect(within(work).getByText("卡片专用工作树")).toBeInTheDocument();
  expect(within(work).getByText("D:/AAAcodex项目/仪表盘-card-diary")).toBeInTheDocument();
  expect(within(work).getByText("当前工作树的未提交文件")).toBeInTheDocument();
});

it("separates the one-shot route from the real iteration snapshot", async () => {
  const user = userEvent.setup();
  render(<EngineeringControlRoom />);

  const loop = screen.getByRole("region", { name: "首轮路线和后续迭代，分开看" });
  expect(within(loop).getByRole("tab", { name: "首轮构建" })).toHaveAttribute("aria-selected", "false");
  expect(within(loop).getByRole("tab", { name: "后续迭代" })).toHaveAttribute("aria-selected", "true");
  expect(within(loop).getByText("CURRENT ITERATION")).toBeInTheDocument();
  expect(within(loop).getByText("codex/dashboard-two-layouts")).toBeInTheDocument();

  await user.click(within(loop).getByRole("tab", { name: "首轮构建" }));
  expect(within(loop).getByText("首轮进度不计算")).toBeInTheDocument();
  expect(within(loop).getByText("需求 / 头脑风暴")).toBeInTheDocument();
  expect(within(loop).getByText(/进度只统计“已登记功能单元”中有验收证据的单元/)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /项目雷达/ }));
  expect(within(loop).getByText("3/4 · 75%")).toBeInTheDocument();
  expect(within(loop).getByText(/有验收证据的已完成功能单元 ÷ 已登记功能单元/)).toBeInTheDocument();
  expect(within(loop).getByText("项目地图 / 单对象档案")).toBeInTheDocument();
  expect(within(loop).getByText("证据：定向测试 · 地图与档案断言")).toBeInTheDocument();
});

it("filters the map and selected archive without changing source labels, and supports the reading theme", async () => {
  const user = userEvent.setup();
  render(<EngineeringControlRoom />);

  const filter = screen.getByRole("searchbox", { name: "筛选项目或卡片" });
  await user.type(filter, "日记");

  const map = screen.getByRole("region", { name: "先看项目在哪里，再看它现在怎么走" });
  expect(within(map).getAllByText("日记接入")).toHaveLength(1);
  expect(within(map).queryByText("项目雷达")).not.toBeInTheDocument();

  const archive = screen.getByRole("region", { name: "当前项目档案" });
  expect(within(archive).getByRole("heading", { name: "日记接入", level: 3 })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "切换到夜间主题" }));
  expect(screen.getByRole("main").closest(".engineering-app")).toHaveAttribute("data-engineering-theme", "night");
});

it("keeps mixed commits and isolation rules in the separate conflict view", () => {
  render(<EngineeringControlRoom />);

  const conflicts = screen.getByRole("region", { name: "只看真正需要处理的冲突" });
  expect(within(conflicts).getByText("真实的跨卡提交")).toBeInTheDocument();
  expect(within(conflicts).getByText("4f71105")).toBeInTheDocument();
  expect(within(conflicts).getByText("一张卡 / 一个目标")).toBeInTheDocument();
  expect(within(conflicts).getByText("一条分支 / 一个工作树")).toBeInTheDocument();
});

