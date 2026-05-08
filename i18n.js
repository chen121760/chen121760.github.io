const translations = {
  en: {
    "nav.work": "Work",
    "nav.about": "About",
    "nav.contact": "Contact",
    "header.name": "Jiawei Chen",
    "header.tagline": "Crystal Structure Prediction<br>Machine Learning<br>First-Principles Calculations",
    "header.cta": "Get in touch",
    "work.title": "My Work",
    "work.project1.title": "Interpretable Descriptors for Hydrogen-Based Superconductors",
    "work.project1.desc": "Constructed interpretable SISSO descriptor models to predict the critical temperature of hydrogen-based superconductors at moderate pressures. Published in Materials Today Physics (2026, 63, 102073). The prediction formulas have been packaged into a Python tool and an online calculator.",
    "work.project1.link": "Online Calculator",
    "work.project1.paper": "Paper",
    "work.project2.title": "USPEX Analyzer",
    "work.project2.desc": "A browser-based interactive analysis platform for USPEX crystal structure prediction results. Features include convex hull visualization, Pareto front analysis, scatter plot explorer with GIF export, genealogy tracking, and flexible data filtering and export.",
    "work.project2.link": "Visit Site",
    "about.title": "About Me",
    "about.text": "I am a M.S. candidate in Materials Physics and Chemistry at Guangdong University of Technology. My research focuses on crystal structure prediction, machine learning-assisted materials design, and first-principles calculations.",
    "about.resume": "My Resume",
    "contact.title": "Get in Touch",
    "contact.text": "If you are interested in my research, have questions about my projects, or would like to discuss potential collaborations, feel free to reach out."
  },
  zh: {
    "nav.work": "项目",
    "nav.about": "关于",
    "nav.contact": "联系",
    "header.name": "陈嘉维",
    "header.tagline": "\u6676\u4f53\u7ed3\u6784\u9884\u6d4b<br>\u673a\u5668\u5b66\u4e60<br>\u7b2c\u4e00\u6027\u539f\u7406\u8ba1\u7b97",
    "header.cta": "联系我",
    "work.title": "我的项目",
    "work.project1.title": "氢基超导体可解释描述符预测模型",
    "work.project1.desc": "构建可解释的 SISSO 描述符模型，实现中等压力下氢基超导体临界温度的预测。成果发表于 Materials Today Physics (2026, 63, 102073)。预测公式已封装为 Python 工具和在线计算器。",
    "work.project1.link": "在线计算器",
    "work.project1.paper": "论文",
    "work.project2.title": "USPEX Analyzer",
    "work.project2.desc": "基于浏览器的 USPEX 晶体结构预测后处理平台。支持凸包可视化、Pareto 前沿分析、散点图探索与 GIF 导出、族谱追踪，以及灵活的数据筛选与导出功能。",
    "work.project2.link": "访问网站",
    "about.title": "关于我",
    "about.text": "广东工业大学材料物理与化学专业硕士研究生在读。研究方向为晶体结构预测、机器学习辅助材料设计与第一性原理计算。",
    "about.resume": "我的简历",
    "contact.title": "联系方式",
    "contact.text": "如果您对我的研究感兴趣、对项目有疑问，或希望探讨合作，欢迎随时联系我。"
  }
};

let currentLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.setAttribute('lang', lang);

  const toggleBtn = document.getElementById('lang-toggle');
  toggleBtn.textContent = lang === 'en' ? '中文' : 'EN';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
    // Switch href based on language
    const hrefAttr = el.getAttribute('data-i18n-href-' + lang);
    if (hrefAttr) {
      el.setAttribute('href', hrefAttr);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('lang-toggle');

  setLanguage(currentLang);

  toggleBtn.addEventListener('click', () => {
    setLanguage(currentLang === 'en' ? 'zh' : 'en');
  });
});
