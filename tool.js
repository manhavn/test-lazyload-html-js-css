const iframeAppData = { keyboard: {}, iframeEvent: {}, addItem: {} };

function getRandomId() {
  const digits = "abcdefghijklmnopqrstuvwxyz";
  const n = digits.length;
  let uuid = "";
  for (let i = 0; i < 8; i++) {
    uuid += digits[Math.floor(Math.random() * n)];
  }
  return uuid;
}

async function requestAsync(url) {
  const response = await fetch(url);
  return response.ok ? await response.text() : "";
}

async function getDataFromItem(urlGet, dataType, dataId) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = await requestAsync(
    `${urlGet}/${dataType}/${dataId}.html`,
  );
  const html = tempDiv.firstElementChild;
  const result = { html };
  if (html && html.hasAttribute("js")) {
    const js = await requestAsync(`${urlGet}/${dataType}/${dataId}.js`);
    if (js) result.js = js;
  }
  if (html && html.hasAttribute("css")) {
    const css = await requestAsync(`${urlGet}/${dataType}/${dataId}.css`);
    if (css) result.css = css;
  }
  return result;
}

function moveAction() {
  console.log("moveAction");
}

function onMouseMove(event) {
  event.preventDefault();
  iframeAppData.iframeEvent[event.type] = event;
  clearTimeout(iframeAppData.iframeEvent.mousemoveTimeout);
  iframeAppData.iframeEvent.mousemoveTimeout = setTimeout(moveAction, 10);
}

function parentAction(event) {
  event.preventDefault();
  iframeAppData.iframeEvent[event.type] = event;
  console.log(event.type);
}

function blurAction(event) {
  event.preventDefault();
  const keyboard = iframeAppData.keyboard;
  for (const keyboardKey in keyboard) {
    if (keyboard[keyboardKey]) keyboard[keyboardKey] = false;
  }
}

function removeDropZone() {
  iframeAppData.allowDrop = null;
  const tmpDropElement = iframeAppData.dataIframe?.tmpDropElement;
  if (tmpDropElement) tmpDropElement.parentElement?.removeChild(tmpDropElement);
  const dropZoneId = `drop-zone-${iframeAppData.dataId}`;
  iframeAppData.contentDocument
    .querySelectorAll(`[${dropZoneId}]`)
    .forEach((el) => {
      el.removeAttribute(dropZoneId);
    });
  return dropZoneId;
}

function openContextMenu() {
  console.log(iframeAppData.iframeEvent["mousedown"]?.target);
}

function onMouseDown(event) {
  const iframeEvent = iframeAppData.iframeEvent;
  switch (event.button) {
    case 0:
      iframeEvent[event.type] = event;
      const dropZoneId = removeDropZone();
      event.target.setAttribute(dropZoneId, "");
      iframeAppData.contentWindow.onmousemove = onMouseMove;
      break;
    case 2:
      if (!iframeEvent[event.type]) {
        iframeEvent[event.type] = event;
      }
      openContextMenu();
      break;
    default:
      break;
  }
}

function onMouseUp(event) {
  event.preventDefault();
  iframeAppData.iframeEvent[event.type] = event;
  iframeAppData.contentWindow.onmousemove = null;
}

function onKeyDown(event) {
  event.preventDefault();
  iframeAppData.iframeEvent[event.type] = event;
  iframeAppData.keyboard[event.key] = true;
}

function onKeyUp(event) {
  event.preventDefault();
  iframeAppData.iframeEvent[event.type] = event;
  iframeAppData.keyboard[event.key] = false;
}

function dragLeaveAction(event) {
  event.preventDefault();
  iframeAppData.iframeEvent[event.type] = event;
  if (event.target === iframeAppData.contentDocument.documentElement) {
    removeDropZone();
  }
}

