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
  const tmpSourceCss = {};
  const tmpSourceJs = {};
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
    tmpSourceCss,
    tmpSourceJs,
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
    if (dataApp.tmpSourceCss !== tmpSourceCss)
      dataApp.tmpSourceCss = tmpSourceCss;
    if (dataApp.tmpSourceJs !== tmpSourceJs) dataApp.tmpSourceJs = tmpSourceJs;
  }, 1000);
})();

const loadScript = (url, item, attrItemId) => {
  if (item.hasAttribute("js")) {
    const htmlVersion = document.documentElement.getAttribute("version") || "";
    const href = item.getAttribute("js") || `${url}?${htmlVersion}`;
    const script = document.createElement("script");
    if (attrItemId) script.setAttribute("script-id", attrItemId);
    const applyUrlSource = () => {
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
              return r.ok ? r.text() : "";
            })
            .then((text) => {
              if (attrItemId) window[wdtkt].scriptContents[attrItemId] = text;
            });
        }
        URL.revokeObjectURL(href);
        script.remove();
      };
      document.head.appendChild(script);
    };
    (async function () {
      try {
        const response = await fetch(href);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const text = await response.text();
        if (attrItemId) window[wdtkt].scriptContents[attrItemId] = text;
        script.textContent = text;
        document.head.appendChild(script);
        if (script.isConnected) script.remove();
      } catch (error) {
        applyUrlSource();
      }
    })();
  }
};

const loadStyleCss = (url, item, attrItemId) => {
  if (!item || item.hasAttribute("css")) {
    const htmlVersion = document.documentElement.getAttribute("version") || "";
    const href = item?.getAttribute("css") || `${url}?${htmlVersion}`;
    const applyUrlSource = () => {
      const link = document.createElement("link");
      link.href = href;
      link.rel = "stylesheet";
      link.onerror = () => {
        if (isTop && item) item.remove();
        link.remove();
      };
      link.onload = () => {
        if (!isTop && attrItemId) {
          link.setAttribute("style-id", attrItemId);
          fetch(href)
            .then((r) => {
              return r.ok ? r.text() : "";
            })
            .then((text) => {
              if (attrItemId) window[wdtkt].styleContents[attrItemId] = text;
            });
        }
        URL.revokeObjectURL(href);
        for (let i = 0; i < document.styleSheets.length; i++) {
          const styleSheet = document.styleSheets.item(i);
          if (styleSheet.href && styleSheet.href.lastIndexOf(href) !== -1) {
            window[wdtkt].styleSheets[href] = styleSheet;
            break;
          }
        }
      };
      document.head.appendChild(link);
    };
    applyUrlSource();
  }
};

const getKeyScript = () => {
  const currentScript = document.currentScript;
  const src = currentScript.src;
  const scriptId = currentScript.getAttribute("script-id");
  return (
    scriptId ||
    (window[wdtkt] &&
      window[wdtkt].tmpSourceJs &&
      window[wdtkt].tmpSourceJs[src]) ||
    src
      .split("/")
      .pop()
      .replace(/\.min\.js(\S+)?$/, "")
      .replace(/\.js(\S+)?$/, "")
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
        const data = [];
        if (responseCss.ok) {
          const content = `${(await responseCss.text()) || ""}`.replace(
            new RegExp(oldId, "g"),
            attrItemId,
          );
          data.push(content);
        }
        const cssUrl = URL.createObjectURL(
          new Blob(data, { type: "text/css" }),
        );
        item.setAttribute("css", cssUrl);
        window[wdtkt].tmpSourceCss[cssUrl] = attrItemId;
      }
      if (item.hasAttribute("js")) {
        const responseJs = await fetch(
          `${wd.jsSrcFolder}${oldId}.js?${attrItemId}${htmlVersion}`,
        );
        const data = [];
        if (responseJs.ok) {
          const content = `${(await responseJs.text()) || ""}`.replace(
            new RegExp(oldId, "g"),
            attrItemId,
          );
          data.push(content);
        }
        const jsUrl = URL.createObjectURL(
          new Blob(data, { type: "application/javascript" }),
        );
        item.setAttribute("js", jsUrl);
        window[wdtkt].tmpSourceJs[jsUrl] = attrItemId;
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
