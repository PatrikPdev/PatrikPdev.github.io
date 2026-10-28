(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  /* ---------- Detail projektu (vysouvací panel) ---------- */

  const projects = {
    email: { title: "AI asistent na zákaznické e-maily" },
    deskdeed: { title: "DeskDeed: CRM pro realitní makléře v Notionu" },
    bot: { title: "Solana trading bot: výzkum a automatizace s AI agentem" },
  };

  const drawer = document.querySelector("#project-drawer");
  const drawerTitle = document.querySelector("#drawer-title");
  const panelPopis = document.querySelector("#panel-popis");
  const panelVystup = document.querySelector("#panel-vystup");
  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));

  function fillTemplate(id, target) {
    const template = document.querySelector(id);
    target.replaceChildren(template.content.cloneNode(true));
  }

  function setTab(name) {
    tabButtons.forEach(function (button) {
      const active = button.dataset.tab === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panelPopis.classList.toggle("is-active", name === "popis");
    panelVystup.classList.toggle("is-active", name === "vystup");
    panelPopis.hidden = name !== "popis";
    panelVystup.hidden = name !== "vystup";
  }

  function openProject(key) {
    const project = projects[key];
    if (!project) return;
    drawerTitle.textContent = project.title;
    fillTemplate("#tpl-" + key + "-popis", panelPopis);
    fillTemplate("#tpl-" + key + "-vystup", panelVystup);
    setTab("popis");
    if (typeof drawer.showModal === "function") {
      drawer.showModal();
    }
  }

  document.querySelectorAll("[data-open-project]").forEach(function (button) {
    button.addEventListener("click", function () {
      openProject(button.dataset.openProject);
    });
  });

  tabButtons.forEach(function (button, index) {
    button.addEventListener("click", function () {
      setTab(button.dataset.tab);
    });
    button.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const step = event.key === "ArrowRight" ? 1 : -1;
      const next = tabButtons[(index + step + tabButtons.length) % tabButtons.length];
      setTab(next.dataset.tab);
      next.focus();
    });
  });

  document.querySelectorAll("[data-close-drawer]").forEach(function (button) {
    button.addEventListener("click", function () {
      drawer.close();
    });
  });

  drawer.addEventListener("click", function (event) {
    if (event.target === drawer) {
      drawer.close();
    }
  });

  drawer.addEventListener("close", function () {
    panelPopis.replaceChildren();
    panelVystup.replaceChildren();
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
  const SVG_NS = "http://www.w3.org/2000/svg";

  const nodes = {
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
    nodes[key].classList.toggle("is-running", state === "running");
    nodes[key].classList.toggle("is-done", state === "done");
  }

  function finishEdge(key) {
    edges[key].classList.add("is-done");
    chips[key].classList.add("is-visible");
  }

  function resetDemo() {
    Object.keys(nodes).forEach(function (key) {
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
    Object.keys(nodes).forEach(function (key) {
      setNode(key, "done");
    });
    Object.keys(edges).forEach(finishEdge);
    output.classList.add("is-visible");
    output.setAttribute("aria-hidden", "false");
    demoStatus.textContent = "Workflow proběhlo. Výstup AI a výsledky tří větví jsou zobrazené pod ukázkou.";
  }

  function flyMailIntoNode() {
    const box = nodes.mail.querySelector(".wf-box").getBoundingClientRect();
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
    nodes.mail.setAttribute("aria-expanded", String(open));
  }

  nodes.mail.addEventListener("click", function () {
    setBubbleOpen(bubble.hidden);
  });

  nodes.mail.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setBubbleOpen(bubble.hidden);
    }
  });

  bubbleClose.addEventListener("click", function () {
    setBubbleOpen(false);
    nodes.mail.focus();
  });

  document.addEventListener("click", function (event) {
    if (!bubble.hidden && !bubble.contains(event.target) && !nodes.mail.contains(event.target)) {
      setBubbleOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    setNavOpen(false);
    if (drawer.open) {
      drawer.close();
    }
    if (!bubble.hidden) {
      setBubbleOpen(false);
      nodes.mail.focus();
    }
  });

  /* ---------- Oživení stránky při scrollu ---------- */

  const checkIcon =
    '<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="8" fill="#22c55e" />' +
    '<path d="M4.5 8.2l2.2 2.2 4.8-5" fill="none" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>';

  // Zelená fajfka v záhlaví každého nodu (kromě ukázky workflow)
  const donePanels = Array.from(document.querySelectorAll(".node-panel")).filter(function (panel) {
    return !panel.classList.contains("demo-panel");
  });
  donePanels.forEach(function (panel) {
    const head = panel.querySelector(".node-head");
    if (!head) return;
    const mark = document.createElement("span");
    mark.className = "node-done";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = checkIcon;
    head.append(mark);
  });

  const connectors = Array.from(document.querySelectorAll(".flow-connector, .branch"));
  const supportsObserver = "IntersectionObserver" in window;

  function drawConnector(connector) {
    connector.classList.add("is-drawn");
    if (reducedMotion.matches || !connector.classList.contains("flow-connector")) return;
    setTimeout(function () {
      connector.classList.add("is-pulsing");
    }, 700);
    connector.addEventListener(
      "animationend",
      function () {
        connector.classList.remove("is-pulsing");
      },
      { once: true }
    );
  }

  if (!supportsObserver || reducedMotion.matches) {
    connectors.forEach(function (connector) {
      connector.classList.add("is-drawn");
    });
    donePanels.forEach(function (panel) {
      panel.classList.add("is-done");
    });
  } else {
    const connectorObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          drawConnector(entry.target);
          connectorObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.8 }
    );
    connectors.forEach(function (connector) {
      connectorObserver.observe(connector);
    });

    const panelObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-done");
          panelObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );
    donePanels.forEach(function (panel) {
      panelObserver.observe(panel);
    });
  }

  // Zvýraznění aktivní sekce v horní liště
  const navLinks = Array.from(siteNav.querySelectorAll("a"));
  const sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  function setActiveLink(id) {
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

  if (supportsObserver) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  // Na konci stránky jednou ukázat „Workflow executed successfully“
  const toast = document.querySelector("#toast");
  let toastShown = false;

  function checkPageEnd() {
    if (toastShown) return;
    const scrolledToEnd =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
    if (!scrolledToEnd || window.scrollY < 200) return;
    toastShown = true;
    setActiveLink("kontakt");
    toast.innerHTML = checkIcon + "<span>Workflow executed successfully</span>";
    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });
    setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () {
        toast.replaceChildren();
      }, 400);
    }, 4000);
    window.removeEventListener("scroll", checkPageEnd);
  }

  window.addEventListener("scroll", checkPageEnd, { passive: true });
})();