function run(query) {
  const appIframe = document.querySelector(query);
  const { contentWindow, contentDocument } = appIframe;
  iframeAppData.appIframe = appIframe;
  iframeAppData.contentWindow = contentWindow;
  iframeAppData.contentDocument = contentDocument;
  const dataId = contentWindow["dataId"];
  if (dataId) iframeAppData.dataIframe = contentWindow[dataId];
  iframeAppData.dataId = dataId;

  const style = document.createElement("style");
  style.setAttribute("style-id", dataId);
  style.textContent = `
  body { min-width: 90vw; min-height: 90vh; }
  body [data-type="section"] { min-height: 15px; }
  html [drop-zone-${dataId}] { outline: 1px dashed #0909 !important; }
  [drag="section"] body { background-color: #0901 !important; }
  [drag="layout"] body, [drag="widget"] body, [drag="widget"] [layout] { background-color: #90000006 !important; }
  [drag="layout"] [layout], [drag="widget"] [widget] { background-color: #0901; outline: 0.5px dashed #0999; }
  [drag="section"] [data-type="section"], [drag="layout"] [data-type="layout"], [drag="widget"] [data-type="widget"] { opacity: 0.5 !important; outline: 0.5px dashed #9009 !important; }
  .tmp-drop-element { outline: 2px solid #0559 !important; }
  `;
  contentDocument.head.appendChild(style);

  contentWindow.onmousedown = onMouseDown;
  contentWindow.onmouseup = onMouseUp;

  contentWindow.onmouseover = parentAction;
  contentWindow.onmouseout = parentAction;
  contentWindow.onmouseenter = parentAction;
  contentWindow.onmouseleave = parentAction;

  contentWindow.onclick = parentAction;
  contentWindow.onauxclick = parentAction;
  contentWindow.ondblclick = parentAction;
  contentWindow.oncontextmenu = parentAction;

  contentWindow.onblur = blurAction;
  contentWindow.onfocus = parentAction;

  contentWindow.onclose = parentAction;
  contentWindow.onabort = parentAction;
  contentWindow.onbeforeinput = parentAction;
  contentWindow.oninput = parentAction;
  contentWindow.onchange = parentAction;
  contentWindow.oncopy = parentAction;
  contentWindow.oncut = parentAction;
  contentWindow.onpaste = parentAction;

  // contentWindow.ondrag = parentAction;
  // contentWindow.ondragstart = parentAction;
  // contentWindow.ondragover = parentAction;
  // contentWindow.ondrop = parentAction;
  contentWindow.ondragleave = dragLeaveAction;

  contentWindow.onkeydown = onKeyDown;
  contentWindow.onkeyup = onKeyUp;

  URL.revokeObjectURL(appIframe.src);
}

function getDoctypeString(dc) {
  const doctype = dc.doctype;
  if (doctype && doctype.nodeType === 10) {
    return `<!DOCTYPE ${doctype.name}${doctype.publicId ? ' PUBLIC "' + doctype.publicId + '"' : ""}${doctype.systemId ? ' "' + doctype.systemId + '"' : ""}>`;
  }
  return "";
}

function cleanTextNode(val) {
  let newVal = "";
  let valData = val.data;
  if (
    valData.startsWith(" ") ||
    valData.startsWith("\n") ||
    valData.startsWith("\t")
  ) {
    newVal = " ";
  }
  const valMatch = valData.match(/\S+/g);
  if (valMatch) newVal += valMatch.join(" ");
  if (
    valData.endsWith(" ") ||
    valData.endsWith("\n") ||
    valData.endsWith("\t")
  ) {
    newVal += " ";
  }
  if (newVal.trim() === "") {
    newVal = "";
  } else if (val.parentElement.tagName === "STYLE") {
    newVal = newVal.trim();
  }
  val.data = newVal;
}

function cleanHtmlCode(el, skipCleanByTagName) {
  for (let i = 0; i < el.children.length; i++) {
    const val = el.children[i];
    if (val.getAttribute("js")) {
      val.setAttribute("js", "");
    }
    if (val.getAttribute("css")) {
      val.setAttribute("css", "");
    }
    if (!skipCleanByTagName.includes(val.tagName)) {
      cleanHtmlCode(val, skipCleanByTagName);
    }
  }
  let commentParentNode;
  el.childNodes.forEach((val) => {
    if (val.nodeType === 3) {
      cleanTextNode(val);
    } else if (val.nodeType === 8) {
      el.removeChild(val);
      val.remove();
      commentParentNode = true;
    }
  });
  if (commentParentNode) {
    el.childNodes.forEach((val) => {
      if (val.nodeType === 3) {
        cleanTextNode(val);
      }
    });
  }
}

