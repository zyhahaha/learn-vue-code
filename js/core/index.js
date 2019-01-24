function Vue(option) {
  let el = option.el;
  let data = option.data || {};
  this._data = data;

  // 数据代理
  Object.keys(data).forEach(key => {
    proxyData.call(this, key);
  });

  // 监听属性
  observer(data, this);

  // 渲染页面
  compile.call(this, el);
}

/////////////////////////////////// proxyData --  数据代理 ///////////////////////////////////////////
function proxyData(key, getter){
  let self = this;
  Object.defineProperty(self, key, {
    configurable: false,
    enumerable: true,
    get: function proxyGetter(){
      return self._data[key];
    },
    set: function proxySetter(newVal){
      self._data[key] = newVal;
    }
  });
}

/////////////////////////////////// observer --  监听属性 观察者模式 //////////////////////////////////
function observer(){

}

/////////////////////////////////// compile -- 渲染页面 //////////////////////////////////////////////

function compile(el){
  let $el = document.querySelector(el);

  // compile
  let $fragment = document.createDocumentFragment(),
    child;

  // 将原生节点拷贝到fragment
  while ((child = $el.firstChild)) {
    $fragment.appendChild(child);
  }

  compileElement.call(this, $fragment);

  // append el
  $el.appendChild($fragment);
}

// 编译元素
function compileElement(el){
  // childNodes
  let childNodes = el.childNodes;
  childNodes.forEach(node => {
    let text = node.textContent;
    let reg = /\{\{(.*)\}\}/;
    if (isTextNode(node) && reg.test(text)) {
      let exp = RegExp.$1.trim();
      let value = _getVMVal(this, exp); // 获取属性值
      // console.log(value);
      node.textContent = value;
    }

    if (node.childNodes && node.childNodes.length) {
      compileElement.call(this, node);
    }
  });
}

// get vm value
function _getVMVal(vm, exp) {
  // console.log(vm.content);
  let val = vm;
  exp = exp.split('.');
  exp.forEach(k => {
    // console.log(val[k])
    k ? val = val[k] : null;
  });
  return val;
}

// 判断node类型
function isTextNode(node) {
  return node.nodeType == 3;
}
