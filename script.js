"use strict";

const prefersReducedMotion =
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollBehavior = prefersReducedMotion ? "auto" : "smooth";

/* Results data (Tables 1, 2 and 9 of the paper) ---------------------------- */

const METHODS = ["Direct", "CoT", "ToT", "LtM", "CM", "TRACE"];

const BENCHMARKS = {
  vsi: {
    groups: [
      { label: "Numerical Answer", span: 4 },
      { label: "Multiple-Choice Answer", span: 4 },
    ],
    tasks: ["Obj. Cnt.", "Abs. Dist.", "Obj. Size", "Room Size", "Rel. Dist.", "Rel. Dir.", "Route", "Order"],
    note:
      "Full VSI-Bench (5,130 QA pairs over 288 videos). Numerical answers are scored with Mean Relative Accuracy, multiple-choice answers with accuracy. <b>Bold</b> marks the best result per column and <u>underline</u> the second best. Gemini 3 Pro, Qwen2.5-VL-72B and MiMo-VL-7B are from Table 1; o3 and GLM-4.5V from Table 9.",
    models: [
      {
        id: "gemini",
        name: "Gemini 3 Pro",
        rows: [
          ["52.61", "33.77", "32.57", "67.09", "42.99", "62.54", "50.52", "51.03", "70.71"],
          ["53.65", "30.35", "34.54", "64.05", "40.76", "61.78", "58.09", "61.34", "71.96"],
          ["58.88", "44.55", "42.12", "72.20", "45.55", "65.35", "57.83", "55.62", "73.73"],
          ["59.52", "45.19", "40.72", "73.36", "44.15", "65.82", "60.40", "53.59", "73.64"],
          ["59.72", "46.70", "41.43", "72.49", "50.14", "63.69", "58.62", "55.50", "72.61"],
          ["60.15", "47.55", "38.82", "73.90", "45.62", "63.85", "61.70", "58.01", "72.97"],
        ],
      },
      {
        id: "o3",
        name: "o3",
        rows: [
          ["51.15", "33.26", "31.95", "69.37", "52.57", "58.87", "44.11", "42.78", "69.42"],
          ["52.36", "34.11", "28.37", "69.81", "50.31", "59.72", "48.89", "57.06", "70.96"],
          ["52.09", "40.07", "24.26", "69.55", "48.68", "59.15", "50.23", "55.35", "69.36"],
          ["52.50", "35.68", "26.98", "70.05", "47.05", "59.15", "50.97", "57.96", "71.22"],
          ["53.93", "34.18", "33.35", "70.19", "52.05", "59.30", "51.10", "62.99", "71.26"],
          ["54.08", "43.40", "29.93", "72.48", "54.03", "57.32", "49.83", "56.10", "70.02"],
        ],
      },
      {
        id: "qwen",
        name: "Qwen2.5-VL-72B",
        rows: [
          ["36.28", "33.36", "20.53", "49.31", "41.49", "43.38", "27.79", "32.47", "44.01"],
          ["29.78", "21.27", "24.95", "16.31", "40.94", "39.44", "33.16", "28.87", "43.53"],
          ["38.06", "17.89", "26.20", "53.15", "47.01", "41.55", "36.78", "35.05", "44.01"],
          ["38.01", "23.27", "31.39", "54.49", "38.68", "42.96", "34.71", "29.90", "36.73"],
          ["35.47", "21.58", "15.67", "52.65", "37.26", "39.44", "36.05", "34.54", "42.39"],
          ["39.38", "22.05", "28.03", "59.98", "38.99", "40.85", "37.40", "31.96", "42.56"],
        ],
      },
      {
        id: "glm",
        name: "GLM-4.5V",
        rows: [
          ["37.33", "34.87", "32.74", "28.13", "29.72", "47.32", "39.05", "35.57", "49.92"],
          ["38.48", "33.42", "31.07", "39.88", "25.52", "45.49", "39.26", "35.57", "50.19"],
          ["40.66", "34.45", "32.17", "47.29", "27.81", "45.63", "39.77", "32.47", "51.88"],
          ["41.35", "32.32", "33.14", "51.26", "22.26", "49.30", "36.47", "39.18", "58.00"],
          ["38.93", "37.77", "31.91", "36.61", "30.07", "45.21", "37.40", "33.51", "54.05"],
          ["45.01", "40.41", "32.84", "65.11", "36.74", "45.77", "38.53", "36.60", "50.68"],
        ],
      },
      {
        id: "mimo",
        name: "MiMo-VL-7B",
        rows: [
          ["39.79", "36.02", "29.84", "52.38", "42.95", "40.14", "33.78", "31.44", "47.41"],
          ["37.49", "34.27", "23.50", "48.52", "43.23", "38.73", "32.75", "27.84", "49.23"],
          ["39.14", "29.45", "30.44", "54.26", "40.14", "41.41", "32.02", "32.47", "46.60"],
          ["38.34", "35.09", "24.47", "48.22", "44.48", "43.10", "30.79", "35.05", "49.50"],
          ["36.85", "27.43", "23.14", "50.14", "39.06", "41.41", "32.54", "27.84", "46.76"],
          ["41.42", "33.27", "31.51", "58.67", "41.56", "39.44", "35.33", "28.87", "51.29"],
        ],
      },
    ],
  },
  ost: {
    groups: [
      { label: "Agent Visible Info", span: 5 },
      { label: "Agent–Object Spatial Relationship", span: 6 },
      { label: "Agent State", span: 4 },
    ],
    subgroups: [
      { label: "Exist.", span: 2 },
      { label: "Quant.", span: 1 },
      { label: "Divers.", span: 1 },
      { label: "Order", span: 1 },
      { label: "Direct.", span: 3 },
      { label: "Dist.", span: 3 },
      { label: "Pos.", span: 2 },
      { label: "Orient.", span: 2 },
    ],
    tasks: ["JUD.", "TEMP.", "CNT.", "JUD.", "JUD.", "JUD.", "TEMP.", "EST.", "JUD.", "TEMP.", "EST.", "JUD.", "EST.", "JUD.", "EST."],
    note:
      "Reproducible OST-Bench subset (200 scenes, 1,396 QA pairs) in its multi-turn dialogue format. <b>Bold</b> marks the best result per column and <u>underline</u> the second best. Qwen is omitted here because of its documented limitations in multi-turn instruction following. Source: Table 2.",
    models: [
      {
        id: "gemini",
        name: "Gemini 3 Pro",
        rows: [
          ["59.22", "96.72", "84.87", "68.75", "89.66", "82.54", "54.27", "48.15", "28.63", "60.61", "54.55", "30.00", "71.43", "22.78", "72.60", "22.68"],
          ["59.26", "82.24", "93.99", "65.96", "96.55", "77.78", "52.24", "62.96", "27.84", "52.76", "50.00", "31.64", "71.43", "24.26", "72.60", "26.67"],
          ["59.20", "94.54", "83.55", "66.67", "93.10", "80.65", "54.27", "54.39", "31.00", "55.61", "53.85", "32.36", "61.76", "29.07", "72.60", "24.58"],
          ["59.27", "95.65", "85.52", "66.67", "100.0", "76.19", "53.00", "50.91", "25.88", "55.78", "53.03", "31.23", "71.43", "35.85", "69.86", "18.06"],
          ["59.04", "95.05", "86.18", "68.75", "89.66", "77.78", "55.72", "48.15", "25.40", "60.30", "49.23", "26.30", "80.00", "24.81", "69.86", "28.47"],
          ["60.42", "95.05", "86.58", "66.67", "96.43", "77.78", "57.00", "52.73", "34.12", "60.30", "56.45", "31.25", "54.29", "31.92", "76.71", "29.03"],
        ],
      },
      {
        id: "mimo",
        name: "MiMo-VL-7B",
        rows: [
          ["62.65", "92.39", "51.63", "53.06", "100.0", "85.71", "63.68", "21.05", "34.12", "76.38", "40.91", "28.77", "100.0", "9.26", "91.78", "40.28"],
          ["61.69", "89.67", "48.37", "48.98", "100.0", "82.54", "68.66", "15.79", "33.33", "75.38", "39.39", "28.77", "97.14", "11.30", "89.04", "39.31"],
          ["62.20", "91.30", "52.29", "51.02", "100.0", "90.48", "64.68", "15.79", "29.22", "75.38", "40.91", "27.53", "100.0", "15.74", "84.93", "41.39"],
          ["63.75", "88.04", "44.44", "63.27", "100.0", "88.89", "77.11", "21.05", "35.88", "76.88", "40.91", "22.33", "100.0", "7.78", "100.0", "36.94"],
          ["64.00", "88.59", "54.90", "57.14", "100.0", "88.89", "69.15", "21.05", "33.92", "78.89", "36.36", "27.53", "100.0", "11.85", "97.26", "38.89"],
          ["65.04", "91.85", "57.52", "61.22", "100.0", "87.30", "69.15", "24.56", "32.35", "74.87", "42.42", "26.44", "100.0", "29.07", "94.52", "38.06"],
        ],
      },
    ],
  },
};

