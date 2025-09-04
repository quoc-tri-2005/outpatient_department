// ======================= 1. DỮ LIỆU =======================
let dataThaotac = [];
let dataTiepthu = [];
let dataLienhe = [];
let dataChuthich = [];
let dataChuY = [];

// Map type -> ID HTML
const ID_MAP = {
  thaotac: { search: "searchThaotac", results: "resultsThaotac" },
  tiepthu: { search: "searchTiepthu", results: "resultsTiepthu" },
  lienhe: { search: "searchLienhe", results: "resultsLienhe" },
  chuthich: { search: "searchChuthich", results: "resultsChuthich" },
  chuY: { search: "searchChuY", results: "resultsChuY" }
};

// ======================= 2. HÀM TIỆN ÍCH =======================
function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, "");
}
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function formatSteps(content) {
  if (!content) return "";
  if (content.includes("||")) {
    const methods = content.split("||").map(c => c.trim());
    let html = `<p><strong>📌 Có ${methods.length} cách thực hiện:</strong></p>`;
    methods.forEach((m, i) => {
      const steps = m.split("->").map(s => capitalize(s.trim()));
      html += `<p><u>Cách ${i + 1}:</u></p><ol>`;
      steps.forEach(step => { html += `<li>${step}</li>`; });
      html += `</ol>`;
    });
    return html;
  }
  if (content.includes("->")) {
    const steps = content.split("->").map(s => capitalize(s.trim()));
    let html = `<p><strong>📌 Các bước thực hiện:</strong></p><ol>`;
    steps.forEach(step => { html += `<li>${step}</li>`; });
    html += `</ol>`;
    return html;
  }
  return `<p><strong>📌 Nội dung:</strong><br>${capitalize(content)}</p>`;
}

// ======================= 3. LOAD DỮ LIỆU =======================
async function loadData() {
  try {
    dataThaotac = await (await fetch("./thaotac.json")).json();
    dataTiepthu = await (await fetch("./tiepthu.json")).json();
    dataLienhe = await (await fetch("./lienhe.json")).json();
    dataChuthich = await (await fetch("./chuthich.json")).json();
    dataChuY = await (await fetch("./chu_y.json")).json();

    renderSearch("thaotac");
    renderSearch("tiepthu");
    renderSearch("lienhe");
    renderSearch("chuthich");
    renderSearch("chuY");
  } catch (err) {
    console.error("Lỗi load JSON:", err);
  }
}

// ======================= 4. RENDER SEARCH =======================
function renderSearch(type) {
  const keyword = normalize(document.getElementById(ID_MAP[type].search).value || "");
  const results = document.getElementById(ID_MAP[type].results);
  results.innerHTML = "";

  let items = [];
  if (type === "thaotac") items = dataThaotac;
  if (type === "tiepthu") items = dataTiepthu;
  if (type === "lienhe") items = dataLienhe;
  if (type === "chuthich") items = dataChuthich;
  if (type === "chuY") items = dataChuY;

  const filtered = items.filter(item => {
    const text = Array.isArray(item.label) ? item.label.join(" ") : item.label;
    return normalize(text).includes(keyword);
  });

  filtered.forEach(item => {
    const el = document.createElement("div");
    el.className = "list-group-item d-flex align-items-start";

    // Thao tác: click mở modal
    if (type === "thaotac") {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => showDetail(item));
    }

    // Icon (chỉ có ở chú thích)
    if (item.icon) {
      const spanIcon = document.createElement("span");
      spanIcon.innerHTML = item.icon;
      spanIcon.className = "me-3 fs-5";
      el.appendChild(spanIcon);
    }

    // Labels
    const labelEl = document.createElement("div");
    if (Array.isArray(item.label)) {
      item.label.forEach(l => {
        const line = document.createElement("div");
        line.textContent = l;
        labelEl.appendChild(line);
      });
    } else {
      labelEl.textContent = item.label;
    }
    el.appendChild(labelEl);

    results.appendChild(el);
  });
}

// ======================= 5. HIỂN THỊ MODAL =======================
function showDetail(item) {
  document.getElementById("modalTitle").textContent =
    Array.isArray(item.label) ? item.label.join(", ") : item.label;

  let html = "";
  if (item.content) html += formatSteps(item.content);
  if (item.result) html += `<p><strong>✅ Kết quả:</strong><br>${item.result}</p>`;

  document.getElementById("modalContent").innerHTML = html || "<em>Không có dữ liệu chi tiết</em>";

  const modal = new bootstrap.Modal(document.getElementById("detailModal"));
  modal.show();
}

// ======================= 6. DOM READY =======================
document.addEventListener("DOMContentLoaded", () => {
  Object.keys(ID_MAP).forEach(type => {
    document.getElementById(ID_MAP[type].search)
      .addEventListener("input", () => renderSearch(type));
  });
  loadData();
});
