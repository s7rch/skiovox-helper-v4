let findOverlay;

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "FIND_BAR") {
    if (!findOverlay) {
      createFindOverlay();
    } else {
      toggleFindOverlay();
    }
  }
});

function createFindOverlay() {
  findOverlay = document.createElement("div");
  findOverlay.style.position = "fixed";
  findOverlay.style.bottom = "10px";
  findOverlay.style.right = "10px";
  findOverlay.style.padding = "6px";
  findOverlay.style.background = "#fff";
  findOverlay.style.border = "1px solid #ccc";
  findOverlay.style.borderRadius = "6px";
  findOverlay.style.zIndex = "999999";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Find in page...";
  input.style.width = "200px";

  input.addEventListener("input", () => {
    highlightMatches(input.value);
  });

  findOverlay.appendChild(input);
  document.body.appendChild(findOverlay);
}

function toggleFindOverlay() {
  if (findOverlay.style.display === "none") {
    findOverlay.style.display = "block";
  } else {
    findOverlay.style.display = "none";
  }
}

function highlightMatches(text) {
  removeHighlights();

  if (!text) return;

  const regex = new RegExp(text, "gi");
  walk(document.body, (node) => {
    const match = node.nodeValue && node.nodeValue.match(regex);
    if (match) {
      const span = document.createElement("span");
      span.style.background = "yellow";
      span.textContent = node.nodeValue;
      node.parentNode.replaceChild(span, node);
    }
  });
}

function removeHighlights() {
  document.querySelectorAll("span[style*='yellow']").forEach(el => {
    el.outerHTML = el.innerText;
  });
}

function walk(node, callback) {
  if (node.nodeType === 3) {
    callback(node);
  } else {
    node = node.firstChild;
    while (node) {
      walk(node, callback);
      node = node.nextSibling;
    }
  }
}
