const defaultProfile = {
  school: "中国科学院大学 上海有机化学研究所",
  major: "070303 有机化学",
  direction: "物理有机/物理化学强化方向",
  examDate: "2026-12-19",
  subjects: [
    { code: "101", name: "思想政治理论", score: 100 },
    { code: "201", name: "英语一", score: 100 },
    { code: "619", name: "物理化学(甲)", score: 150 },
    { code: "820", name: "有机化学", score: 150 },
  ],
  sources: [
    "https://admission.ucas.ac.cn/info/ZhaoshengDanweiDetail/9e780c52-baf5-4020-b453-bc4510579559/8003512026",
    "https://sioc.cas.cn/zs/",
  ],
};

const storage = {
  profile: "kaoyan.profile.v2",
  records: "kaoyan.records.v2",
  account: "kaoyan.account.v2",
  exams: "kaoyan.exams.v2",
  supabase: "kaoyan.supabase.v2",
  ai: "kaoyan.ai.v2",
};

const defaultSupabase = {
  url: "https://uoptsqpbhcezhvfdqpgc.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcHRzcXBiaGNlemh2ZmRxcGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTI1NzUsImV4cCI6MjA5OTA2ODU3NX0.aMClrqOmUWzkbG5DHWC-v-JbEeB-2-nnfqGoc0IbhXo",
};

const quotes = [
  "今天的目标不是把所有事做完，而是把最关键的一步做扎实。",
  "分数来自每天可复现的动作，不来自临时的情绪。",
  "错题不是失败记录，是下一次提分的路线图。",
  "少一点泛泛努力，多一点可检查的完成。",
  "把今天的四小时学稳，比幻想明天十小时更有效。",
  "连续性本身就是竞争力。",
  "每一道订正清楚的题，都会在考场上还给你时间。",
];

const phaseTasks = [
  {
    range: [7, 8],
    focus: "物化热力学与有机基础",
    physical: "热力学第一、第二定律；化学势、偏摩尔量、相平衡；完成基础例题和 5 道计算题。",
    organic: "结构、酸碱、立体化学、取代消除、羰基亲核加成；整理 6 张反应卡。",
  },
  {
    range: [9, 10],
    focus: "动力学、有机机理与真题专题",
    physical: "动力学、电化学、量子与统计热力学专题训练；建立公式调用清单。",
    organic: "芳香性、周环、自由基、重排、合成路线；按题型做真题归纳。",
  },
  {
    range: [11, 12],
    focus: "整卷模拟与查漏补缺",
    physical: "每周至少 2 次专业课限时训练；复盘大题步骤、单位、边界条件。",
    organic: "每周至少 2 次合成与机理综合训练；复盘试剂选择和路线可行性。",
  },
];

const $ = (selector) => document.querySelector(selector);

function getJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function setJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function profile() {
  return getJson(storage.profile, defaultProfile);
}

function records() {
  return getJson(storage.records, []);
}

function supabaseConfig() {
  return { ...defaultSupabase, ...getJson(storage.supabase, {}) };
}

function accountConfig() {
  return { name: "wzm170", email: "", mode: "supabase", ...getJson(storage.account, {}) };
}

