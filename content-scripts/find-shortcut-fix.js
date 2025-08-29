(function() {
  // Prevent duplicates
  if (document.getElementById("skiovox-findbar")) return;

  // ---- UI ----
  const bar = document.createElement("div");
  bar.id = "skiovox-findbar";
  bar.style = `
    position: fixed;
    top: 0; right: 0;
    background: #f1f3f4;
    border: 1px solid #ccc;
    border-top: none;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
    font-family: Arial, sans-serif;
    font-size: 13px;
    z-index: 999999;
  `;

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Find in page";
  input.style = `
    flex: 1;
    padding: 2px 4px;
    font-size: 13px;
  `;

  const counter = document.createElement("span");
  counter.textContent = "0 of 0";
  counter.style = "min-width: 60px; text-align: center; color: #555;";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "↑";
  prevBtn.title = "Previous match";
  prevBtn.style = "padding: 2px 6px;";

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "↓";
  nextBtn.title = "Next match";
  nextBtn.style = "padding: 2px 6px;";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.title = "Close";
  closeBtn.style = "padding: 2px 6px;";

  bar.appendChild(input);
  bar.appendChild(counter);
  bar.appendChild(prevBtn);
  bar.appendChild(nextBtn);
  bar.appendChild(closeBtn);
  document.body.appendChild(bar);

  input.focus();

  // ---- Highlighting ----
  let matches = [];
  let currentIndex = -1;

  function clearHighlights() {
    matches.forEach(m => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
    matches = [];
    currentIndex = -1;
  }

  function highlight(term) {
    clearHighlights();
    if (!term) {
      counter.textContent = "0 of 0";
      return;
    }

    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");

    function walk(node) {
      if (node.nodeType === 3) { // text node
        let match;
        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        while ((match = regex.exec(node.data)) !== null) {
          const before = node.data.slice(lastIndex, match.index);
          if (before) frag.appendChild(document.createTextNode(before));

          const mark = document.createElement("mark");
          mark.textContent = match[0];
          mark.style.background = "#ffeb3b";
          frag.appendChild(mark);
          matches.push(mark);

          lastIndex = regex.lastIndex;
        }
        const after = node.data.slice(lastIndex);
        if (after) frag.appendChild(document.createTextNode(after));
        if (frag.childNodes.length) node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
        Array.from(node.childNodes).forEach(walk);
      }
    }

    walk(document.body);

    if (matches.length) {
      currentIndex = 0;
      updateActive();
    }
    counter.textContent = `${matches.length ? currentIndex + 1 : 0} of ${matches.length}`;
  }

  function updateActive() {
    matches.forEach((m, i) => {
      m.style.background = i === currentIndex ? "#ff9800" : "#ffeb3b";
    });
    if (matches[currentIndex]) {
      matches[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    }
    counter.textContent = `${matches.length ? currentIndex + 1 : 0} of ${matches.length}`;
  }

  // ---- Events ----
  input.addEventListener("input", () => highlight(input.value));

  nextBtn.addEventListener("click", () => {
    if (!matches.length) return;
    currentIndex = (currentIndex + 1) % matches.length;
    updateActive();
  });

  prevBtn.addEventListener("click", () => {
    if (!matches.length) return;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;
    updateActive();
  });

  closeBtn.addEventListener("click", () => {
    clearHighlights();
    bar.remove();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      clearHighlights();
      bar.remove();
    }
  });
})();
