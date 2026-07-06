(function () {
  const STORE_KEY = "vp-site-lang";
  const qs = new URLSearchParams(window.location.search);
  const queryLang = qs.get("lang");
  const savedLang = localStorage.getItem(STORE_KEY);
  const initialLang = queryLang === "en" || queryLang === "zh" ? queryLang : (savedLang || "zh");
  const hasNativeLangBtn = Boolean(document.getElementById("langBtn"));
  const currentPath = (window.location.pathname.split("/").pop() || "").toLowerCase();

  const pageLexicons = {
    "ai_vibe_coding_guide.html": {
      "返回首页": "Back Home",
      "返回首页 Home": "Back Home",
      "什么是 AI Vibe Coding": "What Is AI Vibe Coding",
      "三阶段发展路径": "Three-Stage Evolution",
      "工具地图：Cursor / Claude Code / Copilot / OpenCode / CodeBuddy": "Tool Map: Cursor / Claude Code / Copilot / OpenCode / CodeBuddy",
      "三条常见落地路径": "Three Common Adoption Paths",
      "定义": "Definition",
      "三阶段演进": "Three Stages",
      "工具地图": "Tool Map",
      "发展路径": "Adoption Paths"
    },
    "enterprise_agent_architecture.html": {
      "企业级四类 Agent 架构": "Enterprise Four-Agent Architecture",
      "四类 Agent 架构": "Four-Agent Architecture",
      "智能体六层架构与全市场产品映射": "Six-Layer Agent Architecture and Market Mapping",
      "四维度智能体效能指标体系": "Four-Dimension Agent Effectiveness Metrics",
      "返回首页": "Back Home",
      "返回首页 Home": "Back Home",
      "企业级 Agent Dashboard": "Enterprise Agent Dashboard"
    },
    "agent_effectiveness_metrics.html": {
      "返回首页": "Back Home",
      "四维度智能体效能指标体系": "Four-Dimension Agent Effectiveness Metrics",
      "推荐落地步骤": "Recommended Rollout Steps",
      "指标金字塔（漏斗模型）": "Metrics Pyramid (Funnel Model)"
    },
    "products.html": {
      "返回导航页": "Back Home",
      "国内外主流 AI 产品能力与应用案例库": "AI Product Capability and Case Library",
      "全部": "All",
      "仅国内": "China Only",
      "仅国外": "Global Only",
      "建议新增评估维度（用于下一版）": "Suggested Additional Evaluation Dimensions"
    }
  };

  const zhToEn = {
    "返回首页": "Back Home",
    "返回首页 Home": "Back Home",
    "打开竞争关系图": "Open Competition Map",
    "打开基座大模型性能页": "Open Foundation LLM Performance",
    "打开应用层：分类入口": "Open Use Cases",
    "打开开发者与编程专题入口": "Open Developer Hub",
    "打开 AI Vibe Coding 指南页": "Open AI Vibe Coding Guide",
    "企业级 Agent": "Enterprise Agent",
    "立即查看": "View Now",
    "四类 Agent 架构": "Four-Agent Architecture",
    "智能体六层架构与全市场产品映射": "Six-Layer Architecture and Market Map",
    "四维度智能体效能指标体系": "Four-Dimension Agent Metrics",
    "新开指标体系原页面": "Open Metrics Page",
    "页面已迁移": "Page Moved"
  };

  const activePageLexicon = pageLexicons[currentPath] || {};
  Object.keys(activePageLexicon).forEach((k) => {
    zhToEn[k] = activePageLexicon[k];
  });

  const enToZh = Object.fromEntries(Object.entries(zhToEn).map(([zh, en]) => [en, zh]));

  function translateTextNodes(lang) {
    const fromTo = lang === "en" ? zhToEn : enToZh;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node || !node.nodeValue) continue;
      const parent = node.parentElement;
      if (!parent) continue;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") continue;
      const raw = node.nodeValue;
      const text = raw.trim();
      if (!text) continue;
      if (fromTo[text]) {
        nodes.push({ node, raw, text, next: fromTo[text] });
      } else {
        const fromKeys = Object.keys(fromTo);
        for (let i = 0; i < fromKeys.length; i += 1) {
          const key = fromKeys[i];
          if (text.includes(key)) {
            const replaced = text.split(key).join(fromTo[key]);
            if (replaced !== text) {
              nodes.push({ node, raw, text, next: replaced });
              break;
            }
          }
        }
      }
    }

    nodes.forEach(({ node, raw, text, next }) => {
      node.nodeValue = raw.replace(text, next);
    });

    if (document.title) {
      if (lang === "en" && zhToEn[document.title]) {
        document.title = zhToEn[document.title];
      } else if (lang === "zh" && enToZh[document.title]) {
        document.title = enToZh[document.title];
      }
    }
  }

  function syncStructuredI18n(lang) {
    const targetLang = lang === "en" ? "en" : "zh";
    const docLang = targetLang === "en" ? "en" : "zh-CN";
    document.documentElement.lang = docLang;

    // Keep hash-based tabs and dynamic sections translatable after rerender.
    setTimeout(() => {
      if (!hasNativeLangBtn) {
        translateTextNodes(targetLang);
      }
    }, 120);
  }

  function setLang(lang) {
    const safe = lang === "en" ? "en" : "zh";
    localStorage.setItem(STORE_KEY, safe);
    document.documentElement.lang = safe === "en" ? "en" : "zh-CN";
    if (!hasNativeLangBtn) {
      translateTextNodes(safe);
    }
    syncStructuredI18n(safe);

    const btn = document.querySelector(".vp-lang-toggle") || document.getElementById("langBtn");
    if (btn) {
      btn.textContent = safe === "en" ? "中文" : "EN";
    }
  }

  function observeDomForDynamicContent() {
    const observer = new MutationObserver(() => {
      const lang = localStorage.getItem(STORE_KEY) || initialLang;
      if (!hasNativeLangBtn) {
        translateTextNodes(lang);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function ensureToggleButton() {
    if (hasNativeLangBtn) {
      return;
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "vp-lang-toggle";
    btn.setAttribute("aria-label", "Switch language");
    btn.textContent = initialLang === "en" ? "中文" : "EN";
    btn.addEventListener("click", function () {
      const current = localStorage.getItem(STORE_KEY) || initialLang;
      setLang(current === "en" ? "zh" : "en");
    });
    document.body.appendChild(btn);
  }

  document.body.classList.add("vp-home-theme");
  ensureToggleButton();
  setLang(initialLang);
  observeDomForDynamicContent();
})();