/* Typography ---------------------------------------------------------------- */

const WIDOW_TARGETS = [
  ".lead",
  ".abstract-body p",
  ".stat-label",
  ".pipeline-note",
  ".layer-desc p",
  "figcaption",
  ".explorer-sub",
  ".table-note",
  ".takeaways li",
  ".card p",
  ".limits li",
  ".prompt-steps span",
  ".reference",
  ".meta-list dd:not(.contact)",
  ".affil span",
].join(",");

const WIDOW_MIN_CHARS = 18;
const WIDOW_MAX_BINDS = 4;

// Joins the last words of a block with non-breaking spaces so that its final
// line never holds just one or two short words.
function bindWidows(block) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node);

  let tail = 0;
  let binds = 0;
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    let text = i === nodes.length - 1 ? nodes[i].textContent.replace(/\s+$/, "") : nodes[i].textContent;
    let end = text.length;
    let changed = i === nodes.length - 1;

    while (true) {
      const match = /[ \t\n\r]+(?=[^ \t\n\r]*$)/.exec(text.slice(0, end));
      if (!match) {
        tail += end;
        break;
      }
      tail += end - (match.index + match[0].length);
      if (tail >= WIDOW_MIN_CHARS || binds >= WIDOW_MAX_BINDS) {
        if (changed) nodes[i].textContent = text;
        return;
      }
      text = `${text.slice(0, match.index)}\u00a0${text.slice(match.index + match[0].length)}`;
      end = match.index;
      tail += 1;
      binds += 1;
      changed = true;
    }

    if (changed) nodes[i].textContent = text;
  }
}

