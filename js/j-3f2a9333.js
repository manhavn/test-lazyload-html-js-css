(() => {
  const key = getKeyScript();
  let loaded;

  const callback = (ob) => {
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

  const observer = getObsElements(callback, 0.5);
  queryElements(key).forEach((el) => {
    observer.observe(el);
    console.log(el, key);
  });
})();
