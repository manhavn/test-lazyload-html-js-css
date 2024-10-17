(function () {
  const key = getKeyScript();
  let loaded;

  const callback = (ob) => {
    console.log(ob.isIntersecting, ob.target, ob.intersectionRatio, ob, loaded);

    if (!loaded && ob.isIntersecting) {
      loaded = true;

      const computedStyles = getCustomCssProperties(ob.target);
      console.log(computedStyles);

      const allItem = document.querySelectorAll(
        `div[${window[wdtkt].attrItemId}="${key}"] div[${window[wdtkt].attrItemId}]`,
      );
      allItem.forEach((item) => {
        const attrItemId = item.getAttribute(window[wdtkt].attrItemId);
        loadStyleCss(`${window[wdtkt].cssSrcFolder}${attrItemId}.css`, item);
        loadScript(`${window[wdtkt].jsSrcFolder}${attrItemId}.js`, item);
      });
    }
  };

  const observer = getObsElements(callback);
  queryElements(key).forEach((el) => {
    observer.observe(el);
    console.log(el, key);
  });
})();
document.currentScript.remove();