const UNBREAKABLE_TERMS = /Qwen2\.5-VL-(?:72|7)B|Qwen2\.5-(?:72|7)B|MiMo-VL-7B|GLM-4\.5V|Gemini 3 Pro|VSI-Bench|OST-Bench|fine-tuning|13616–13637/g;

// Model and benchmark names contain hyphens that browsers may break at.
function keepTermsTogether(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.parentElement.closest("pre, code, svg, table, button, script, style, .nowrap")) {
        return NodeFilter.FILTER_REJECT;
      }
      UNBREAKABLE_TERMS.lastIndex = 0;
      return UNBREAKABLE_TERMS.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  const nodes = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node);

  nodes.forEach((node) => {
    const text = node.textContent;
    const fragment = document.createDocumentFragment();
    let last = 0;
    text.replace(UNBREAKABLE_TERMS, (term, offset) => {
      fragment.append(text.slice(last, offset), el("span", { className: "nowrap", text: term }));
      last = offset + term.length;
      return term;
    });
    fragment.append(text.slice(last));
    node.replaceWith(fragment);
  });
}

function setupTypography() {
  keepTermsTogether(document.querySelector("main"));
  document.querySelectorAll(WIDOW_TARGETS).forEach(bindWidows);
}

/* Helpers ------------------------------------------------------------------ */

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key === "className") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value === true ? "" : String(value));
  });
  children.forEach((child) => {
    if (child !== null && child !== undefined) {
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
  });
  return node;
}

