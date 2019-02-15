function Vue(option) {
  let el = option.el;
  let data = option.data || {};
  this._data = data;

  // 数据代理
  Object.keys(data).forEach(key => {
    proxyData.call(this, key);
  });

  // 监听属性
  observe(data, this);

  // 渲染页面
  compile.call(this, el);
}

/////////////////////////////////// proxyData --  数据代理 ///////////////////////////////////////////
function proxyData(key, getter) {
  let self = this;
  Object.defineProperty(self, key, {
    configurable: false,
    enumerable: true,
    get: function proxyGetter() {
      return self._data[key];
    },
    set: function proxySetter(newVal) {
      self._data[key] = newVal;
    }
  });
}

/////////////////////////////////// compile -- 渲染页面 //////////////////////////////////////////////

function compile(el) {
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
function compileElement(el) {
  // childNodes
  let childNodes = el.childNodes;
  // console.log(childNodes[0].attributes.forEach);
  childNodes.forEach(node => {
    if (isElementNode(node)) {
      compileElementNode.call(this, node);
    } else if (isTextNode(node)) {
      compileText.call(this, node);
    }

    // 如果有子级再次回调
    if (node.childNodes && node.childNodes.length) {
      compileElement.call(this, node);
    }
  });
}

// 编译文本
function compileText(node) {
  // this.bind(node, vm, exp, 'text');

  let text = node.textContent;
  let reg = /\{\{(.*)\}\}/;
  if (reg.test(text)) {
    let exp = RegExp.$1.trim();
    compileUtil.bind(node, this, exp, 'text');
    // let value = _getVMVal(this, exp); // 获取属性值
    // console.log(value);
    // node.textContent = value;
  }
}

// 编译节点
function compileElementNode(node) {
  let nodeAttrs = node.attributes;
  // console.log(nodeAttrs.forEach);
  [].slice.call(nodeAttrs).forEach(attr => {
    var attrName = attr.name;
    if (isDirective(attrName)) {
      var exp = attr.value;
      var dir = attrName.substring(2);
      // 事件指令
      if (isEventDirective(dir)) {
        compileUtil.eventHandler(node, this, exp, dir);
      } else {
        // 其他指令
        compileUtil[dir] && compileUtil[dir](node, this, exp);
      }
      // 移除事件
      node.removeAttribute(attrName);
    }
  });
}

// 指令集合
let compileUtil = {
  bind: function(node, vm, exp, dir) {
    var updaterFn = updater[dir + "Updater"];

    updaterFn && updaterFn(node, _getVMVal(vm, exp));

    new Watcher(vm, exp, function(value, oldValue) {
      // console.log(dir)
      updaterFn && updaterFn(node, value, oldValue);
    });
  },
  model: function(node, vm, exp) {
    this.bind(node, vm, exp, "model");
    // alert(node)
    let self = this;
    let val = _getVMVal(vm, exp);
    node.addEventListener("input", e => {
      var newVal = e.target.value;
      if (val === newVal) {
        return;
      }
      // alert(newVal)
      // debugger
      _setVMVal(vm, exp, newVal);
      val = newVal;
    });
  },
  eventHandler: function(node, vm, exp, dir) {
    var eventType = dir.split(":")[1];
    console.log(eventType);
  }
};

// get vm value
function _getVMVal(vm, exp) {
  let val = vm;
  exp = exp.split(".");
  exp.forEach(k => {
    val = val[k];
  });
  return val;
}
function _setVMVal(vm, exp, value) {
  var val = vm;
  exp = exp.split(".");
  exp.forEach(function(k, i) {
    // 非最后一个key，更新val的值
    if (i < exp.length - 1) {
      val = val[k];
    } else {
      val[k] = value;
    }
  });
}

// 判断node类型 指令
function isElementNode(node) {
  return node.nodeType == 1;
}
function isTextNode(node) {
  return node.nodeType == 3;
}
function isDirective(attr) {
  return attr.indexOf("v-") == 0;
}
function isEventDirective(dir) {
  return dir.indexOf("on") === 0;
}

var updater = {
  textUpdater: function(node, value) {
    node.textContent = typeof value == "undefined" ? "" : value;
  },

  modelUpdater: function(node, value, oldValue) {
    // console.log(value)
    node.value = typeof value == "undefined" ? "" : value;
  }
};
