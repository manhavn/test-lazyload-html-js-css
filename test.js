const thisTime = `t${new Date().getTime()}`;
window[thisTime] = "itd";

const cssPropertyGroup = [
  "margin",
  "padding",
  "border",
  "outline",
  "background",
  "font",
  "text",
  "list-style",
  "flex",
  "grid",
  "animation",
  "transition",
  "overflow",
  "position",
  "transform",
];

const loadScript = (url, item) => {
  const script = document.createElement("script");
  script.src = url;
  script.type = "text/javascript";
  script.onerror = () => {
    item.remove();
    script.remove();
  };
  document.head.appendChild(script);
};

const loadStyleCss = (url, item) => {
  const link = document.createElement("link");
  link.href = url;
  link.rel = "stylesheet";
  link.onerror = () => {
    item.remove();
    link.remove();
  };
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
      const matchPropertyGroup = cssPropertyGroup.filter((val) =>
        property.startsWith(val),
      );
      if (matchPropertyGroup.length > 0) {
        matchPropertyGroup.forEach((val) => {
          filteredProperties[val] = computedStyles.getPropertyValue(val);
        });
      } else {
        filteredProperties[property] =
          computedStyles.getPropertyValue(property);
      }
    }
  }
  tempDiv.removeChild(temp);
  document.body.removeChild(tempDiv);
  temp.remove();
  tempDiv.remove();
  return filteredProperties;
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
      loadStyleCss(`${cssParentPath}${itemId}.css`, item);
      item.removeAttribute("css");
    }
    if (item.hasAttribute("js")) {
      loadScript(`${jsParentPath}${itemId}.js`, item);
      item.removeAttribute("js");
    }
  });
});

console.log(getRandomId());
console.log(listItems, document.styleSheets, thisTime, window[thisTime]);
