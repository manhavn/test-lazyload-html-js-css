const iframeAppData = {};

const getRandomId = () => {
  return (
    "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)] +
    crypto.randomUUID().slice(0, 8)
  );
};

function moveAction() {
  console.log("moveAction");
}

function onmousemove(event) {
  event.preventDefault();
  iframeAppData.mousemove = event;
  clearTimeout(iframeAppData.mousemoveTimeout);
  iframeAppData.mousemoveTimeout = setTimeout(moveAction, 10);
}

function parentAction(event) {
  event.preventDefault();
  iframeAppData[event.type] = event;
  if (event.type === "mousedown") {
    iframeAppData.contentWindow.onmousemove = onmousemove;
  } else if (event.type === "mouseup") {
    iframeAppData.contentWindow.onmousemove = null;
  }
}

function run(elementId) {
  const appIframe = document.getElementById(elementId);
  const { contentWindow, contentDocument } = appIframe;
  iframeAppData.appIframe = appIframe;
  iframeAppData.contentWindow = contentWindow;
  iframeAppData.contentDocument = contentDocument;
  const dataId = contentWindow["dataId"];
  if (dataId) iframeAppData.dataIframe = contentWindow[dataId];
  iframeAppData.dataId = dataId;

  const styleSheet0 = contentDocument.styleSheets[0];
  styleSheet0.insertRule(
    `body { min-width: 90vw; min-height: 90vh; }`,
    styleSheet0.cssRules.length,
  );
  styleSheet0.insertRule(
    `body [data-type="section"] { min-height: 15px; }`,
    styleSheet0.cssRules.length,
  );
  styleSheet0.insertRule(
    `[drop-zone-${iframeAppData.dataId}] { outline: 1px solid #0909 !important; }`,
    styleSheet0.cssRules.length,
  );
  styleSheet0.insertRule(
    `[drag="section"] body { background-color: #0901 !important; }`,
    styleSheet0.cssRules.length,
  );
  styleSheet0.insertRule(
    `[drag="layout"] [layout] { background-color: #0901 !important; }`,
    styleSheet0.cssRules.length,
  );
  styleSheet0.insertRule(
    `[drag="widget"] [widget] { background-color: #0901 !important; }`,
    styleSheet0.cssRules.length,
  );

  contentWindow.onmousedown = parentAction;
  contentWindow.onmouseup = parentAction;
  contentWindow.onmouseover = parentAction;
  contentWindow.onmouseout = parentAction;
  contentWindow.onmouseenter = parentAction;
  contentWindow.onmouseleave = parentAction;
  contentWindow.onauxclick = parentAction;
  contentWindow.onclick = parentAction;
  contentWindow.onclose = parentAction;
  contentWindow.ondblclick = parentAction;
  contentWindow.onabort = parentAction;
  contentWindow.onblur = parentAction;
  contentWindow.onfocus = parentAction;
  contentWindow.onbeforeinput = parentAction;
  contentWindow.oninput = parentAction;
  contentWindow.onchange = parentAction;
  contentWindow.oncopy = parentAction;
  contentWindow.oncut = parentAction;
  contentWindow.onpaste = parentAction;
  contentWindow.oncontextmenu = parentAction;
  contentWindow.ondrag = parentAction;
  contentWindow.ondrop = parentAction;
  contentWindow.ondragover = parentAction;
  contentWindow.ondragstart = parentAction;

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
      while (documentElement.querySelector("link")) {
        documentElement.querySelector("link").remove();
      }
      cleanHtmlCode(documentElement, skipCleanByTagName);
      callback(docType + documentElement.outerHTML);
      document.body.removeChild(exportIframe);
      exportIframe.remove();
    };
  };
}

function allowDrop(ev) {
  ev.preventDefault();
  const target = ev.target;
  const allowDrop = iframeAppData.allowDrop;
  if (allowDrop !== target) {
    iframeAppData.allowDrop = target;
    const wd = iframeAppData.dataIframe;
    if (!wd.dataType) return;
    if (wd.dataType === "section") {
      const dropZoneId = `drop-zone-${iframeAppData.dataId}`;
      if (allowDrop) {
        const parentRemoveDrop = getParentElementByAttribute(
          allowDrop,
          "data-type",
          wd.dataType,
        );
        parentRemoveDrop?.removeAttribute(dropZoneId);
      }
      const parentAllowDrop = getParentElementByAttribute(
        target,
        "data-type",
        wd.dataType,
      );
      parentAllowDrop?.setAttribute(dropZoneId, "");
    } else {
      const dropZoneId = `drop-zone-${iframeAppData.dataId}`;
      if (allowDrop) {
        const parentRemoveDrop = getParentElementByAttribute(
          allowDrop,
          wd.dataType,
        );
        parentRemoveDrop?.removeAttribute(dropZoneId);
      }
      const parentAllowDrop = getParentElementByAttribute(target, wd.dataType);
      parentAllowDrop?.setAttribute(dropZoneId, "");
    }
  }
}

