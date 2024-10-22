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
  let commentParentNode;
  el.childNodes.forEach((val) => {
    if (val.nodeType === 1) {
      if (!skipCleanByTagName.includes(val.tagName)) {
        cleanHtmlCode(val, skipCleanByTagName);
      }
    } else if (val.nodeType === 3) {
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
}

function drag(ev) {
  ev.dataTransfer.setData("data", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("data");
  const section = document.createElement("section");
  const itd = getRandomId();
  section.setAttribute("itd", itd);
  const jsBlobData = new Blob([], { type: "application/javascript" });
  section.setAttribute("js", URL.createObjectURL(jsBlobData));
  const cssBlobData = new Blob([], { type: "text/css" });
  section.setAttribute("css", URL.createObjectURL(cssBlobData));
  section.setAttribute("data", data);
  // ev.target.appendChild(section);
  iframeAppData.contentDocument.body.appendChild(section);
  const wd = iframeAppData.dataIframe;
  wd.loadStyleCss("", section);
  wd.loadScript("", section);
}

const itemMouseDown = (e) => {
  e.target.ondragstart = drag;
  iframeAppData.contentDocument.body.ondrop = drop;
  iframeAppData.contentDocument.body.ondragover = allowDrop;
};

document.addEventListener("DOMContentLoaded", () => {
  console.log(iframeAppData);

  const callback = (html) => {
    console.log(html);
    iframeAppData.appIframe.srcdoc = html;
  };
  document.getElementById("export").onclick = exportHTML(callback);

  const listItem = document.getElementById("list-item");
  for (let i = 0; i < listItem.children.length; i++) {
    listItem.children[i].addEventListener("mousedown", itemMouseDown);
  }
});