function groupStarts(groups) {
  const starts = new Set();
  let index = 0;
  groups.forEach((group) => {
    starts.add(index);
    index += group.span;
  });
  return starts;
}

/* Header ------------------------------------------------------------------- */

function setupHeader() {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector(".site-nav");
  const links = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  let activeId = "";
  let ticking = false;

  function update() {
    ticking = false;
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);

    const probe = window.scrollY + window.innerHeight * 0.32;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let current = null;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top + window.scrollY <= probe) current = section;
    });
    if (atBottom && sections.length) current = sections[sections.length - 1];

    const nextId = current ? current.id : "";
    if (nextId === activeId) return;
    activeId = nextId;
    if (!activeId && nav && nav.scrollLeft > 0) {
      nav.scrollTo({ left: 0, behavior: scrollBehavior });
    }
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive && nav && nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({ left: link.offsetLeft - 24, behavior: scrollBehavior });
      }
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

/* Reveal ------------------------------------------------------------------- */

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  const show = (item) => item.classList.add("is-in");

  document.querySelectorAll("[data-gains] .db-row").forEach((row, index) => {
    row.style.setProperty("--i", index);
  });

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    items.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  items.forEach((item) => observer.observe(item));
  window.addEventListener("beforeprint", () => items.forEach(show));
}

/* Anatomy explorer ---------------------------------------------------------- */

function setupAnatomy() {
  const root = document.querySelector("[data-anatomy]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll(".layer-tab"));
  const yaml = root.querySelector("[data-yaml]");

  function scrollYamlTo(target, align = "start") {
    if (!yaml) return;
    if (!target) {
      yaml.scrollTo({ top: 0, behavior: scrollBehavior });
      return;
    }
    const top = target.offsetTop;
    const bottom = top + target.offsetHeight;
    if (align === "start") {
      yaml.scrollTo({ top: Math.max(top - 12, 0), behavior: scrollBehavior });
    } else if (top < yaml.scrollTop || bottom > yaml.scrollTop + yaml.clientHeight) {
      yaml.scrollTo({ top: Math.max(top - yaml.clientHeight / 3, 0), behavior: scrollBehavior });
    }
  }

  function setFocus(layer, moveFocus = false) {
    root.dataset.focus = layer;
    tabs.forEach((tab) => {
      const isActive = tab.dataset.layer === layer;
      tab.setAttribute("aria-pressed", String(isActive));
      if (isActive && moveFocus) tab.focus();
    });
    scrollYamlTo(layer === "all" ? null : yaml && yaml.querySelector(`.sec[data-sec="${layer}"]`));
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setFocus(tab.dataset.layer));
    tab.addEventListener("keydown", (event) => {
      let next = null;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        setFocus(next.dataset.layer, true);
      }
    });
  });

  const byRef = new Map();
  root.querySelectorAll("[data-ref]").forEach((node) => {
    const ref = node.dataset.ref;
    if (!byRef.has(ref)) byRef.set(ref, []);
    byRef.get(ref).push(node);
  });

  byRef.forEach((nodes, ref) => {
    const setHot = (on, fromMap) => {
      nodes.forEach((node) => node.classList.toggle("is-hot", on));
      if (on && fromMap) {
        const block = nodes.find((node) => node.classList.contains("blk"));
        const section = block && block.closest(".sec");
        const focus = root.dataset.focus;
        if (block && (focus === "all" || (section && section.dataset.sec === focus))) {
          scrollYamlTo(block, "nearest");
        }
      }
    };

    nodes.forEach((node) => {
      const fromMap = Boolean(node.closest("svg"));
      node.addEventListener("mouseenter", () => setHot(true, fromMap));
      node.addEventListener("mouseleave", () => setHot(false, fromMap));
      if (fromMap) {
        node.addEventListener("focus", () => setHot(true, true));
        node.addEventListener("blur", () => setHot(false, true));
        node.addEventListener("click", () => {
          const layer = node.closest(".map-layer");
          if (layer && root.dataset.focus !== "all" && root.dataset.focus !== layer.dataset.layer) {
            setFocus(layer.dataset.layer);
          }
          setHot(true, true);
        });
      }
    });
  });

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    root.classList.add("is-drawn");
    return;
  }

  const target = root.querySelector(".map") || root;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        root.classList.add("is-drawn");
        observer.disconnect();
      }
    },
    { threshold: 0.35 },
  );
  observer.observe(target);
  window.addEventListener("beforeprint", () => root.classList.add("is-drawn"));
}