function dragstart(ev) {
  const { target, dataTransfer } = ev;
  const dataType = target.getAttribute("data-type");
  const wd = iframeAppData.dataIframe;
  wd.dataType = dataType;
  dataTransfer.setData("data-id", target.id);
  dataTransfer.setData("data-type", dataType);
  iframeAppData.contentDocument.documentElement.setAttribute("drag", dataType);
}

function dragend(ev) {
  ev.preventDefault();
  iframeAppData.contentDocument.documentElement.removeAttribute("drag");
  const wd = iframeAppData.dataIframe;
  const allowDrop = iframeAppData.allowDrop;
  if (allowDrop && wd.dataType) {
    if (wd.dataType === "section") {
      const dropZoneId = `drop-zone-${iframeAppData.dataId}`;
      const parentRemoveDrop = getParentElementByAttribute(
        allowDrop,
        "data-type",
        wd.dataType,
      );
      parentRemoveDrop?.removeAttribute(dropZoneId);
    } else {
      const dropZoneId = `drop-zone-${iframeAppData.dataId}`;
      const parentRemoveDrop = getParentElementByAttribute(
        allowDrop,
        wd.dataType,
      );
      parentRemoveDrop?.removeAttribute(dropZoneId);
    }
  }
  ev.dataTransfer.clearData();
  delete wd.dataType;
}

const getParentElementByAttribute = (el, attr, value) => {
  if (el) {
    if (value && el.getAttribute(attr) === value) {
      return el;
    } else if (!value && el.hasAttribute(attr)) {
      return el;
    } else {
      return getParentElementByAttribute(el.parentElement, attr);
    }
  } else {
    return null;
  }
};

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

function drop(ev) {
  ev.preventDefault();
  const dataTransfer = ev.dataTransfer;

  const wd = iframeAppData.dataIframe;
  const dataId = dataTransfer.getData("data-id");
  const dataType = dataTransfer.getData("data-type");
  const newElement = document.createElement("div");
  if (dataType === "section") {
    const allowDrop = iframeAppData.allowDrop;
    const dropZoneId = `drop-zone-${iframeAppData.dataId}`;
    const parentRemoveDrop = getParentElementByAttribute(allowDrop, dropZoneId);
    if (parentRemoveDrop) {
      parentRemoveDrop.after(newElement);
    } else {
      iframeAppData.contentDocument.body.appendChild(newElement);
    }
  } else {
    const dropElement = getParentElementByAttribute(ev.target, dataType);
    if (dropElement) dropElement.appendChild(newElement);
  }

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
      wd[jsUrl] = randomId;
      newElement.setAttribute("js", jsUrl);
    }

    if (newElement.hasAttribute("css")) {
      const css = r.css ? r.css.replace(new RegExp(dataId, "g"), randomId) : "";
      const cssBlobData = new Blob([css], {
        type: "text/css",
      });
      newElement.setAttribute("css", URL.createObjectURL(cssBlobData));
      newElement.setAttribute("data-type", dataType);
    }

    wd.loadStyleCss("", newElement);
    wd.loadScript("", newElement);
  });
}

const reloadEventListenerItem = (item, jsUrl) => {
  const wd = iframeAppData.dataIframe;
  if (!item) return;
  const cloneItem = item.cloneNode(true);
  item.after(cloneItem);
  if (jsUrl) wd.loadScript(jsUrl, cloneItem);
  if (item.nextElementSibling === cloneItem && cloneItem.isConnected) {
    item.remove();
  } else {
    cloneItem.remove();
  }
};

const itemMouseDown = (ev) => {
  const target = ev.target;
  target.ondragstart = dragstart;
  target.ondragend = dragend;
  const body = iframeAppData.contentDocument.body;
  body.ondrop = drop;
  body.ondragover = allowDrop;
};

document.addEventListener("DOMContentLoaded", () => {
  console.log(iframeAppData);

  const callback = (html) => {
    console.log(html);

    iframeAppData.appIframe.srcdoc = html;
  };
  document.getElementById("export").onclick = exportHTML(callback);

  const listSection = document.getElementById("list-section");
  for (let i = 0; i < listSection.children.length; i++) {
    listSection.children[i].addEventListener("mousedown", itemMouseDown);
  }
  const listLayout = document.getElementById("list-layout");
  for (let i = 0; i < listLayout.children.length; i++) {
    listLayout.children[i].addEventListener("mousedown", itemMouseDown);
  }
  const listWidget = document.getElementById("list-widget");
  for (let i = 0; i < listWidget.children.length; i++) {
    listWidget.children[i].addEventListener("mousedown", itemMouseDown);
  }
});
