(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrowLayout = window.matchMedia("(max-width: 900px)");
  const SVG_NS = "http://www.w3.org/2000/svg";
  const canvas = document.querySelector(".canvas");

  /* ---------- Horní lišta a menu ---------- */

  const topbar = document.querySelector(".topbar");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector("#site-nav");

  function setNavOpen(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    siteNav.classList.toggle("is-open", open);
    topbar.classList.toggle("is-open", open);
  }

  navToggle.addEventListener("click", function () {
    setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  siteNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setNavOpen(false);
    });
  });

  /* ---------- Ikony ---------- */

  function stroke(paths, size) {
    const s = size || 16;
    return (
      '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s +
      '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      paths + "</svg>"
    );
  }

  const ICONS = {
    spin:
      '<svg class="ns-spin" viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6" fill="none" stroke="#c4b5fd" stroke-width="2" stroke-linecap="round" stroke-dasharray="24 14" /></svg>',
    check:
      '<svg class="ns-check" viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="8" fill="#22c55e" /><path d="M4.5 8.2l2.2 2.2 4.8-5" fill="none" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>',
    play: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M4.5 3v10l8-5z" fill="currentColor" /></svg>',
    power: stroke('<path d="M12 3v8" /><path d="M6.3 6.3a8 8 0 1 0 11.4 0" />', 14),
    external: stroke('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />', 14),
    globe: stroke('<circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />'),
    mail: stroke('<rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" />'),
    chart: stroke('<path d="M4 19h16" /><path d="M6 15l4-5 3 3 5-7" />'),
    burger: stroke('<path d="M4 11a8 6 0 0 1 16 0z" /><path d="M3.5 14h17" /><path d="M4.5 17h15v1a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z" />'),
    dots: '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><circle cx="3.5" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="12.5" cy="8" r="1.4" /></svg>',
    ai: stroke('<path d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3z" /><path d="M18 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />'),
    code: stroke('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />'),
    key: stroke('<circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l3 3" />'),
    server: stroke('<rect x="4" y="4" width="16" height="7" rx="2" /><rect x="4" y="13" width="16" height="7" rx="2" /><path d="M8 7.5h.01M8 16.5h.01" />'),
    table: stroke('<rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14h18M9 9v11" />'),
    chat: stroke('<path d="M5 16.5A7.5 7.5 0 1 1 12.5 20H7l-2 2.5V16.5z" />'),
    phone: stroke('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />'),
    team: stroke('<circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.5a5 5 0 0 1 5 5" />'),
  };

  /* ---------- Nody: handly, stav a lišta nad nodem ---------- */

  const nodes = new Map();
  document.querySelectorAll("[data-node]").forEach(function (el) {
    nodes.set(el.dataset.node, el);
    (el.dataset.handles || "in out").split(" ").forEach(function (kind) {
      const handle = document.createElement("span");
      handle.className = "handle handle-" + kind;
      handle.setAttribute("aria-hidden", "true");
      el.append(handle);
    });
    if (el.hasAttribute("data-nostatus")) return;
    const status = document.createElement("span");
    status.className = "node-status";
    status.setAttribute("aria-hidden", "true");
    status.innerHTML = ICONS.spin + ICONS.check;
    const head = el.querySelector(":scope > .node-head, :scope > .tl-head");
    if (head && head.classList.contains("tl-head")) {
      head.insertBefore(status, head.querySelector(".tl-chev"));
    } else {
      (head || el).append(status);
    }
  });

  document.querySelectorAll("[data-ndv]").forEach(function (host) {
    const bar = document.createElement("div");
    bar.className = "node-toolbar";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML =
      '<button type="button" class="tb-btn" tabindex="-1" data-action="ndv" data-tip="Execute step">' + ICONS.play + "</button>" +
      '<button type="button" class="tb-btn" tabindex="-1" data-tip="Deactivate">' + ICONS.power + "</button>" +
      '<button type="button" class="tb-btn" tabindex="-1" data-tip="Další možnosti">' + ICONS.dots + "</button>";
    host.prepend(bar);
  });

  /* ---------- Spojnice mezi nody (SVG vrstva přes plátno) ---------- */

  // [odkud, kam, vede na mobilu okrajem?, bez štítku?, jen "wide" / "narrow" rozvržení]
  // Na šířku vede čára do štítku „Projekty · 3 items“ a teprve z něj se dělí do tří projektů.
  const WIRE_LIST = [
    ["start", "o-mne", true],
    ["o-mne", "fork", false, true, "wide"],
    ["fork", "p-email", false, true, "wide"],
    ["fork", "p-deskdeed", false, true, "wide"],
    ["fork", "p-bot", false, true, "wide"],
    ["o-mne", "p-email", true, true, "narrow"],
    ["o-mne", "p-deskdeed", true, true, "narrow"],
    ["o-mne", "p-bot", true, true, "narrow"],
    ["p-email", "g-zkusenosti", true],
    ["p-deskdeed", "g-zkusenosti", true],
    ["p-bot", "g-zkusenosti", true],
    ["g-zkusenosti", "g-vzdelani"],
    ["g-vzdelani", "dovednosti"],
    ["dovednosti", "kontakt"],
    ["job-mcd", "job-kb"],
    ["school", "lang-cs"],
    ["lang-cs", "lang-en"],
  ];

  function svgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
    return el;
  }

  const wireSvg = svgEl("svg", { class: "wires", "aria-hidden": "true" });
  const defs = svgEl("defs");
  [
    ["wire-arrow", "#5c5c5c"],
    ["wire-arrow-ok", "rgba(34, 197, 94, 0.7)"],
    ["wire-arrow-hover", "#a3a3a3"],
    ["wire-arrow-ok-hover", "#4ade80"],
    ["wire-arrow-ai", "#c4b5fd"],
  ].forEach(function (marker) {
    const m = svgEl("marker", {
      id: marker[0],
      viewBox: "0 0 10 10",
      refX: "10",
      refY: "5",
      markerWidth: "9",
      markerHeight: "9",
      markerUnits: "userSpaceOnUse",
      orient: "auto",
    });
    m.append(svgEl("path", { d: "M0 0L10 5L0 10z", fill: marker[1] }));
    defs.append(m);
  });
  const pathLayer = svgEl("g");
  const labelLayer = svgEl("g");
  wireSvg.append(defs, pathLayer, labelLayer);
  canvas.prepend(wireSvg);

  const wires = WIRE_LIST.map(function (item) {
    const vis = svgEl("path", { class: "wire" });
    const prog = svgEl("path", { class: "wire-prog", pathLength: "1" });
    const hit = svgEl("path", { class: "wire-hit" });
    const label = svgEl("g", { class: "wire-label" });
    label.append(
      svgEl("rect", { x: "-21", y: "-8", width: "42", height: "16", rx: "8" }),
      svgEl("text", { y: "3.5" })
    );
    label.lastChild.textContent = "1 item";
    hit.addEventListener("pointerenter", function () {
      vis.classList.add("is-hover");
      prog.classList.add("is-hover");
    });
    hit.addEventListener("pointerleave", function () {
      vis.classList.remove("is-hover");
      prog.classList.remove("is-hover");
    });
    pathLayer.append(vis, prog, hit);
    if (!item[3]) labelLayer.append(label);
    return {
      from: item[0],
      to: item[1],
      gutter: Boolean(item[2]),
      mode: item[4] || "",
      vis: vis,
      prog: prog,
      hit: hit,
      label: label,
    };
  });

  const NORMALS = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] };

  // Bod na vnějším okraji handlu + směr, kterým z nodu vede ven
  // Pozice v plátně z rozvržení (offsetTop/Left), ne z getBoundingClientRect: animace
  // posunem ani zvětšení handlu při najetí tak čáry nerozhodí a nemusíme je překreslovat.
  function canvasBox(el) {
    let x = 0;
    let y = 0;
    let node = el;
    while (node && node !== canvas) {
      x += node.offsetLeft;
      y += node.offsetTop;
      const parent = node.offsetParent;
      if (parent && parent !== canvas) {
        x += parent.clientLeft;
        y += parent.clientTop;
      }
      node = parent;
    }
    return { left: x, top: y, width: el.offsetWidth, height: el.offsetHeight };
  }

  function handlePoint(nodeEl, kind) {
    const handle = nodeEl.querySelector(":scope > .handle-" + kind);
    const h = canvasBox(handle);
    const n = canvasBox(nodeEl);
    const cx = h.left + h.width / 2;
    const cy = h.top + h.height / 2;
    const dist = {
      top: Math.abs(cy - n.top),
      bottom: Math.abs(n.top + n.height - cy),
      left: Math.abs(cx - n.left),
      right: Math.abs(n.left + n.width - cx),
    };
    const side = Object.keys(dist).reduce(function (a, b) {
      return dist[a] <= dist[b] ? a : b;
    });
    const normal = NORMALS[side];
    const reach = (normal[0] ? h.width : h.height) / 2;
    return {
      x: cx + normal[0] * reach,
      y: cy + normal[1] * reach,
      n: normal,
    };
  }

  function curve(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const k1 = Math.max(Math.abs(dx * a.n[0] + dy * a.n[1]) / 2, 12);
    const k2 = Math.max(Math.abs(dx * b.n[0] + dy * b.n[1]) / 2, 12);
    return (
      "M" + a.x.toFixed(1) + " " + a.y.toFixed(1) +
      " C" + (a.x + a.n[0] * k1).toFixed(1) + " " + (a.y + a.n[1] * k1).toFixed(1) +
      " " + (b.x + b.n[0] * k2).toFixed(1) + " " + (b.y + b.n[1] * k2).toFixed(1) +
      " " + b.x.toFixed(1) + " " + b.y.toFixed(1)
    );
  }

  let sectionTops = [];
  let navSections = [];
  let topbarHeight = 0;
  let pageHeight = 0;

  // Pozice sekcí měříme jen při změně rozvržení; scroll je pak jen porovnává
  function measureSections() {
    topbarHeight = topbar.offsetHeight;
    pageHeight = document.documentElement.scrollHeight;
    sectionTops = navSections.map(function (section) {
      return { id: section.id, top: section.getBoundingClientRect().top + window.scrollY };
    });
  }

  function drawWires() {
    // clientHeight nezahrnuje samotnou SVG vrstvu, takže stránka nenaroste pod patičku
    wireSvg.setAttribute("width", canvas.clientWidth);
    wireSvg.setAttribute("height", canvas.clientHeight);
    const narrow = narrowLayout.matches;
    wires.forEach(function (wire) {
      const active = !wire.mode || (wire.mode === "narrow") === narrow;
      [wire.vis, wire.prog, wire.hit, wire.label].forEach(function (el) {
        el.style.display = active ? "" : "none";
      });
      if (!active) return;
      const a = handlePoint(nodes.get(wire.from), "out");
      const b = handlePoint(nodes.get(wire.to), "in");
      const d = curve(a, b);
      wire.vis.setAttribute("d", d);
      wire.prog.setAttribute("d", d);
      wire.hit.setAttribute("d", d);
      const mid = wire.vis.getPointAtLength(wire.vis.getTotalLength() / 2);
      wire.label.setAttribute("transform", "translate(" + mid.x.toFixed(1) + " " + mid.y.toFixed(1) + ")");
      // Na mobilu vedou některé spojnice úzkým okrajem, štítek by překryl karty
      wire.label.style.display = narrow && wire.gutter ? "none" : "";
    });
    measureSections();
  }

  let drawFrame = 0;
  function scheduleDraw() {
    if (drawFrame) return;
    drawFrame = requestAnimationFrame(function () {
      drawFrame = 0;
      drawWires();
    });
  }

  drawWires();
  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(scheduleDraw);
    resizeObserver.observe(canvas);
    nodes.forEach(function (el) {
      resizeObserver.observe(el);
    });
  }
  window.addEventListener("resize", scheduleDraw);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleDraw);
  }
  window.addEventListener("load", scheduleDraw);

  /* ---------- Spuštění nodů při scrollu ---------- */

  function succeed(id) {
    const el = nodes.get(id);
    el.classList.remove("is-running");
    el.classList.add("is-success");
    wires.forEach(function (wire) {
      if (wire.from !== id) return;
      // zelená čára se „protáhne“ k dalšímu nodu, pak naskočí šipka a štítek
      wire.prog.classList.add("is-drawn");
      const done = function () {
        wire.vis.classList.add("is-success");
        wire.label.classList.add("is-visible");
      };
      if (reducedMotion.matches) {
        done();
      } else {
        setTimeout(done, 550);
      }
    });
  }

  function runNode(id) {
    const el = nodes.get(id);
    if (el.dataset.ran) return;
    el.dataset.ran = "1";
    if (reducedMotion.matches) {
      succeed(id);
      return;
    }
    el.classList.add("is-running");
    setTimeout(function () {
      succeed(id);
    }, 400);
  }

  if (!("IntersectionObserver" in window) || reducedMotion.matches) {
    nodes.forEach(function (el, id) {
      succeed(id);
    });
  } else {
    const runObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runNode(entry.target.dataset.node);
          runObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (el) {
      runObserver.observe(el);
    });
  }

  /* ---------- Node Detail View ---------- */

  const NDV = {
    "p-email": {
      title: "AI asistent na zákaznické e-maily",
      kind: "Projekt · automatizace",
      input: [
        ["Typ", "Vlastní projekt"],
        ["Co řeší", "E-shop prodává po celé Evropě a dostává e-maily v mnoha jazycích."],
      ],
      params: [
        {
          label: "Co automatizace dělá",
          text: "AI každý e-mail zařadí (jazyk, kategorie, číslo objednávky, nálada, urgentnost), zapíše ho do přehledové tabulky, připraví koncept odpovědi v jazyce zákazníka a u urgentních reklamací pošle upozornění do Slacku.",
        },
        { label: "Nástroje", tools: ["n8n", "Claude API", "Gmail", "Google Sheets", "Slack"] },
        {
          label: "Pravidla a zabezpečení",
          list: [
            "Odpověď vždy kontroluje a odesílá člověk (human in the loop)",
            "Filtr spamu a automatické upozornění, když workflow spadne",
            "API klíče jen v trezoru n8n, Slack bot má jediné oprávnění (psát zprávy)",
          ],
        },
        {
          label: "Schéma workflow",
          figure: { src: "assets/ai-email-asistent.webp", alt: "Schéma workflow AI asistenta na zákaznické e-maily" },
        },
      ],
      output: {
        otestováno_e_mailů: 10,
        jazyky: ["cs", "sk", "de", "hu", "en", "ro"],
        odpověď_odesílá: "člověk (human in the loop)",
        filtr_spamu: true,
        upozornění_při_chybě: true,
      },
      extra: [
        {
          link: "https://github.com/PatrikPdev/ai-email-asistent",
          label: "Zobrazit na GitHubu",
          note: "Prompty, exporty workflow a popis řešení najdete na GitHubu.",
        },
      ],
    },
    "p-deskdeed": {
      title: "DeskDeed: CRM pro realitní makléře v Notionu",
      kind: "Projekt · digitální produkt",
      input: [
        ["Typ", "Sólo projekt"],
        [
          "Cíl",
          "S pomocí AI nástrojů navrhnout, postavit a uvést na trh kompletní digitální produkt: od systému v Notionu přes branding a video až po e-shop a marketing.",
        ],
      ],
      params: [
        { label: "Nástroje", tools: ["Notion", "Claude", "ElevenLabs", "Canva", "Etsy"] },
        {
          label: "Co jsem udělal",
          list: [
            "Claude: návrh databází a vzorců, texty prodejního listingu, výzkum klíčových slov a strategie spuštění",
            "ElevenLabs: AI hlas pro prodejní a návodné video; AI grafika a Canva: logo a 10 marketingových náhledů",
            "Notion, Canva, CapCut, ElevenLabs, Etsy a Gumroad propojené do jednoho postupu od produktu po prodej",
          ],
        },
      ],
      output: {
        stav: "V prodeji na Etsy",
        první_prodej: true,
        recenze: "5★",
        propojené_stránky: 13,
        databáze: 8,
        živé_vzorce: 12,
        pohledy: "30+",
        výpočet_provizí: "automatický",
      },
      extra: [
        {
          link: "https://www.etsy.com/listing/4531801892/real-estate-agent-notion-templatecrm",
          label: "Zobrazit na Etsy",
          note: "Produkt je živý na Etsy, má první prodej a 5★ recenzi.",
        },
      ],
    },
    "p-bot": {
      title: "Solana trading bot: výzkum a automatizace s AI agentem",
      kind: "Projekt · ve vývoji",
      input: [
        ["Typ", "Vlastní projekt, ve vývoji"],
        [
          "Co řeší",
          "Sbírá živá data z blockchainu, analyzuje je a testuje obchodní strategie na realistických nákladech.",
        ],
      ],
      params: [
        {
          label: "Moje role",
          text: "Kód generoval AI agent Claude Code; já jsem projekt vedl, určoval cíle a pravidla, kontroloval výstupy, testoval a nasazoval.",
        },
        { label: "Nástroje", tools: ["Claude Code", "TypeScript/Node.js", "SQLite", "API (Helius, Jupiter, GeckoTerminal)", "DigitalOcean"] },
        {
          label: "Co systém dělá",
          list: [
            "Sběrač dat se sám obnovuje po výpadku a hlídá si rozpočet za placené API, nasbíral přes 30 milionů obchodů",
            "Otestováno 8 typů strategií, pravidla testů vždy zapsaná předem, aby výsledky nešlo přikrášlit",
            "Přes 100 automatických testů, mimo jiné ověření, že živý systém rozhoduje stejně jako simulace",
            "Vlastní zabezpečený server běžící 24/7, API klíče a SSH pod kontrolou, nic tajného ve veřejném kódu",
          ],
        },
      ],
      output: {
        stav: "ve vývoji, testy stále běží",
        nasbíráno_obchodů: "30 000 000+",
        otestováno_strategií: 8,
        automatických_testů: "100+",
        provoz: "24/7 na cloudovém serveru",
        ostrý_test: "virtuální peníze",
      },
      extra: [
        {
          highlight:
            "Průběžné zjištění: data zatím ukazují, že většina „rychlých zisků“ na memecoinech je pro běžného obchodníka ztrátová. Proto nejlepší strategii dál testuji jen s virtuálními penězi a další kroky řídím podle dat.",
        },
      ],
    },
    "job-kb": {
      title: "Komerční banka",
      kind: "Zkušenosti · Pracovník klientského kontaktního centra",
      input: [
        ["Období", "07/2026 – současnost"],
        ["Typ", "Zaměstnání"],
        ["Pozice", "Pracovník klientského kontaktního centra"],
      ],
      params: [
        {
          label: "Co dělám",
          list: [
            "Telefonicky oslovuji klienty kvůli převodu na nové internetové bankovnictví, až 100 hovorů denně.",
            "Převod s klientem dokončím přímo po telefonu, nebo mu domluvím schůzku s bankéřem.",
            "Komunikuji se soukromými klienty, podnikateli i firmami a pracuji v interních systémech banky.",
          ],
        },
      ],
      output: {
        hovorů_denně: "až 100",
        výsledek_hovoru: ["převod dokončený po telefonu", "schůzka s bankéřem"],
        klienti: ["soukromí klienti", "podnikatelé", "firmy"],
        co_jsem_si_odnesl: "Dobře vím, co zákazníci potřebují a kolik času zabere rutina.",
      },
    },
    "job-mcd": {
      title: "McDonald’s",
      kind: "Zkušenosti · Pracovník obsluhy",
      input: [
        ["Období", "03/2024 – 06/2025"],
        ["Typ", "Zaměstnání při studiu"],
        ["Pozice", "Pracovník obsluhy"],
      ],
      params: [
        {
          label: "Co jsem dělal",
          list: [
            "Obsluha velkého množství zákazníků v rychlém provozu, i ve špičkách.",
            "Práci jsem přes rok skloubil se studiem.",
          ],
        },
      ],
      output: {
        provoz: "rychlý, i ve špičkách",
        souběh_se_studiem: "přes rok",
      },
    },
    school: {
      title: "Střední průmyslová škola Zlín",
      kind: "Vzdělání · maturitní obor",
      input: [
        ["Období", "2022 – 2026"],
        ["Obor", "Elektrotechnika (maturitní obor)"],
      ],
      output: {
        obor: "Elektrotechnika",
        maturita: 2026,
      },
    },
    "lang-cs": {
      title: "Čeština",
      kind: "Vzdělání · jazyk",
      input: [["Typ", "Jazyk"]],
      output: { jazyk: "čeština", úroveň: "rodilý mluvčí" },
    },
    "lang-en": {
      title: "Angličtina",
      kind: "Vzdělání · jazyk",
      input: [["Typ", "Jazyk"]],
      output: { jazyk: "angličtina", úroveň: "B2", certifikát: "Cambridge FCE" },
    },
  };

  const ndv = document.querySelector("#ndv");
  const ndvTitle = ndv.querySelector("#ndv-title");
  const ndvKind = ndv.querySelector(".ndv-kind");
  const ndvIcon = ndv.querySelector(".ndv-icon");
  const ndvBody = ndv.querySelector(".ndv-body");
  const ndvInput = ndv.querySelector(".ndv-kv");
  const ndvParamsCol = ndv.querySelector(".ndv-params");
  const ndvParams = ndv.querySelector(".ndv-params-body");
  const ndvView = ndv.querySelector("#ndv-view");
  const ndvExtra = ndv.querySelector(".ndv-extra");
  const ndvFoot = ndv.querySelector(".ndv-foot");
  const viewButtons = Array.from(ndv.querySelectorAll(".ndv-view-btn"));
  let ndvData = null;
  let ndvOpener = null;

  function esc(value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function jsonValue(value) {
    if (Array.isArray(value)) {
      return "[" + value.map(jsonValue).join(", ") + "]";
    }
    if (typeof value === "number") return '<span class="j-n">' + value + "</span>";
    if (typeof value === "boolean") return '<span class="j-b">' + value + "</span>";
    return '<span class="j-s">"' + esc(value) + '"</span>';
  }

  // „hovorů_denně“ → „Hovorů denně“ pro tabulku a štítky
  function labelOf(key) {
    const text = key.replace(/_/g, " ");
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function plainValue(value) {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "ano" : "ne";
    return String(value);
  }

  function typeOf(value) {
    if (Array.isArray(value)) return ["[ ]", "array"];
    if (typeof value === "number") return ["#", "number"];
    if (typeof value === "boolean") return ["☑", "boolean"];
    return ["T", "string"];
  }

  function renderView(name) {
    viewButtons.forEach(function (button) {
      const active = button.dataset.view === name;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    const out = ndvData.output;
    const keys = Object.keys(out);
    if (name === "json") {
      ndvView.innerHTML =
        '<pre class="ndv-json"><code>[\n  {\n' +
        keys
          .map(function (key) {
            return '    <span class="j-k">"' + esc(key) + '"</span>: ' + jsonValue(out[key]);
          })
          .join(",\n") +
        "\n  }\n]</code></pre>";
    } else if (name === "schema") {
      ndvView.innerHTML =
        '<ul class="ndv-schema">' +
        keys
          .map(function (key) {
            const type = typeOf(out[key]);
            return (
              '<li><span class="type-badge" title="' + type[1] + '">' + type[0] + '</span><span class="schema-key">' +
              esc(key) + '</span><span class="schema-sample">' + esc(plainValue(out[key])) + "</span></li>"
            );
          })
          .join("") +
        "</ul>";
    } else {
      ndvView.innerHTML =
        '<table class="ndv-table"><tbody>' +
        keys
          .map(function (key) {
            return '<tr><th scope="row">' + esc(labelOf(key)) + "</th><td>" + esc(plainValue(out[key])) + "</td></tr>";
          })
          .join("") +
        "</tbody></table>";
    }
  }

  function renderNdv(id, host) {
    ndvData = NDV[id];
    ndvTitle.textContent = ndvData.title;
    ndvKind.textContent = ndvData.kind;
    const icon = host.querySelector(".node-icon svg, .tl-logo svg");
    ndvIcon.replaceChildren(icon ? icon.cloneNode(true) : "");
    ndvIcon.classList.toggle("is-logo", Boolean(icon && icon.closest(".tl-logo")));

    ndvInput.innerHTML = ndvData.input
      .map(function (row) {
        return "<div><dt>" + esc(row[0]) + "</dt><dd>" + esc(row[1]) + "</dd></div>";
      })
      .join("");

    const params = ndvData.params || [];
    ndvParamsCol.hidden = params.length === 0;
    ndvBody.classList.toggle("no-params", params.length === 0);
    ndvParams.innerHTML = params
      .map(function (field) {
        let box = "";
        if (field.text) box = '<div class="ndv-field-box"><p>' + esc(field.text) + "</p></div>";
        if (field.list) {
          box = '<div class="ndv-field-box"><ul>' + field.list.map(function (item) {
            return "<li>" + esc(item) + "</li>";
          }).join("") + "</ul></div>";
        }
        if (field.tools) {
          box = '<ul class="pills">' + field.tools.map(function (tool) {
            return "<li>" + esc(tool) + "</li>";
          }).join("") + "</ul>";
        }
        if (field.figure) {
          box =
            '<figure class="ndv-figure"><img src="' + esc(field.figure.src) + '" alt="' + esc(field.figure.alt) +
            '" width="1200" height="800" loading="lazy" /></figure>';
        }
        return '<div class="ndv-field"><span class="ndv-field-label">' + esc(field.label) + "</span>" + box + "</div>";
      })
      .join("");

    const extra = ndvData.extra || [];
    ndvExtra.innerHTML = extra
      .filter(function (item) {
        return item.highlight;
      })
      .map(function (item) {
        return '<p class="output-highlight">' + esc(item.highlight) + "</p>";
      })
      .join("");
    const links = extra.filter(function (item) {
      return item.link;
    });
    ndvFoot.hidden = links.length === 0;
    ndvFoot.innerHTML = links
      .map(function (item) {
        return (
          '<p class="ndv-foot-note">' + esc(item.note) + "</p>" +
          '<a class="btn btn-accent" href="' + esc(item.link) + '" target="_blank" rel="noopener noreferrer">' +
          esc(item.label) + ICONS.external + "</a>"
        );
      })
      .join("");

    renderView("table");
  }

  function openNdv(id, host, opener) {
    if (!NDV[id]) return;
    renderNdv(id, host);
    ndvOpener = opener || host;
    ndv.showModal();
    ndv.querySelector(".ndv-close").focus();
    if (reducedMotion.matches) return;
    const from = host.getBoundingClientRect();
    const box = ndv.getBoundingClientRect();
    ndv.style.transformOrigin =
      (from.left + from.width / 2 - box.left).toFixed(0) + "px " + (from.top + from.height / 2 - box.top).toFixed(0) + "px";
    ndv.animate(
      [
        { opacity: 0, transform: "scale(0.6)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
    );
  }

  ndv.querySelector(".ndv-close").addEventListener("click", function () {
    ndv.close();
  });

  ndv.addEventListener("click", function (event) {
    if (event.target === ndv) ndv.close();
  });

  ndv.addEventListener("close", function () {
    if (ndvOpener && document.contains(ndvOpener)) ndvOpener.focus();
  });

  viewButtons.forEach(function (button, index) {
    button.addEventListener("click", function () {
      renderView(button.dataset.view);
    });
    button.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const step = event.key === "ArrowRight" ? 1 : -1;
      const next = viewButtons[(index + step + viewButtons.length) % viewButtons.length];
      renderView(next.dataset.view);
      next.focus();
    });
  });

  function focusTarget(host) {
    return host.querySelector(".tl-head, [data-ndv-open]") || host;
  }

  document.addEventListener("click", function (event) {
    const toolbarButton = event.target.closest(".tb-btn");
    if (toolbarButton) {
      if (toolbarButton.dataset.action === "ndv") {
        const host = toolbarButton.closest("[data-ndv]");
        openNdv(host.dataset.ndv, host, focusTarget(host));
      }
      return;
    }
    const openButton = event.target.closest("[data-ndv-open]");
    if (openButton) {
      const host = openButton.closest("[data-ndv]");
      openNdv(openButton.dataset.ndvOpen, host, openButton);
      return;
    }
    const host = event.target.closest("[data-ndv]");
    if (host && !event.target.closest("a, button")) {
      openNdv(host.dataset.ndv, host, focusTarget(host));
    }
  });

  /* ---------- Zkušenosti a vzdělání: rozbalení a postupné odhalení ---------- */

  document.querySelectorAll(".tl-more-inner[data-fill]").forEach(function (box) {
    const id = box.dataset.fill;
    const data = NDV[id];
    const points = (data.params || []).reduce(function (all, field) {
      if (field.list) return all.concat(field.list);
      if (field.text) return all.concat([field.text]);
      return all;
    }, []);
    let html = '<div class="tl-more-body">';
    if (points.length) {
      html += "<ul>" + points.map(function (point) {
        return "<li>" + esc(point) + "</li>";
      }).join("") + "</ul>";
    }
    html += '<ul class="tl-out" aria-label="Výstup">' + Object.keys(data.output).map(function (key) {
      return "<li><b>" + esc(labelOf(key)) + ":</b> " + esc(plainValue(data.output[key])) + "</li>";
    }).join("") + "</ul>";
    html +=
      '<button type="button" class="btn btn-ghost btn-sm" data-ndv-open="' + id +
      '" aria-haspopup="dialog">Otevřít detail ' + ICONS.play + "</button></div>";
    box.innerHTML = html;
  });

  document.querySelectorAll(".tl-head").forEach(function (head) {
    const node = head.closest(".tl-node");
    const more = node.querySelector(".tl-more");
    head.addEventListener("click", function () {
      const open = head.getAttribute("aria-expanded") !== "true";
      head.setAttribute("aria-expanded", String(open));
      node.classList.toggle("is-open", open);
      more.inert = !open;
    });
  });

  /* ---------- Postupné objevování bloků při scrollu ---------- */

  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    // Co je vidět hned po načtení, zobrazíme bez animace; zbytek „natáhneme“ až pod obrazovkou.
    // Spojnice se nikdy neschovávají, mizí a objevují se jen samotné bloky.
    revealItems.forEach(function (item) {
      const rect = item.getBoundingClientRect();
      const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
      item.classList.add("is-armed");
      if (onScreen) item.classList.add("is-revealed", "reveal-instant");
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        revealItems.forEach(function (item) {
          item.classList.remove("reveal-instant");
        });
      });
    });

    // Blok se objeví pokaždé, když vjede na obrazovku, a schová se, až z ní úplně odjede.
    // Podle strany, kam odjel, se pak vrací zespodu (scroll dolů) nebo shora (scroll nahoru).
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const el = entry.target;
          const visibleEnough =
            entry.intersectionRatio >= 0.12 || entry.intersectionRect.height >= window.innerHeight * 0.25;
          if (entry.isIntersecting && visibleEnough) {
            el.classList.add("is-revealed");
          } else if (!entry.isIntersecting) {
            el.dataset.side = entry.boundingClientRect.top < 0 ? "above" : "below";
            el.classList.remove("is-revealed");
          }
        });
      },
      { threshold: [0, 0.12, 0.25], rootMargin: "0px 0px -6% 0px" }
    );
    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  /* ---------- Dovednosti: přepínač Seznam / JSON ---------- */

  const skillCats = Array.from(document.querySelectorAll(".skill-cat"));
  skillCats.forEach(function (cat) {
    const rows = cat.querySelector(".skill-rows");
    const items = Array.from(rows.children).map(function (li) {
      return li.textContent.trim();
    });
    const pre = document.createElement("pre");
    pre.className = "skill-json";
    pre.hidden = true;
    pre.innerHTML =
      "<code>{\n  " + '<span class="j-k">"' + esc(cat.querySelector("h3").textContent) + '"</span>: [\n' +
      items.map(function (item) {
        return '    <span class="j-s">"' + esc(item) + '"</span>';
      }).join(",\n") +
      "\n  ]\n}</code>";
    cat.append(pre);
  });

  const viewButtons2 = Array.from(document.querySelectorAll(".skills-view-btn"));
  viewButtons2.forEach(function (button) {
    button.addEventListener("click", function () {
      const json = button.dataset.view === "json";
      viewButtons2.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === button));
      });
      skillCats.forEach(function (cat) {
        cat.querySelector(".skill-rows").hidden = json;
        cat.querySelector(".skill-json").hidden = !json;
      });
    });
  });

  /* ---------- Mini-ukázka workflow v hero ---------- */

  const stage = document.querySelector("#demo-stage");
  const runButton = document.querySelector("#demo-run");
  const output = document.querySelector("#wf-output");
  const demoStatus = document.querySelector("#demo-status");
  const mailCard = stage.querySelector(".wf-mail");
  const bubble = document.querySelector("#wf-bubble");
  const bubbleClose = bubble.querySelector(".wf-bubble-close");
  const chipLayer = stage.querySelector(".wf-chips");
  const pulseLayer = stage.querySelector(".wf-pulses");

  const demoNodes = {
    mail: document.querySelector("#wf-n-mail"),
    ai: document.querySelector("#wf-n-ai"),
    sheet: document.querySelector("#wf-n-sheet"),
    draft: document.querySelector("#wf-n-draft"),
    alert: document.querySelector("#wf-n-alert"),
  };

  const edges = {
    e1: document.querySelector("#wf-e1"),
    e2: document.querySelector("#wf-e2"),
    e3: document.querySelector("#wf-e3"),
    e4: document.querySelector("#wf-e4"),
  };

  // Štítky „1 item“ uprostřed každé čáry
  const chips = {};
  Object.keys(edges).forEach(function (key) {
    const path = edges[key];
    const point = path.getPointAtLength(path.getTotalLength() / 2);
    const chip = document.createElementNS(SVG_NS, "g");
    chip.setAttribute("class", "wf-chip");
    chip.setAttribute("transform", "translate(" + point.x + " " + point.y + ")");
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", "-17");
    rect.setAttribute("y", "-6.5");
    rect.setAttribute("width", "34");
    rect.setAttribute("height", "13");
    rect.setAttribute("rx", "6.5");
    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("y", "2.6");
    text.textContent = "1 item";
    chip.append(rect, text);
    chipLayer.append(chip);
    chips[key] = chip;
  });

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  // Světelný bod, který projede po čáře
  function travel(path, duration) {
    return new Promise(function (resolve) {
      const length = path.getTotalLength();
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("class", "wf-pulse");
      dot.setAttribute("r", "4.5");
      pulseLayer.append(dot);
      const start = performance.now();
      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const point = path.getPointAtLength(eased * length);
        dot.setAttribute("cx", point.x);
        dot.setAttribute("cy", point.y);
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          dot.remove();
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  function setNode(key, state) {
    demoNodes[key].classList.toggle("is-running", state === "running");
    demoNodes[key].classList.toggle("is-done", state === "done");
  }

  function finishEdge(key) {
    edges[key].classList.add("is-done");
    chips[key].classList.add("is-visible");
  }

  function resetDemo() {
    Object.keys(demoNodes).forEach(function (key) {
      setNode(key, "idle");
    });
    Object.keys(edges).forEach(function (key) {
      edges[key].classList.remove("is-done");
      chips[key].classList.remove("is-visible");
    });
    pulseLayer.replaceChildren();
    output.classList.remove("is-visible");
    output.setAttribute("aria-hidden", "true");
    demoStatus.textContent = "";
  }

  function showFinalState() {
    Object.keys(demoNodes).forEach(function (key) {
      setNode(key, "done");
    });
    Object.keys(edges).forEach(finishEdge);
    output.classList.add("is-visible");
    output.setAttribute("aria-hidden", "false");
    demoStatus.textContent = "Workflow proběhlo. Výstup AI a výsledky tří větví jsou zobrazené pod ukázkou.";
  }

  function flyMailIntoNode() {
    const box = demoNodes.mail.querySelector(".wf-box").getBoundingClientRect();
    const card = mailCard.getBoundingClientRect();
    const dx = box.left + box.width / 2 - (card.left + card.width / 2);
    const dy = box.top + box.height / 2 - (card.top + card.height / 2);
    const target = "translate(" + dx + "px, " + dy + "px)";
    const animation = mailCard.animate(
      [
        { opacity: 0, transform: "translateY(-10px)" },
        { opacity: 1, transform: "translateY(0)", offset: 0.3 },
        { opacity: 1, transform: target + " scale(0.3)", offset: 0.88 },
        { opacity: 0, transform: target + " scale(0.1)" },
      ],
      { duration: 900, easing: "cubic-bezier(0.5, 0, 0.3, 1)" }
    );
    return animation.finished;
  }

  let running = false;

  async function runDemo() {
    if (running) return;
    running = true;
    setBubbleOpen(false);
    resetDemo();

    if (reducedMotion.matches) {
      showFinalState();
      runButton.textContent = "↻ Spustit znovu";
      running = false;
      return;
    }

    runButton.disabled = true;
    runButton.textContent = "Běží…";
    demoStatus.textContent = "Workflow běží.";

    await flyMailIntoNode();
    setNode("mail", "running");
    await wait(200);
    setNode("mail", "done");

    await travel(edges.e1, 550);
    finishEdge("e1");
    setNode("ai", "running");
    await wait(1200);
    setNode("ai", "done");

    const branches = [
      ["e2", "sheet"],
      ["e3", "draft"],
      ["e4", "alert"],
    ];
    await Promise.all(
      branches.map(function (branch, index) {
        return wait(index * 120)
          .then(function () {
            return travel(edges[branch[0]], 650);
          })
          .then(function () {
            finishEdge(branch[0]);
            setNode(branch[1], "done");
          });
      })
    );

    await wait(250);
    showFinalState();
    runButton.disabled = false;
    runButton.textContent = "↻ Spustit znovu";
    running = false;
  }

  runButton.addEventListener("click", runDemo);

  // Bublina se vstupním e-mailem po kliknutí na node „Nový e-mail“
  function setBubbleOpen(open) {
    bubble.hidden = !open;
    demoNodes.mail.setAttribute("aria-expanded", String(open));
  }

  demoNodes.mail.addEventListener("click", function () {
    setBubbleOpen(bubble.hidden);
  });

  demoNodes.mail.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setBubbleOpen(bubble.hidden);
    }
  });

  bubbleClose.addEventListener("click", function () {
    setBubbleOpen(false);
    demoNodes.mail.focus();
  });

  document.addEventListener("click", function (event) {
    if (!bubble.hidden && !bubble.contains(event.target) && !demoNodes.mail.contains(event.target)) {
      setBubbleOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    setNavOpen(false);
    if (!bubble.hidden) {
      setBubbleOpen(false);
      demoNodes.mail.focus();
    }
  });

  /* ---------- Horní lišta: aktivní sekce ---------- */

  const navLinks = Array.from(siteNav.querySelectorAll("a"));
  navSections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);
  let activeLinkId = null;

  function setActiveLink(id) {
    if (id === activeLinkId) return;
    activeLinkId = id;
    navLinks.forEach(function (link) {
      const active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  let navFrame = 0;
  function updateActiveLink() {
    navFrame = 0;
    const line = window.scrollY + topbarHeight + window.innerHeight * 0.3;
    let current = "";
    sectionTops.forEach(function (section) {
      if (section.top <= line) current = section.id;
    });
    if (window.scrollY + window.innerHeight >= pageHeight - 4 && sectionTops.length) {
      current = sectionTops[sectionTops.length - 1].id;
    }
    setActiveLink(current);
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!navFrame) navFrame = requestAnimationFrame(updateActiveLink);
    },
    { passive: true }
  );
  measureSections();
  updateActiveLink();

  if ("IntersectionObserver" in window) {
    // Na konci stránky jednou ukázat „Workflow executed successfully“
    const toast = document.querySelector("#toast");
    const footer = document.querySelector("#paticka");
    const endObserver = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || window.scrollY < 200) return;
      endObserver.disconnect();
      setActiveLink("kontakt");
      toast.innerHTML = ICONS.check + "<span>Workflow executed successfully</span>";
      requestAnimationFrame(function () {
        toast.classList.add("is-visible");
      });
      setTimeout(function () {
        toast.classList.remove("is-visible");
        setTimeout(function () {
          toast.replaceChildren();
        }, 400);
      }, 4000);
    });
    endObserver.observe(footer);
  }
})();