function exportHTML(callback) {
  const skipCleanByTagName = ["PRE", "XMP", "TEXTAREA"];
  return () => {
    const contentDocument = iframeAppData.contentDocument;
    const docType = getDoctypeString(contentDocument);
    const cloneDoc = contentDocument.documentElement.cloneNode(true);
    while (cloneDoc.querySelector("link")) {
      cloneDoc.querySelector("link").remove();
    }
    const exportIframe = document.createElement("iframe");
    exportIframe.style.border = "unset";
    exportIframe.style.position = "absolute";
    exportIframe.style.bottom = "0";
    exportIframe.style.right = "0";
    exportIframe.width = "0";
    exportIframe.height = "0";
    exportIframe.srcdoc = cloneDoc.outerHTML;
    document.body.appendChild(exportIframe);
    exportIframe.onload = () => {
      const documentElement = exportIframe.contentDocument.documentElement;
      documentElement.setAttribute("version", getRandomId());
      documentElement.removeAttribute("style");
      while (documentElement.querySelector('link[rel="stylesheet"]')) {
        documentElement.querySelector('link[rel="stylesheet"]').remove();
      }
      while (documentElement.querySelector("style[style-id]")) {
        documentElement.querySelector("style[style-id]").remove();
      }
      cleanHtmlCode(documentElement, skipCleanByTagName);
      callback(docType + documentElement.outerHTML);
      document.body.removeChild(exportIframe);
      exportIframe.remove();
    };
  };
}

function getParentElementByAttribute(el, attr, value) {
  if (el) {
    if (value && el.getAttribute(attr) === value) {
      return el;
    } else if (!value && el.hasAttribute(attr)) {
      return el;
    } else {
      return getParentElementByAttribute(el.parentElement, attr, value);
    }
  } else {
    return null;
  }
}

function allowDrop(ev) {
  ev.preventDefault();
  const wd = iframeAppData.dataIframe;
  const dataType = wd.dataType;
  if (!dataType) return;
  const { target, offsetX, offsetY } = ev;
  const { offsetWidth, offsetHeight } = target;
  iframeAppData.offsetDrop = { offsetX, offsetY, offsetWidth, offsetHeight };
  const tmpDropElement = wd.tmpDropElement;
  const hoverItem = getParentElementByAttribute(target, "data-type", dataType);
  if (hoverItem) {
    const rect = hoverItem.getBoundingClientRect();
    wd.checkIsAfter = offsetX / rect.width + offsetY / rect.height >= 1;
  }
  const allowDrop = iframeAppData.allowDrop;
  if (allowDrop !== target || wd.checkIsAfter !== wd.tmpCheckIsAfter) {
    const dropZoneId = removeDropZone();
    iframeAppData.allowDrop = target;
    wd.tmpCheckIsAfter = wd.checkIsAfter;

    const addDropPreviewLine = (parentItem) => {
      if (target === parentItem) {
        parentItem.appendChild(tmpDropElement);
      } else if (hoverItem) {
        if (wd.checkIsAfter) {
          hoverItem.after(tmpDropElement);
        } else {
          hoverItem.before(tmpDropElement);
        }
      }
    };

    if (dataType === "section") {
      const bodyIframe = iframeAppData.contentDocument.body;
      // bodyIframe.setAttribute(dropZoneId, "");
      addDropPreviewLine(bodyIframe);
    } else {
      const parentAllowDrop = getParentElementByAttribute(target, dataType);
      parentAllowDrop?.setAttribute(dropZoneId, "");
      addDropPreviewLine(parentAllowDrop);
    }
  }
}

function dragstart(ev) {
  const { target } = ev;
  const dataType = target.getAttribute("data-type");
  const wd = iframeAppData.dataIframe;
  wd.dataId = target.id;
  wd.dataType = dataType;
  iframeAppData.contentDocument.documentElement.setAttribute("drag", dataType);
  removeDropZone();
  const tmpDropElement = document.createElement("div");
  tmpDropElement.classList.add("tmp-drop-element");
  wd.tmpDropElement = tmpDropElement;
}

