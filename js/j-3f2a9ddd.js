(() => {
  const key = getKeyScript();

  const callback = (ob) => {
    console.log(ob.isIntersecting, ob.target, ob.intersectionRatio, ob);
  };

  const observer = getObsElements(callback);
  queryElements(key).forEach((el) => {
    observer.observe(el);
    console.log(el, key);
  });
})();
