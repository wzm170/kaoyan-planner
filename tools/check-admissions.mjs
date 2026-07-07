import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const sources = [
  {
    name: "国科大上海有机所招生目录",
    url: "https://admission.ucas.ac.cn/info/ZhaoshengDanweiDetail/9e780c52-baf5-4020-b453-bc4510579559/8003512026",
  },
  {
    name: "上海有机所招生信息",
    url: "https://www.sioc.ac.cn/yjsb/zsyjsb/zsxx/",
  },
];

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "kaoyan-planner-admission-monitor/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.text();
}

function digest(text) {
  return createHash("sha256").update(text.replace(/\s+/g, " ").trim()).digest("hex");
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(".admission-snapshot.json", "utf8"));
  } catch {
    return {};
  }
}

const previous = await readPrevious();
const checkedAt = new Date().toISOString();
const snapshot = {};
const changes = [];

for (const source of sources) {
  try {
    const text = await fetchText(source.url);
    const hash = digest(text);
    snapshot[source.url] = { ...source, hash, checkedAt };
    if (previous[source.url]?.hash && previous[source.url].hash !== hash) {
      changes.push(`${source.name} 页面内容发生变化`);
    }
  } catch (error) {
    snapshot[source.url] = {
      ...source,
      hash: previous[source.url]?.hash || null,
      checkedAt,
      error: error.message,
    };
  }
}

await writeFile(".admission-snapshot.json", JSON.stringify(snapshot, null, 2));
await writeFile(
  "admissions-status.json",
  JSON.stringify(
    {
      checkedAt,
      changed: changes.length > 0,
      summary: changes.length ? changes.join("；") : "目标院校招生信息暂无变化",
      source: changes.length ? sources[0].url : "",
      subjects: ["101 思想政治理论", "201 英语一", "619 物理化学(甲)", "820 有机化学"],
    },
    null,
    2
  )
);
