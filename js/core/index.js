function Vue(option) {
  let el = option.el;
  let data = option.data || {};
  this._data = data;

  // 数据代理
  Object.keys(data).forEach(key => {
    proxyData.call(this, key);
  })
}

/////////////////////////////////// proxyData --  数据代理 ///////////////////////////////////////////
function proxyData(key, getter){
  let self = this;
  Object.defineProperty(self, key, {
    configurable: true,
    enumerable: true,
    get: function proxyGetter(){
      self._data[key];
    },
    set: function proxySetter(newVal){
      self._data[key] = newVal;
    }
  })
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

  compileElement($fragment);

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
      // let exp = RegExp.$1.trim();
      node.textContent = "1234";
    }

    if (node.childNodes && node.childNodes.length) {
      this.compileElement(node);
    }
  });
}

// 判断node类型
function isTextNode(node) {
  return node.nodeType == 3;
}
