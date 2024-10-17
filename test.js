const getRandomId = () => {
  return (
    "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)] +
    crypto.randomUUID().slice(0, 8)
  );
};

const wdtkt = `${getRandomId()}`;
const isTop = window === window.top;
if (!isTop) window["dataId"] = wdtkt;

(() => {
  const attrItemId = "itd";
  const jsSrcFolder = "js/";
  const cssSrcFolder = "css/";
  const listItems = {};
  const listIntersecting = {};
  const obIntersecting = {};
  const dataApp = {
    attrItemId,
    jsSrcFolder,
    cssSrcFolder,
    listItems,
    listIntersecting,
    obIntersecting,
  };
  window[wdtkt] = dataApp;
  setInterval(() => {
    if (window[wdtkt] !== dataApp) window[wdtkt] = dataApp;
    if (dataApp.attrItemId !== attrItemId) dataApp.attrItemId = attrItemId;
    if (dataApp.jsSrcFolder !== jsSrcFolder) dataApp.jsSrcFolder = jsSrcFolder;
    if (dataApp.cssSrcFolder !== cssSrcFolder)
      dataApp.cssSrcFolder = cssSrcFolder;
    if (dataApp.listItems !== listItems) dataApp.listItems = listItems;
    if (dataApp.listIntersecting !== listIntersecting)
      dataApp.listIntersecting = listIntersecting;
    if (dataApp.obIntersecting !== obIntersecting)
      dataApp.obIntersecting = obIntersecting;
  }, 1000);
})();

const loadScript = (url, item) => {
  if (item.hasAttribute("js")) {
    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";
    script.onerror = () => {
      item.remove();
      script.remove();
    };
    // item.removeAttribute("js");
    document.head.appendChild(script);
  }
};

const loadStyleCss = (url, item) => {
  if (item.hasAttribute("css")) {
    const link = document.createElement("link");
    link.href = url;
    link.rel = "stylesheet";
    link.onerror = () => {
      item.remove();
      link.remove();
    };
    // item.removeAttribute("css");
    document.head.appendChild(link);
  }
};

const getKeyScript = () => {
  return document.currentScript.src.split("/").pop().replace(/\.js$/, "");
};

const queryElements = (key) => {
  return (
    document.querySelectorAll(`[${window[wdtkt].attrItemId}="${key}"]`) || []
  );
};

const getObsCallback = (callback) => {
  return (ev) => {
    ev.forEach((ob) => {
      if (callback) callback(ob);
    });
  };
};

const getObsElements = (callback, threshold) => {
  return new IntersectionObserver(getObsCallback(callback), {
    root: document,
    threshold,
  });
};

const getCustomCssProperties = (element) => {
  const temp = document.createElement(element.tagName);
  const tempDiv = document.createElement("div");
  tempDiv.style.scale = "0.001";
  tempDiv.style.position = "absolute";
  tempDiv.style.bottom = "0";
  tempDiv.style.right = "0";
  document.body.appendChild(tempDiv);
  tempDiv.appendChild(temp);
  const computedStyles = getComputedStyle(element);
  const defaultStyles = getComputedStyle(temp);
  const filteredProperties = {};

  for (let i = 0; i < computedStyles.length; i++) {
    let property = computedStyles[i];
    if (
      computedStyles.getPropertyValue(property) !==
      defaultStyles.getPropertyValue(property)
    ) {
      filteredProperties[property] = computedStyles.getPropertyValue(property);
    }
  }
  tempDiv.removeChild(temp);
  document.body.removeChild(tempDiv);
  temp.remove();
  tempDiv.remove();
  return filteredProperties;
};

const startObs = (actionCallback, key, threshold) => {
  const wd = window[wdtkt];
  const callback = (ob) => {
    wd.obIntersecting[key] = ob;
    if (!isTop) wd.listIntersecting[key] = ob.isIntersecting;
    if (actionCallback) actionCallback(ob);
  };

  const observer = getObsElements(callback, threshold);
  queryElements(key).forEach((el) => {
    observer.observe(el);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const wd = window[wdtkt];
  const allItem = document.querySelectorAll(`body>div[${wd.attrItemId}]`);
  allItem.forEach((item) => {
    const attrItemId = item.getAttribute(wd.attrItemId);
    loadStyleCss(`${wd.cssSrcFolder}${attrItemId}.css`, item);
    loadScript(`${wd.jsSrcFolder}${attrItemId}.js`, item);
    wd.listItems[attrItemId] = item;
  });
  // console.log(document.styleSheets, wd);
});