function dragend(ev) {
  ev.preventDefault();
  iframeAppData.contentDocument.documentElement.removeAttribute("drag");
  const wd = iframeAppData.dataIframe;
  removeDropZone();
  wd.tmpDropElement?.remove();
  wd.tmpDropElement = null;
  delete wd.dataId;
  delete wd.dataType;

  const target = ev.target;
  target.removeAttribute("draggable");
  target.ondragstart = null;
  target.ondragend = null;
  const body = iframeAppData.contentDocument.body;
  body.ondrop = null;
  body.ondragover = null;
}

function drop(ev) {
  ev.preventDefault();
  const target = ev.target;
  const wd = iframeAppData.dataIframe;
  const { dataId, dataType } = wd;
  const newElement = document.createElement("div");
  const parentRemoveDrop = getParentElementByAttribute(
    iframeAppData.allowDrop,
    "data-type",
    dataType,
  );

  if (parentRemoveDrop) {
    if (wd.checkIsAfter) {
      parentRemoveDrop.after(newElement);
    } else {
      parentRemoveDrop.before(newElement);
    }
  } else {
    if (dataType === "section") {
      const bodyIframe = iframeAppData.contentDocument.body;
      bodyIframe.appendChild(newElement);
    } else {
      const dropElement = getParentElementByAttribute(target, dataType);
      if (dropElement) dropElement.appendChild(newElement);
    }
  }
  if (!newElement.isConnected) return;

  const urlGetDataItem = "drag";
  getDataFromItem(urlGetDataItem, dataType, dataId).then((r) => {
    if (r.html) {
      for (let i = 0; i < r.html.attributes.length; i++) {
        const item = r.html.attributes[i];
        newElement.setAttribute(item.name, item.value);
      }
      if (r.html.firstElementChild) {
        newElement.appendChild(r.html.firstElementChild);
      }
    }

    const randomId = getRandomId();
    newElement.setAttribute(wd.attrItemId, randomId);

    if (newElement.hasAttribute("js")) {
      const js = r.js ? r.js.replace(new RegExp(dataId, "g"), randomId) : "";
      const jsBlobData = new Blob([js], {
        type: "application/javascript",
      });
      const jsUrl = URL.createObjectURL(jsBlobData);
      newElement.setAttribute("js", jsUrl);
      wd.tmpSourceJs[jsUrl] = randomId;
    }

    if (newElement.hasAttribute("css")) {
      const css = r.css ? r.css.replace(new RegExp(dataId, "g"), randomId) : "";
      const cssBlobData = new Blob([css], {
        type: "text/css",
      });
      const cssUrl = URL.createObjectURL(cssBlobData);
      newElement.setAttribute("css", cssUrl);
      newElement.setAttribute("data-type", dataType);
      wd.tmpSourceCss[cssUrl] = randomId;
    }

    wd.loadStyleCss("", newElement, randomId);
    wd.loadScript("", newElement, randomId);
  });
}

function reloadEventListenerItem(item, jsUrl) {
  const wd = iframeAppData.dataIframe;
  if (!item) return;
  const cloneItem = item.cloneNode(true);
  item.after(cloneItem);
  if (jsUrl) wd.loadScript(jsUrl, cloneItem, item.getAttribute(wd.attrItemId));
  if (item.nextElementSibling === cloneItem && cloneItem.isConnected) {
    item.remove();
  } else {
    cloneItem.remove();
  }
}

function itemMouseDown(ev) {
  const target = ev.target;
  target.setAttribute("draggable", "true");
  target.ondragstart = dragstart;
  target.ondragend = dragend;
  if (!iframeAppData.contentDocument) return;
  const body = iframeAppData.contentDocument.body;
  body.ondrop = drop;
  body.ondragover = allowDrop;
}

function executeAddItem(ev, [ol, ot]) {
  const addItem = iframeAppData.addItem;
  const touches = ev.touches;
  const { clientX, clientY } = touches ? touches[0] : ev;
  addItem.clientX = clientX + ol;
  addItem.clientY = clientY + ot;
}

