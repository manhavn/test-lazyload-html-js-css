const getRandomId = () => {
  return (
    "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)] +
    crypto.randomUUID().slice(0, 8)
  );
};

const wdtkt = `${getRandomId()}`;
const isTop = window === top;
if (!isTop) window["dataId"] = wdtkt;
if (isTop) document.currentScript.remove();

(() => {
  const attrItemId = "itd";
  const jsSrcFolder = "js/";
  const cssSrcFolder = "css/";
  const listItems = {};
  const listIntersecting = {};
  const obIntersecting = {};
  const styleSheets = {};
  const scriptContents = {};
  const styleContents = {};
  const childSource = {};
  const dataApp = {
    attrItemId,
    jsSrcFolder,
    cssSrcFolder,
    styleSheets,
    scriptContents,
    styleContents,
    listItems,
    listIntersecting,
    obIntersecting,
    childSource,
  };
  window[wdtkt] = dataApp;
  setInterval(() => {
    if (window[wdtkt] !== dataApp) window[wdtkt] = dataApp;
    if (dataApp.attrItemId !== attrItemId) dataApp.attrItemId = attrItemId;
    if (dataApp.jsSrcFolder !== jsSrcFolder) dataApp.jsSrcFolder = jsSrcFolder;
    if (dataApp.cssSrcFolder !== cssSrcFolder)
      dataApp.cssSrcFolder = cssSrcFolder;
    if (dataApp.styleSheets !== styleSheets) dataApp.styleSheets = styleSheets;
    if (dataApp.scriptContents !== scriptContents)
      dataApp.scriptContents = scriptContents;
    if (dataApp.styleContents !== styleContents)
      dataApp.styleContents = styleContents;
    if (dataApp.listItems !== listItems) dataApp.listItems = listItems;
    if (dataApp.listIntersecting !== listIntersecting)
      dataApp.listIntersecting = listIntersecting;
    if (dataApp.obIntersecting !== obIntersecting)
      dataApp.obIntersecting = obIntersecting;
    if (dataApp.childSource !== childSource) dataApp.childSource = childSource;
  }, 1000);
})();

const loadScript = (url, item, attrItemId) => {
  if (item.hasAttribute("js")) {
    const htmlVersion = document.documentElement.getAttribute("version") || "";
    const script = document.createElement("script");
    const href = item.getAttribute("js") || `${url}?${htmlVersion}`;
    script.src = href;
    script.type = "text/javascript";
    script.onerror = () => {
      if (isTop) item.remove();
      script.remove();
    };
    script.onload = () => {
      if (!isTop && attrItemId) {
        fetch(href)
          .then((r) => {
            return r.text();
          })
          .then((text) => {
            window[wdtkt].scriptContents[attrItemId] = text;
          });
      }
      URL.revokeObjectURL(href);
      script.remove();
    };
    document.head.appendChild(script);
  }
};

const loadStyleCss = (url, item, attrItemId) => {
  if (!item || item.hasAttribute("css")) {
    const htmlVersion = document.documentElement.getAttribute("version") || "";
    const link = document.createElement("link");
    const href = item?.getAttribute("css") || `${url}?${htmlVersion}`;
    link.href = href;
    link.rel = "stylesheet";
    link.onerror = () => {
      if (isTop && item) item.remove();
      link.remove();
    };
    link.onload = () => {
      if (!isTop && attrItemId) {
        fetch(href)
          .then((r) => {
            return r.text();
          })
          .then((text) => {
            window[wdtkt].styleContents[attrItemId] = text;
          });
      }
      URL.revokeObjectURL(href);
      for (let i = 0; i < document.styleSheets.length; i++) {
        const styleSheet = document.styleSheets.item(i);
        if (styleSheet.href?.lastIndexOf(href) !== -1) {
          window[wdtkt].styleSheets[href] = styleSheet;
          break;
        }
      }
    };
    document.head.appendChild(link);
  }
};

const getKeyScript = () => {
  const src = document.currentScript.src;
  return (
    window[wdtkt]?.[src] ||
    src
      .split("/")
      .pop()
      .split("?")
      .shift()
      .split("#")
      .shift()
      .replace(/\.js$/, "")
  );
};

