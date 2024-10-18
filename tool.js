const iframeAppData = {};

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
  if (valData.indexOf("\n") === 0) {
    valData = " " + valData.trimStart();
  }
  if (valData.lastIndexOf("\n") !== -1) {
    valData = valData.trimEnd() + " ";
  }
  valData.match(/(\s?)(\S+)(\s?)/g)?.forEach((data) => {
    newVal += data;
  });
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
    const docType = getDoctypeString(iframeAppData.contentDocument);
    const exportIframe = document.createElement("iframe");
    exportIframe.style.border = "unset";
    exportIframe.style.position = "absolute";
    exportIframe.style.bottom = "0";
    exportIframe.style.right = "0";
    exportIframe.width = "0";
    exportIframe.height = "0";
    exportIframe.srcdoc =
      iframeAppData.contentDocument.documentElement.outerHTML;
    document.body.appendChild(exportIframe);
    exportIframe.onload = () => {
      const contentDocument = exportIframe.contentDocument;
      do {
        for (let i = 0; i < contentDocument.styleSheets.length; i++) {
          contentDocument.styleSheets.item(i).ownerNode.remove();
        }
      } while (contentDocument.styleSheets.length > 0);
      cleanHtmlCode(contentDocument.documentElement, skipCleanByTagName);
      callback(docType + contentDocument.documentElement.outerHTML);
      document.body.removeChild(exportIframe);
      exportIframe.remove();
    };
  };
}

document.addEventListener("DOMContentLoaded", () => {
  console.log(iframeAppData);

  const callback = (html) => {
    console.log(html);
    iframeAppData.appIframe.srcdoc = html;
  };
  document.getElementById("export").onclick = exportHTML(callback);
});