/* Results explorer ---------------------------------------------------------- */

function buildResultsTable(benchKey, model) {
  const bench = BENCHMARKS[benchKey];
  const starts = groupStarts(bench.groups);
  const headerRows = bench.subgroups ? 3 : 2;

  const values = model.rows.map((row) => row.map(Number));
  const marks = values[0].map((_, column) => {
    const columnValues = values.map((row) => row[column]);
    const best = Math.max(...columnValues);
    const lower = columnValues.filter((value) => value < best);
    return { best, second: lower.length ? Math.max(...lower) : null };
  });

  const thead = el("thead");
  const groupRow = el("tr", { className: "grp" }, [
    el("th", { scope: "col", rowspan: headerRows, className: "col-method", text: "Method" }),
    el("th", { scope: "col", rowspan: headerRows, className: "col-avg", text: "Avg." }),
  ]);
  bench.groups.forEach((group) => {
    groupRow.append(el("th", { scope: "colgroup", colspan: group.span, className: "g-start", text: group.label }));
  });
  thead.append(groupRow);

  if (bench.subgroups) {
    const subRow = el("tr", { className: "sub" });
    let index = 0;
    bench.subgroups.forEach((group) => {
      subRow.append(
        el("th", {
          scope: "colgroup",
          colspan: group.span,
          className: starts.has(index) ? "g-start" : undefined,
          text: group.label,
        }),
      );
      index += group.span;
    });
    thead.append(subRow);
  }

  const taskRow = el("tr");
  bench.tasks.forEach((task, index) => {
    const classes = [starts.has(index) ? "g-start" : ""].filter(Boolean).join(" ");
    taskRow.append(el("th", { scope: "col", className: classes || undefined, text: task }));
  });
  thead.append(taskRow);

  const tbody = el("tbody");
  const directAvg = values[0][0];
  model.rows.forEach((row, rowIndex) => {
    const method = METHODS[rowIndex];
    const isOurs = method === "TRACE";
    const header = el("th", { scope: "row", className: "col-method" }, [method]);
    if (isOurs) header.append(el("span", { className: "ours-note", text: "ours" }));
    const tr = el("tr", { className: isOurs ? "is-ours" : undefined }, [header]);

    row.forEach((cell, column) => {
      const value = values[rowIndex][column];
      const classes = [];
      if (column === 0) classes.push("col-avg");
      if (column > 0 && starts.has(column - 1)) classes.push("g-start");
      if (value === marks[column].best) classes.push("best");
      else if (value === marks[column].second) classes.push("second");
      const td = el("td", { className: classes.join(" ") || undefined }, [cell]);
      if (isOurs && column === 0) {
        const delta = value - directAvg;
        td.append(el("span", { className: "delta", text: `${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(2)}` }));
      }
      tr.append(td);
    });
    tbody.append(tr);
  });

  return el("table", { className: `rt rt-${benchKey}` }, [
    el("caption", { className: "sr-only", text: `${model.name} results on ${benchKey === "vsi" ? "VSI-Bench" : "OST-Bench"}` }),
    thead,
    tbody,
  ]);
}

