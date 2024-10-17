(function () {
  const wd = window[wdtkt];
  const key = getKeyScript();
  let loaded;

  const callback = (ob) => {
    wd.obIntersecting[key] = ob;
    if (!isTop) wd.listIntersecting[key] = ob.isIntersecting;

    console.log(ob.isIntersecting, ob.target, ob.intersectionRatio, ob, loaded);

    if (!loaded && ob.isIntersecting) {
      loaded = true;

      const computedStyles = getCustomCssProperties(ob.target);
      console.log(computedStyles);

      const allItem = document.querySelectorAll(
        `div[${wd.attrItemId}="${key}"] div[${wd.attrItemId}]`,
      );
      allItem.forEach((item) => {
        const attrItemId = item.getAttribute(wd.attrItemId);
        loadStyleCss(`${wd.cssSrcFolder}${attrItemId}.css`, item);
        loadScript(`${wd.jsSrcFolder}${attrItemId}.js`, item);
      });
    }
  };

  const observer = getObsElements(callback);
  queryElements(key).forEach((el) => {
    observer.observe(el);
  });
})();
document.currentScript.remove();