function supabaseClient() {
  const config = supabaseConfig();
  if (!config.url || !config.anonKey || !window.supabase) return null;
  return window.supabase.createClient(config.url, config.anonKey);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function currentPhase() {
  const month = new Date().getMonth() + 1;
  return phaseTasks.find((phase) => month >= phase.range[0] && month <= phase.range[1]) ?? phaseTasks[0];
}

function boot() {
  const savedProfile = profile();
  $("#setupSchool").value = savedProfile.school;
  $("#setupMajor").value = savedProfile.major;
  $("#setupDirection").value = savedProfile.direction;
  $("#setupExamDate").value = savedProfile.examDate;
  const account = accountConfig();
  const config = supabaseConfig();
  $("#accountName").value = account.name || "";
  $("#loginEmail").value = account.email || "";
  $("#syncMode").value = account.mode || "local";
  $("#supabaseUrl").value = config.url || "";
  $("#supabaseAnonKey").value = config.anonKey || "";
  const ai = getJson(storage.ai, { provider: "local", apiKey: "" });
  $("#aiProvider").value = ai.provider || "local";
  $("#aiApiKey").value = ai.apiKey || "";
  $("#setupScreen").classList.toggle("hidden", Boolean(localStorage.getItem(storage.profile)));
  renderAll();
}

function renderAll() {
  renderHeader();
  renderSubjects();
  renderSchedule();
  renderImages();
  renderHistory();
  renderStreak();
  loadAdmissionStatus(false);
}

function renderHeader() {
  const data = profile();
  const examDate = new Date(`${data.examDate}T08:30:00+08:00`);
  const days = Math.max(0, Math.ceil((examDate - new Date()) / 86400000));
  const quoteIndex = Math.floor(Date.now() / 86400000) % quotes.length;
  $("#countdown").textContent = `${days} 天`;
  $("#examDateLabel").textContent = data.examDate;
  $("#targetLine").textContent = `${data.school} · ${data.major}`;
  $("#dailyQuote").textContent = quotes[quoteIndex];
}

function renderSubjects() {
  $("#subjectList").innerHTML = profile()
    .subjects.map(
      (subject) => `<article>
        <span>${subject.code}</span>
        <strong>${subject.name}</strong>
        <small>${subject.score} 分</small>
      </article>`
    )
    .join("");
}

function renderSchedule() {
  const phase = currentPhase();
  const schedule = [
    ["08:00-10:00", "619 物理化学(甲)", phase.physical, "physical"],
    ["10:15-12:00", "物化习题与错题复盘", "限时训练，错题必须写明公式选择、单位和计算断点。", "physical"],
    ["14:00-16:00", "820 有机化学", phase.organic, "organic"],
    ["16:15-17:30", "有机真题/合成/谱图", "至少完成 2 道综合题，记录机理箭头和条件误区。", "organic"],
    ["19:00-20:30", "英语一", "阅读真题 1 篇，拆长难句，错因只归入定位、逻辑、词义三类。", "english"],
    ["20:45-21:30", "政治", "选择题 30-50 道，记录概念混淆点。", "politics"],
    ["21:30-22:00", "AI 复盘", "提交学习记录，生成明日连续计划。", "ai"],
  ];
  $("#dailyFocus").textContent = phase.focus;
  $("#schedule").innerHTML = schedule
    .map(
      ([time, title, detail, type]) => `<article class="schedule-item">
        <time>${time}</time>
        <div><strong>${title}</strong><p>${detail}</p></div>
        <span class="badge ${type}">${typeLabel(type)}</span>
      </article>`
    )
    .join("");
}

function typeLabel(type) {
  return { physical: "物化", organic: "有机", english: "英语", politics: "政治", ai: "AI" }[type] || type;
}

function renderStreak() {
  const days = new Set(records().map((record) => record.date));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  $("#streakDays").textContent = `${streak} 天`;
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveRecord() {
  const files = Array.from($("#recordImages").files || []);
  const images = await saveImages(files.slice(0, 4));
  const all = records();
  const record = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: todayIso(),
    time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    completion: Number($("#completion").value || 0),
    minutes: Number($("#studyMinutes").value || 0),
    physicalIssue: $("#physicalIssue").value.trim(),
    organicIssue: $("#organicIssue").value.trim(),
    publicIssue: $("#publicIssue").value.trim(),
    images,
    aiAdvice: analyzeRecords([...all, { completion: Number($("#completion").value || 0), images }]),
  };
  all.unshift(record);
  setJson(storage.records, all.slice(0, 300));
  await saveRecordToCloud(record);
  $("#recordImages").value = "";
  renderAll();
}

async function saveImages(files) {
  const client = supabaseClient();
  const account = accountConfig();
  if (account.mode !== "supabase" || !client) {
    return Promise.all(files.map(fileToDataUrl));
  }

  const uploaded = [];
  for (const file of files) {
    const path = `${account.name || "default"}/${Date.now()}-${file.name}`;
    const result = await client.storage.from("record-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (result.error) {
      uploaded.push(await fileToDataUrl(file));
      continue;
    }
    const { data } = client.storage.from("record-images").getPublicUrl(path);
    uploaded.push(data.publicUrl);
  }
  return uploaded;
}

async function saveRecordToCloud(record) {
  const client = supabaseClient();
  const account = accountConfig();
  if (account.mode !== "supabase" || !client || !account.name) return;
  const { error } = await client.from("learning_records").insert({
    account_name: account.name,
    record_date: record.date,
    payload: record,
  });
  if (error) {
    $("#syncNote").textContent = `云同步失败：${error.message}`;
  } else {
    $("#syncNote").textContent = "今日记录已保存到云端。";
  }
}

function renderImages() {
  const files = Array.from($("#recordImages")?.files || []);
  $("#imagePreview").innerHTML = files.length
    ? files.map((file) => `<span>${file.name}</span>`).join("")
    : "<span>可上传错题、笔记、计划截图。静态版会存入当前浏览器；云同步需接 Supabase Storage。</span>";
}

function renderHistory() {
  const keyword = ($("#historySearch")?.value || "").trim().toLowerCase();
  const filter = $("#historyFilter")?.value || "all";
  const filtered = records().filter((record) => {
    const text = [record.date, record.physicalIssue, record.organicIssue, record.publicIssue, record.aiAdvice]
      .join(" ")
      .toLowerCase();
    return (!keyword || text.includes(keyword)) &&
      (filter === "all" || (filter === "low" && record.completion < 70) || (filter === "image" && record.images?.length));
  });
  $("#historyList").innerHTML = filtered.length
    ? filtered
        .map(
          (record) => `<article class="history-item">
            <div class="history-date"><strong>${record.date}</strong><span>${record.time}</span><span>${record.minutes} 分钟</span></div>
            <div class="history-body">
              <p><strong>物化：</strong>${record.physicalIssue || "无"}</p>
              <p><strong>有机：</strong>${record.organicIssue || "无"}</p>
              <p><strong>公共课：</strong>${record.publicIssue || "无"}</p>
              <p><strong>AI：</strong>${record.aiAdvice || "待分析"}</p>
              <div class="thumbs">${(record.images || []).map((src) => `<img src="${src}" alt="学习记录图片" />`).join("")}</div>
            </div>
            <span class="history-rate ${record.completion < 70 ? "low" : ""}">${record.completion}%</span>
          </article>`
        )
        .join("")
    : '<div class="empty-state">暂无记录。先保存一次今日学习记录。</div>';
}

function analyzeRecords(inputRecords = records()) {
  const recent = inputRecords.slice(0, 7);
  if (!recent.length) return "暂无记录。先连续记录 3 天，再分析趋势。";
  const average = Math.round(recent.reduce((sum, record) => sum + Number(record.completion || 0), 0) / recent.length);
  const imageCount = recent.reduce((sum, record) => sum + (record.images?.length || 0), 0);
  const weak = average < 70 ? "完成率偏低，明天减少新知识，把物化错题和有机机理订正放在第一优先级。" : "完成率可接受，明天保留新知识推进，同时安排 30 分钟错题回炉。";
  const imageAdvice = imageCount ? "图片记录已纳入复盘，建议每张错题图补一句错因。" : "缺少图片证据，建议上传错题或笔记截图，让复盘更可追踪。";
  return `近 ${recent.length} 次平均完成率 ${average}%。${weak}${imageAdvice}`;
}

async function runAgents() {
  const ai = getJson(storage.ai, { provider: "local", apiKey: "" });
  if (ai.provider !== "local" && ai.apiKey) {
    $("#agentOutput").textContent = "正在调用 AI 分析最近学习记录...";
    const answer = await callRemoteAi(ai);
    $("#agentOutput").textContent = answer || `AI 项目组分析：\n${analyzeRecords()}`;
    return;
  }
  $("#agentOutput").textContent = `AI 项目组分析：\n${analyzeRecords()}\n\n明日建议：上午优先 619 物化计算题，下午推进 820 有机机理和合成，晚上保留英语阅读与政治选择题。每周固定一次四科模拟。`;
}

async function callRemoteAi(ai) {
  const prompt = `你是考研学习项目经理。请分析这些学习记录，输出明日计划、薄弱点、错题复盘和本周考试建议：${JSON.stringify(records().slice(0, 10))}`;
  try {
    if (ai.provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${ai.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }
    if (ai.provider === "openrouter") {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ai.apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-flash-1.5",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    }
  } catch (error) {
    return `远程 AI 调用失败：${error.message}\n\n已切换本地规则分析：\n${analyzeRecords()}`;
  }
  return "";
}

function saveAiConfig() {
  setJson(storage.ai, {
    provider: $("#aiProvider").value,
    apiKey: $("#aiApiKey").value.trim(),
  });
  $("#agentOutput").textContent = "AI 配置已保存。未填写 API Key 时会继续使用本地规则 AI。";
}

function createWeeklyExam() {
  const exams = [
    ["政治", "60 分钟", "选择题 50 道 + 错题概念归因"],
    ["英语一", "90 分钟", "阅读 4 篇 + 翻译 1 段"],
    ["619 物理化学(甲)", "150 分钟", "热力学/动力学/电化学/量子统计综合卷"],
    ["820 有机化学", "150 分钟", "机理、合成、谱图、反应条件综合卷"],
  ];
  $("#weeklyExam").innerHTML = exams
    .map(([name, time, task]) => `<article><span>${time}</span><strong>${name}</strong><p>${task}</p></article>`)
    .join("");
}

function saveExamSummary() {
  const total =
    Number($("#scorePolitics").value || 0) +
    Number($("#scoreEnglish").value || 0) +
    Number($("#scorePhysical").value || 0) +
    Number($("#scoreOrganic").value || 0);
  const reflection = $("#examReflection").value.trim();
  const exams = getJson(storage.exams, []);
  exams.unshift({ date: todayIso(), total, reflection });
  setJson(storage.exams, exams);
  $("#examAdvice").textContent = `本次总分 ${total}/500。AI 考试官建议：先处理最影响总分的专业课失分点；${reflection || "补充具体失分原因后可生成更细计划。"}`;
}

async function loadAdmissionStatus(showQuiet) {
  const box = $("#admissionAlerts");
  try {
    const response = await fetch(`admissions-status.json?t=${Date.now()}`);
    if (!response.ok) throw new Error("status missing");
    const data = await response.json();
    if (data.changed) {
      box.innerHTML = `<article class="notice danger"><strong>招生信息有变化</strong><p>${data.summary}</p><a href="${data.source}" target="_blank" rel="noreferrer">打开来源</a></article>`;
    } else if (showQuiet) {
      box.innerHTML = `<article class="notice"><strong>暂无变化</strong><p>最近检查：${data.checkedAt || "未知"}</p></article>`;
    } else {
      box.innerHTML = "";
    }
  } catch {
    if (showQuiet) {
      box.innerHTML = '<article class="notice"><strong>暂未生成监控结果</strong><p>GitHub Actions 首次运行后会生成 admissions-status.json。</p></article>';
    }
  }
}

function saveProfileFromSetup() {
  const data = {
    ...defaultProfile,
    school: $("#setupSchool").value.trim() || defaultProfile.school,
    major: $("#setupMajor").value.trim() || defaultProfile.major,
    direction: $("#setupDirection").value.trim() || defaultProfile.direction,
    examDate: $("#setupExamDate").value || defaultProfile.examDate,
  };
  setJson(storage.profile, data);
  $("#setupScreen").classList.add("hidden");
  renderAll();
}

function showResearchResult() {
  $("#setupSources").innerHTML = `已内置联网检索结果：<br>
    目标：国科大上海有机化学研究所，070303 有机化学。<br>
    科目：101 思想政治理论、201 英语一、619 物理化学(甲)、820 有机化学。<br>
    来源：国科大招生信息网、上海有机所招生信息页。`;
}

function saveAccount() {
  const account = {
    name: $("#accountName").value.trim(),
    email: $("#loginEmail").value.trim(),
    mode: $("#syncMode").value,
  };
  const config = {
    url: $("#supabaseUrl").value.trim(),
    anonKey: $("#supabaseAnonKey").value.trim(),
  };
  setJson(storage.account, account);
  setJson(storage.supabase, config);
  $("#syncNote").textContent =
    account.mode === "supabase"
      ? "已选择云同步模式。请确认 Supabase 表、Auth 和 record-images bucket 已创建。"
      : "当前为本机模式：同一浏览器保留记录，不跨设备自动同步。";
}

async function sendLoginLink() {
  saveAccount();
  const client = supabaseClient();
  const account = accountConfig();
  if (!client || !account.email) {
    $("#syncNote").textContent = "请先填写 Supabase URL、anon key 和邮箱。";
    return;
  }
  const { error } = await client.auth.signInWithOtp({
    email: account.email,
    options: { emailRedirectTo: location.href },
  });
  $("#syncNote").textContent = error ? `登录链接发送失败：${error.message}` : "登录链接已发送，请到邮箱点击确认。";
}

async function loadCloudRecords() {
  saveAccount();
  const client = supabaseClient();
  const account = accountConfig();
  if (!client || !account.name) {
    $("#syncNote").textContent = "请先填写 Supabase 配置和学习账号。";
    return;
  }
  const { data, error } = await client
    .from("learning_records")
    .select("payload, created_at")
    .eq("account_name", account.name)
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    $("#syncNote").textContent = `读取云端失败：${error.message}`;
    return;
  }
  setJson(storage.records, data.map((row) => row.payload));
  $("#syncNote").textContent = `已同步 ${data.length} 条云端记录。`;
  renderAll();
}

function exportHistory() {
  const blob = new Blob([JSON.stringify(records(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `kaoyan-records-${todayIso()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importHistory(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const imported = JSON.parse(reader.result);
    setJson(storage.records, [...imported, ...records()].slice(0, 300));
    renderAll();
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

$("#startApp").addEventListener("click", saveProfileFromSetup);
$("#researchTarget").addEventListener("click", showResearchResult);
$("#generatePlan").addEventListener("click", renderSchedule);
$("#saveRecord").addEventListener("click", saveRecord);
$("#recordImages").addEventListener("change", renderImages);
$("#runAgents").addEventListener("click", runAgents);
$("#saveAiConfig").addEventListener("click", saveAiConfig);
$("#checkAdmission").addEventListener("click", () => loadAdmissionStatus(true));
$("#createWeeklyExam").addEventListener("click", createWeeklyExam);
$("#saveExamSummary").addEventListener("click", saveExamSummary);
$("#saveAccount").addEventListener("click", saveAccount);
$("#sendLoginLink").addEventListener("click", sendLoginLink);
$("#loadCloudRecords").addEventListener("click", loadCloudRecords);
$("#historyFilter").addEventListener("change", renderHistory);
$("#historySearch").addEventListener("input", renderHistory);
$("#exportHistory").addEventListener("click", exportHistory);
$("#importHistory").addEventListener("click", () => $("#historyFile").click());
$("#historyFile").addEventListener("change", importHistory);

bindTabs();
boot();