function setStyleItem() {
  const { dragItem, clientX, clientY } = iframeAppData.addItem;
  if (!dragItem) return;
  const { style, offsetWidth, offsetHeight } = dragItem;
  style.left = `${clientX - offsetWidth / 2}px`;
  style.top = `${clientY - offsetHeight / 2}px`;
}

function addItemMove(ev) {
  if (ev.type !== "touchmove") ev.preventDefault();
  executeAddItem(ev, [0, 0]);
  setStyleItem();
}

function addItemMoveIframe(ev) {
  ev.preventDefault();
  const { offsetLeft, offsetTop } = iframeAppData.addItem;
  executeAddItem(ev, [offsetLeft, offsetTop]);
  setStyleItem();
}

function addItemSetupData() {
  const { dragItem, clientX, offsetLeft, clientY, offsetTop } =
    iframeAppData.addItem;
  if (!dragItem) return;
  const iframeItemX = clientX - offsetLeft;
  const iframeItemY = clientY - offsetTop;
  console.log(iframeItemX, iframeItemY, "addItemSetupData");
}

function addItemCancel() {
  document.removeEventListener("mousemove", addItemMove);
  document.removeEventListener("mouseup", addItemEnd);
  const contentDocument = iframeAppData.contentDocument;
  if (contentDocument) {
    contentDocument.removeEventListener("mousemove", addItemMoveIframe);
    contentDocument.removeEventListener("mouseup", addItemEnd);
  }
  const addItem = iframeAppData.addItem;
  addItem.dragItem?.remove();
  delete addItem.dragItem;
}

function addItemEnd() {
  addItemSetupData();
  addItemCancel();
}

function addItemStart(ev) {
  if (ev.type !== "touchstart") ev.preventDefault();
  addItemCancel();
  if (ev.button === 2) return;
  const target = ev.target;
  const dataType = target.getAttribute("data-type");
  const contentDocument = iframeAppData.contentDocument;
  if (!dataType || !contentDocument) return;
  const wd = iframeAppData.dataIframe;
  wd.dataId = target.id;
  wd.dataType = dataType;
  const isTouch = !!ev.touches;
  const moveEvent = isTouch ? ev.touches[0] : ev;
  if (!isTouch) {
    document.addEventListener("mousemove", addItemMove);
    document.addEventListener("mouseup", addItemEnd);
    contentDocument.addEventListener("mousemove", addItemMoveIframe);
    contentDocument.addEventListener("mouseup", addItemEnd);
  }
  const addItem = iframeAppData.addItem;
  addItem.clientX = moveEvent.clientX;
  addItem.clientY = moveEvent.clientY;
  addItem.offsetLeft = iframeAppData.appIframe?.offsetLeft || 0;
  addItem.offsetTop = iframeAppData.appIframe?.offsetTop || 0;
  const dragItem = target.cloneNode(true);
  target.after(dragItem);
  addItem.dragItem = dragItem;
  dragItem.style.position = "absolute";
  setStyleItem();
}

document.addEventListener("DOMContentLoaded", () => {
  console.log(iframeAppData);

  const callback = (html) => {
    console.log(html);

    iframeAppData.appIframe.srcdoc = html;
  };
  document.getElementById("export").onclick = exportHTML(callback);
  document.getElementById("log-data").onclick = () => {
    console.log(iframeAppData);
  };

  window.ondragover = () => {
    if (iframeAppData.allowDrop) removeDropZone();
  };

  const contentDocument = iframeAppData.contentDocument;
  if (contentDocument) {
    contentDocument.removeEventListener("touchmove", addItemMove);
  }

  document.addEventListener("touchstart", addItemStart);
  document.addEventListener("touchmove", addItemMove);
  document.addEventListener("touchend", addItemEnd);
  document.addEventListener("touchcancel", addItemCancel);

  function addEventListItem(list) {
    for (let i = 0; i < list.children.length; i++) {
      const target = list.children[i];
      // target.addEventListener("mousedown", itemMouseDown);
      target.addEventListener("mousedown", addItemStart);
    }
  }

  addEventListItem(document.getElementById("list-section"));
  addEventListItem(document.getElementById("list-layout"));
  addEventListItem(document.getElementById("list-widget"));
});
