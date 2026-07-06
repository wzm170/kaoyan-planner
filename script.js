const phaseTasks = {
  foundation: {
    name: "基础搭建",
    focus: "物化热力学",
    physical: "热力学第一、第二定律；状态函数、偏摩尔量、化学势；完成对应例题与基础计算。",
    organic: "结构与酸碱、立体化学、取代/消除、羰基亲核加成；建立反应卡片。",
    tomorrow: "热力学公式推导 + 羰基反应条件辨析",
  },
  intensive: {
    name: "强化一轮",
    focus: "动力学与合成",
    physical: "化学动力学、复杂反应速率方程、阿伦尼乌斯公式；做综合计算题。",
    organic: "芳香性、周环反应、自由基、重排；按机理类型归纳题型。",
    tomorrow: "动力学综合题 + 周环反应选择规则",
  },
  pastpaper: {
    name: "真题强化",
    focus: "真题限时训练",
    physical: "按年份刷 619 真题或同类题，记录失分点、公式调用和计算速度。",
    organic: "按年份刷 820 真题，重点整理合成路线、机理解释和谱图题。",
    tomorrow: "一套专业课限时训练 + 错题二刷",
  },
  sprint: {
    name: "模拟冲刺",
    focus: "整卷模拟",
    physical: "限时完成物化模拟卷，复盘大题步骤、单位、边界条件。",
    organic: "限时完成有机模拟卷，复盘机理箭头、试剂选择和路线可行性。",
    tomorrow: "模拟卷订正 + 高频错题回炉",
  },
};

const baseSchedule = [
  ["08:00-10:00", "619 物理化学(甲)", "physical"],
  ["10:15-12:00", "物化习题与错题", "physical"],
  ["14:00-16:00", "820 有机化学", "organic"],
  ["16:15-17:30", "有机题、合成题、谱图题", "organic"],
  ["19:00-20:30", "英语一阅读与长难句", "english"],
  ["20:45-21:30", "政治选择题或薄弱点补强", "politics"],
  ["21:30-22:00", "AI 复盘与明日计划", "english"],
];

const overviewSeed = [
  ["7月第1周", "基础搭建", "热力学基础、化学势", "结构酸碱、立体化学", "阅读 4 篇 + 单词", "马原导论", "80%", "热力学推导"],
  ["7月第2周", "基础搭建", "相平衡、电化学", "取代消除、羰基", "阅读错因表", "马原选择题", "85%", "相图与羰基"],
  ["8月第1周", "基础收束", "动力学入门", "芳香性、定位效应", "翻译训练", "史纲框架", "88%", "动力学速率方程"],
];

const storageKey = "sioc-kaoyan-learning-records";

function $(selector) {
  return document.querySelector(selector);
}

function todayStamp() {
  return new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function createRecord(source) {
  const phase = activePhase();
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: todayStamp(),
    time: new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    source,
    phase: phase.name,
    completion: Number($("#completion").value || 0),
    physicalIssue: $("#physicalIssue").value.trim() || "按计划推进",
    organicIssue: $("#organicIssue").value.trim() || "按计划推进",
    tomorrowHours: Number($("#tomorrowHours").value || $("#studyHours").value || 8),
    tomorrowFocus: phase.tomorrow,
  };
}

function addLearningRecord(source) {
  const records = loadRecords();
  records.unshift(createRecord(source));
  saveRecords(records.slice(0, 300));
  renderHistory();
}

function updateCountdown() {
  const examDate = new Date("2026-12-19T08:30:00+08:00");
  const today = new Date();
  const days = Math.max(0, Math.ceil((examDate - today) / 86400000));
  $("#countdown").textContent = `${days} 天`;
}

function activePhase() {
  return phaseTasks[$("#phaseSelect").value];
}

function renderSchedule() {
  const phase = activePhase();
  const hours = Number($("#studyHours").value);
  const schedule = $("#schedule");
  $("#dailyFocus").textContent = phase.focus;
  $("#targetRate").textContent = hours >= 9 ? "85%" : "75%";

  schedule.innerHTML = baseSchedule
    .map(([time, title, type]) => {
      const detail =
        type === "physical"
          ? phase.physical
          : type === "organic"
            ? phase.organic
            : title.includes("英语")
              ? "阅读真题 1-2 篇，拆解错因；单词复习保持滚动，不单独堆时间。"
              : title.includes("政治")
                ? "完成 30-50 道选择题，错题只记概念误区，不做长篇摘抄。"
                : "提交完成率、卡点和明日可用时间，由 AI 项目组生成调整建议。";
      const label =
        type === "physical"
          ? "物化"
          : type === "organic"
            ? "有机"
            : type === "english"
              ? "英语/复盘"
              : "政治";
      return `<article class="schedule-item">
        <time>${time}</time>
        <div>
          <strong>${title}</strong>
          <p>${detail}</p>
        </div>
        <span class="badge ${type}">${label}</span>
      </article>`;
    })
    .join("");
}