function setupResults() {
  const root = document.querySelector("[data-explorer]");
  if (!root) return;

  const benchButtons = Array.from(root.querySelectorAll("[data-bench]"));
  const chipsHost = root.querySelector("[data-model-chips]");
  const tableWrap = root.querySelector("[data-table-wrap]");
  const note = root.querySelector("[data-table-note]");
  const state = { bench: "vsi", model: "gemini" };

  function render() {
    const bench = BENCHMARKS[state.bench];
    const model = bench.models.find((item) => item.id === state.model) || bench.models[0];
    state.model = model.id;

    benchButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.bench === state.bench));
    });

    chipsHost.replaceChildren(
      ...bench.models.map((item) => {
        const chip = el("button", {
          type: "button",
          className: "chip",
          "aria-pressed": String(item.id === state.model),
          text: item.name,
        });
        chip.addEventListener("click", () => {
          state.model = item.id;
          render();
        });
        return chip;
      }),
    );

    tableWrap.replaceChildren(buildResultsTable(state.bench, model));
    note.innerHTML = bench.note;
    keepTermsTogether(note);
    bindWidows(note);
  }

  benchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.bench = button.dataset.bench;
      render();
    });
  });

  render();
}

/* Tabs and copy ------------------------------------------------------------- */

function setupTabs() {
  document.querySelectorAll("[data-tabs]").forEach((container) => {
    const tabs = Array.from(container.querySelectorAll('[role="tab"]'));

    function activate(tab, moveFocus = false) {
      tabs.forEach((item) => {
        const isActive = item === tab;
        item.setAttribute("aria-selected", String(isActive));
        item.tabIndex = isActive ? 0 : -1;
        const panel = document.getElementById(item.getAttribute("aria-controls"));
        if (panel) panel.hidden = !isActive;
      });
      if (moveFocus) tab.focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          activate(next, true);
        }
      });
    });
  });
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }
  textarea.remove();
  return copied;
}

function setupCopy() {
  document.querySelectorAll("[data-copy-active]").forEach((button) => {
    const label = button.querySelector("span");
    let timer = 0;

    button.addEventListener("click", async () => {
      const container = button.closest("[data-tabs]");
      const panel = container && container.querySelector('[role="tabpanel"]:not([hidden])');
      if (!panel) return;

      const text = panel.textContent;
      let copied = false;
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (error) {
        copied = fallbackCopy(text);
      }

      button.classList.toggle("is-copied", copied);
      if (label) label.textContent = copied ? "Copied" : "Copy failed";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.classList.remove("is-copied");
        if (label) label.textContent = "Copy";
      }, 1800);
    });
  });
}

/* Lightbox ------------------------------------------------------------------ */

function setupLightbox() {
  const dialog = document.querySelector("[data-lightbox]");
  const triggers = document.querySelectorAll("[data-zoom]");

  if (!dialog || typeof dialog.showModal !== "function") {
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        window.open(trigger.dataset.original || trigger.dataset.full, "_blank", "noopener");
      });
    });
    return;
  }

  const image = el("img", { className: "lightbox-img", alt: "" });
  dialog.querySelector(".lightbox-frame").append(image);
  const caption = dialog.querySelector(".lightbox-caption");
  const original = dialog.querySelector(".lightbox-original");
  let lastTrigger = null;

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const figure = trigger.closest("figure");
      const figcaption = figure && figure.querySelector("figcaption");
      const card = trigger.closest(".card");
      let text = figcaption ? figcaption.textContent : "";
      if (!text && card) {
        const tag = card.querySelector(".card-tag");
        const title = card.querySelector("h3");
        text = [tag && tag.textContent, title && title.textContent].filter(Boolean).join(" — ");
      }
      const thumb = trigger.querySelector("img");

      image.src = trigger.dataset.full;
      image.alt = thumb ? thumb.alt : "";
      caption.textContent = text.replace(/\s+/g, " ").trim();
      caption.title = caption.textContent;
      original.href = trigger.dataset.original || trigger.dataset.full;
      lastTrigger = trigger;
      document.body.style.overflow = "hidden";
      dialog.showModal();
    });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  const closeButton = dialog.querySelector("[data-lightbox-close]");
  if (closeButton) closeButton.addEventListener("click", () => dialog.close());

  dialog.addEventListener("close", () => {
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
}

setupTypography();
setupHeader();
setupReveal();
setupAnatomy();
setupResults();
setupTabs();
setupCopy();
setupLightbox();
