(function () {
  const key = getKeyScript();
  let loaded;

  const actionCallback = (ob) => {
    console.log(ob.isIntersecting, ob.target, ob.intersectionRatio, ob, loaded);
    if (!loaded && ob.isIntersecting) {
      loaded = true;

      for (const key in ob.target.children) {
        const el = ob.target.children[key];
        if (el && el.nodeType === 1) {
          const computedStyles = getCustomCssProperties(el);
          console.log(computedStyles, el);
        }
      }
    }
  };
  startObs(actionCallback, key, 0.5);
  console.log("layout layout-1.js", key);
})();
document.currentScript.remove();
