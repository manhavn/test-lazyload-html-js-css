const thisTime = `t${new Date().getTime()}`;
window[thisTime] = "itd";

const loadScript = (url) => {
  const script = document.createElement("script");
  script.src = url;
  script.type = "text/javascript";
  document.head.appendChild(script);
};

const loadStyleCss = (url) => {
  const link = document.createElement("link");
  link.href = url;
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

const getRandomId = () => {
  return (
    "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)] +
    "-" +
    crypto.randomUUID().slice(0, 8)
  );
};

const getKeyScript = () => {
  return document.currentScript.src.split("/").pop().replace(/\.js$/, "");
};

const queryElements = (key) => {
  return document.querySelectorAll(`[${window[thisTime]}="${key}"]`) || [];
};

const getObsCallback = (callback) => {
  return (ev) => {
    ev.forEach((ob) => {
      if (callback) callback(ob);
    });
  };
};

const getObsElements = (callback) => {
  return new IntersectionObserver(getObsCallback(callback), {
    root: document,
    threshold: 1,
  });
};

const listItems = {};
document.addEventListener("DOMContentLoaded", () => {
  const jsParentPath = "js/";
  const cssParentPath = "css/";

  const allItem = document.querySelectorAll(`body>div[${window[thisTime]}]`);
  allItem.forEach((item) => {
    const itemId = item.getAttribute(window[thisTime]);
    listItems[itemId] = item;
    if (item.hasAttribute("css")) {
      loadStyleCss(`${cssParentPath}${itemId}.css`);
      item.removeAttribute("css");
    }
    if (item.hasAttribute("js")) {
      loadScript(`${jsParentPath}${itemId}.js`);
      item.removeAttribute("js");
    }
  });
});

console.log(getRandomId());
console.log(listItems, document.styleSheets, thisTime, window[thisTime]);
