document.addEventListener("DOMContentLoaded", () => {
  console.log("ok");
});

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

function run({ contentWindow, contentDocument }) {
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

  console.log(iframeAppData);
}
