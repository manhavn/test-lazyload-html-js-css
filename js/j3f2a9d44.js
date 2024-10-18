(function () {
  const key = getKeyScript();
  let loaded;

  const actionCallback = (ob) => {
    console.log(ob.isIntersecting, ob.target, ob.intersectionRatio, ob, loaded);
    if (!loaded && ob.isIntersecting) {
      loaded = true;

      const computedStyles = getCustomCssProperties(ob.target);
      console.log(computedStyles);

      loadChildSource(key);
    }
  };
  startObs(actionCallback, key);
})();
document.currentScript.remove();
