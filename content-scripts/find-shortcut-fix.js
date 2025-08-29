function createFindBar() {
  if (document.getElementById("custom-find-bar")) return; // prevent duplicates

  const bar = document.createElement("div");
  bar.id = "custom-find-bar";
  bar.innerHTML = `
    <style>
      #custom-find-bar {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        height: 40px;
        background: #f1f3f4;
        border-bottom: 1px solid #dcdcdc;
        display: flex;
        align-items: center;
        padding: 0 10px;
        font-family: sans-serif;
        z-index: 999999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      #custom-find-bar input {
        flex: 1;
        margin: 0 8px;
        padding: 5px;
        font-size: 14px;
      }
      #custom-find-bar button {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 5px 8px;
        font-size: 14px;
      }
      #custom-find-bar span {
        font-size: 13px;
        margin-right: 10px;
      }
    </style>
    <input type="text" placeholder="Find in page" />
    <span id="custom-find-count">0 of 0</span>
    <button id="custom-find-prev">⬆</button>
    <button id="custom-find-next">⬇</button>
    <button id="custom-find-close">✕</button>
  `;

  document.body.appendChild(bar);

  const input = bar.querySelector("input");
  const count = bar.querySelector("#custom-find-count");
  let matches = [];
  let currentIndex = 0;

  function updateHighlights() {
    // clear old highlights
    document.querySelectorAll("mark[data-find]").forEach(el => {
      el.replaceWith(...el.childNodes);
    });

    matches = [];
    if (!input.value) {
      count.textContent = "0 of 0";
      return;
    }

    // highlight matches
    const regex = new RegExp(input.value, "gi");
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentNode && !["SCRIPT","STYLE"].includes(node.parentNode.tagName)) {
        const text = node.nodeValue;
        if (regex.test(text)) {
          const span = document.createElement("mark");
          span.setAttribute("data-find", "true");
          span.style.background = "yellow";
          span.textContent = text;
          node.replaceWith(span);
          matches.push(span);
        }
      }
    }

    if (matches.length) {
      currentIndex = 0;
      scrollToMatch();
    }
    count.textContent = `${matches.length ? currentIndex+1 : 0} of ${matches.length}`;
  }

  function scrollToMatch() {
    if (!matches.length) return;
    matches.forEach(m => m.style.background = "yellow");
    matches[currentIndex].style.background = "orange";
    matches[currentIndex].scrollIntoView({behavior: "smooth", block: "center"});
    count.textContent = `${currentIndex+1} of ${matches.length}`;
  }

  input.addEventListener("input", updateHighlights);

  bar.querySelector("#custom-find-next").onclick = () => {
    if (matches.length) {
      currentIndex = (currentIndex + 1) % matches.length;
      scrollToMatch();
    }
  };

  bar.querySelector("#custom-find-prev").onclick = () => {
    if (matches.length) {
      currentIndex = (currentIndex - 1 + matches.length) % matches.length;
      scrollToMatch();
    }
  };

  bar.querySelector("#custom-find-close").onclick = () => {
    document.getElementById("custom-find-bar").remove();
    document.querySelectorAll("mark[data-find]").forEach(el => {
      el.replaceWith(...el.childNodes);
    });
  };

  input.focus();
}
