(() => {
  const key = getKeyScript();
  let loaded;

  const callback = (ob) => {
    console.log(ob.isIntersecting, ob.target, ob.intersectionRatio, ob, loaded);
    if (!loaded && ob.isIntersecting) {
      loaded = true;
    }
  };

  const observer = getObsElements(callback);
  queryElements(key).forEach((el) => {
    observer.observe(el);
    console.log(el, key);
  });
})();