function renderOverview() {
  const rows = $("#overviewRows");
  rows.innerHTML = overviewSeed
    .map(
      (row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
    )
    .join("");
}

function addOverviewRow() {
  const phase = activePhase();
  const completion = Number($("#completion").value || 0);
  const today = new Date().toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
  overviewSeed.unshift([
    today,
    phase.name,
    "按今日计划推进，重点回看错题",
    "完成机理卡片与合成题",
    "阅读 + 单词滚动",
    "选择题训练",
    `${completion}%`,
    phase.tomorrow,
  ]);
  renderOverview();
  addLearningRecord("总览表记录");
}

function runAgents() {
  const completion = Number($("#completion").value || 0);
  const physicalIssue = $("#physicalIssue").value.trim();
  const organicIssue = $("#organicIssue").value.trim();
  const tomorrowHours = Number($("#tomorrowHours").value || 8);
  const phase = activePhase();
  const load = tomorrowHours >= 9 ? "正常推进" : "压缩任务量，保专业课主线";
  const completionAdvice =
    completion >= 85
      ? "完成率达标，明天增加 30 分钟限时题训练。"
      : completion >= 65
        ? "完成率中等，明天保留核心任务，减少新知识扩展。"
        : "完成率偏低，明天只保留高优先级任务并补今日错题。";

  $("#agentOutput").textContent = `AI 项目组决议：
1. 总项目经理：${load}；${completionAdvice}
2. 物化教练：围绕「${physicalIssue || phase.physical}」安排 40 分钟公式复述和 5 道同类题。
3. 有机教练：围绕「${organicIssue || phase.organic}」整理 6 张反应卡，至少做 2 道合成拆解。
4. 英语教练：保持阅读真题 1 篇，错题归因限定为定位、逻辑、词义三类。
5. 数据管理员：今日记录已可加入总览表，明日重点为「${phase.tomorrow}」。`;
  addLearningRecord("每日反馈");
}

function renderHistory() {
  const filter = $("#historyFilter").value;
  const keyword = $("#historySearch").value.trim().toLowerCase();
  const records = loadRecords().filter((record) => {
    const text = [
      record.phase,
      record.physicalIssue,
      record.organicIssue,
      record.tomorrowFocus,
      record.source,
    ]
      .join(" ")
      .toLowerCase();
    const matchesKeyword = !keyword || text.includes(keyword);
    const matchesFilter =
      filter === "all" ||
      (filter === "physical" && record.physicalIssue !== "按计划推进") ||
      (filter === "organic" && record.organicIssue !== "按计划推进") ||
      (filter === "low" && record.completion < 70);
    return matchesKeyword && matchesFilter;
  });

  $("#historyList").innerHTML = records.length
    ? records
        .map(
          (record) => `<article class="history-item">
            <div class="history-date">
              <strong>${record.date}</strong>
              <span>${record.time} · ${record.source}</span>
              <span>${record.phase}</span>
            </div>
            <div class="history-body">
              <p><strong>物化：</strong>${record.physicalIssue}</p>
              <p><strong>有机：</strong>${record.organicIssue}</p>
              <p><strong>明日：</strong>${record.tomorrowHours} 小时；${record.tomorrowFocus}</p>
            </div>
            <span class="history-rate ${record.completion < 70 ? "low" : ""}">${record.completion}%</span>
          </article>`
        )
        .join("")
    : `<div class="empty-state">暂无匹配记录。提交每日反馈或添加今日记录后会自动保存。</div>`;
}

function clearHistory() {
  if (!confirm("确定清空所有过往学习记录吗？")) {
    return;
  }
  saveRecords([]);
  renderHistory();
}

function exportHistory() {
  const records = loadRecords();
  const blob = new Blob([JSON.stringify(records, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `sioc-kaoyan-records-${todayStamp().replaceAll("/", "-")}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importHistoryFile(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) {
        throw new Error("记录文件格式不正确");
      }
      const records = [...imported, ...loadRecords()];
      const deduped = Array.from(
        new Map(records.map((record) => [record.id || `${record.date}-${record.time}`, record])).values()
      );
      saveRecords(deduped.slice(0, 300));
      renderHistory();
    } catch (error) {
      alert(error.message || "导入失败，请确认文件是导出的学习记录 JSON。");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function bindTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".tab-view").forEach((view) => view.classList.remove("active"));
      tab.classList.add("active");
      $(`#${tab.dataset.tab}`).classList.add("active");
    });
  });
}

function addMistake() {
  const phase = activePhase();
  const target =
    $("#phaseSelect").value === "foundation" || $("#phaseSelect").value === "intensive"
      ? $("#physicalMistakes")
      : $("#organicMistakes");
  const item = document.createElement("li");
  item.textContent = phase.tomorrow;
  target.prepend(item);
}

$("#generatePlan").addEventListener("click", renderSchedule);
$("#studyHours").addEventListener("change", renderSchedule);
$("#phaseSelect").addEventListener("change", renderSchedule);
$("#addRow").addEventListener("click", addOverviewRow);
$("#runAgents").addEventListener("click", runAgents);
$("#addMistake").addEventListener("click", addMistake);
$("#historyFilter").addEventListener("change", renderHistory);
$("#historySearch").addEventListener("input", renderHistory);
$("#clearHistory").addEventListener("click", clearHistory);
$("#exportHistory").addEventListener("click", exportHistory);
$("#importHistory").addEventListener("click", () => $("#historyFile").click());
$("#historyFile").addEventListener("change", importHistoryFile);

bindTabs();
updateCountdown();
renderSchedule();
renderOverview();
renderHistory();
