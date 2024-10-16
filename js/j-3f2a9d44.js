(() => {
  const key = getKeyScript();
  let loaded;

  const callback = (ob) => {
    console.log(ob.isIntersecting, ob.target, ob.intersectionRatio, ob, loaded);

    if (!loaded && ob.isIntersecting) {
      loaded = true;
      const jsParentPath = "js/";
      const cssParentPath = "css/";

      const allItem = document.querySelectorAll(
        `div[${window[thisTime]}="${key}"] div[${window[thisTime]}]`,
      );
      allItem.forEach((item) => {
        const itemId = item.getAttribute(window[thisTime]);
        if (item.hasAttribute("css")) {
          loadStyleCss(`${cssParentPath}${itemId}.css`);
          item.removeAttribute("css");
        }
        if (item.hasAttribute("js")) {
          loadScript(`${jsParentPath}${itemId}.js`);
          item.removeAttribute("js");
        }
      });
    }
  };

  const observer = getObsElements(callback);
  queryElements(key).forEach((el) => {
    observer.observe(el);
    console.log(el, key);
  });
})();