const queryElements = (key) => {
  return (
    document.querySelectorAll(`[${window[wdtkt].attrItemId}="${key}"]`) || []
  );
};

const getObsCallback = (callback) => {
  return (ev) => {
    ev.forEach((ob) => {
      callback(ob);
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
    actionCallback(ob);
  };

  const observer = getObsElements(callback, threshold);
  queryElements(key).forEach((el) => {
    observer.observe(el);
  });
};

const loadChildSource = (key) => {
  const wd = window[wdtkt];
  if (wd.childSource[key]) return;
  wd.childSource[key] = true;
  const allItem = document.querySelectorAll(
    `[${wd.attrItemId}="${key}"] [${wd.attrItemId}]`,
  );
  allItem.forEach((item) => {
    const attrItemId = item.getAttribute(wd.attrItemId);
    loadStyleCss(`${wd.cssSrcFolder}${attrItemId}.css`, item, attrItemId);
    loadScript(`${wd.jsSrcFolder}${attrItemId}.js`, item, attrItemId);
  });
};

const setWindowResize = () => {
  const htmlStyle = document.documentElement.style;
  htmlStyle.setProperty("--window-inner-width", `${innerWidth}`);
};
addEventListener("resize", setWindowResize);

const key = getKeyScript();
const contentLoaded = () => {
  if (window !== top && innerWidth === 0) return;
  setWindowResize();
  const wd = window[wdtkt];
  wd.loadStyleCss = loadStyleCss;
  wd.loadScript = loadScript;
  loadStyleCss(`${wd.cssSrcFolder}${key}.css`);
  const mapCheckExists = {};
  const htmlVersion = document.documentElement.getAttribute("version") || "";
  const allItem = document.querySelectorAll(`body>[${wd.attrItemId}]`);
  allItem.forEach(async (item) => {
    let attrItemId = item.getAttribute(wd.attrItemId);
    if (mapCheckExists[attrItemId]) {
      const oldId = `${attrItemId}`;
      item.setAttribute("old-id", oldId);
      attrItemId = getRandomId();
      item.setAttribute(wd.attrItemId, attrItemId);
      if (item.hasAttribute("css")) {
        const responseCss = await fetch(
          `${wd.cssSrcFolder}${oldId}.css?${attrItemId}${htmlVersion}`,
        );
        if (responseCss.ok) {
          const data = await responseCss.text();
          const cssBlobData = new Blob(
            [`${data}`.replace(new RegExp(oldId, "g"), attrItemId)],
            { type: "text/css" },
          );
          const cssUrl = URL.createObjectURL(cssBlobData);
          item.setAttribute("css", cssUrl);
        } else {
          const cssBlobData = new Blob([], { type: "text/css" });
          item.setAttribute("css", URL.createObjectURL(cssBlobData));
        }
      }
      if (item.hasAttribute("js")) {
        const responseJs = await fetch(
          `${wd.jsSrcFolder}${oldId}.js?${attrItemId}${htmlVersion}`,
        );
        if (responseJs.ok) {
          const data = await responseJs.text();
          const jsBlobData = new Blob(
            [`${data}`.replace(new RegExp(oldId, "g"), attrItemId)],
            { type: "application/javascript" },
          );
          const jsUrl = URL.createObjectURL(jsBlobData);
          window[wdtkt][jsUrl] = attrItemId;
          item.setAttribute("js", jsUrl);
        } else {
          const jsBlobData = new Blob([], { type: "application/javascript" });
          item.setAttribute("js", URL.createObjectURL(jsBlobData));
        }
      }
    }
    mapCheckExists[attrItemId] = true;
    loadStyleCss(`${wd.cssSrcFolder}${attrItemId}.css`, item, attrItemId);
    loadScript(`${wd.jsSrcFolder}${attrItemId}.js`, item, attrItemId);
    wd.listItems[attrItemId] = item;
  });
  // console.log(document.styleSheets, wd);
};

document.addEventListener("DOMContentLoaded", contentLoaded);
