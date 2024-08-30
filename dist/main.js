"use strict";

// src/list-diff.ts
function diff(oldList, newList, key) {
  const oldMap = makeKeyIndexAndFree(oldList, key);
  const newMap = makeKeyIndexAndFree(newList, key);
  const newFree = newMap.free;
  const oldKeyIndex = oldMap.keyIndex;
  const newKeyIndex = newMap.keyIndex;
  const moves = [];
  const children = [];
  let i = 0;
  let item;
  let itemKey;
  let freeIndex = 0;
  while (i < oldList.length) {
    item = oldList[i];
    itemKey = getItemKey(item, key);
    if (itemKey) {
      if (!newKeyIndex.hasOwnProperty(itemKey)) {
        children.push(null);
      } else {
        const newItemIndex = newKeyIndex[itemKey];
        children.push(newList[newItemIndex]);
      }
    } else {
      const freeItem = newFree[freeIndex++];
      children.push(freeItem || null);
    }
    i++;
  }
  const simulateList = children.slice(0);
  i = 0;
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i);
      removeSimulate(i);
    } else {
      i++;
    }
  }
  let j = 0;
  i = 0;
  while (i < newList.length) {
    item = newList[i];
    itemKey = getItemKey(item, key);
    const simulateItem = simulateList[j];
    const simulateItemKey = getItemKey(simulateItem, key);
    if (simulateItem) {
      if (itemKey === simulateItemKey) {
        j++;
      } else {
        if (!oldKeyIndex.hasOwnProperty(itemKey)) {
          insert(i, item);
        } else {
          const nextItemKey = getItemKey(simulateList[j + 1], key);
          if (nextItemKey === itemKey) {
            remove(i);
            removeSimulate(j);
            j++;
          } else {
            insert(i, item);
          }
        }
      }
    } else {
      insert(i, item);
    }
    i++;
  }
  let k = simulateList.length - j;
  while (j++ < simulateList.length) {
    k--;
    remove(k + i);
  }
  function remove(index) {
    const move = { index, type: 0 };
    moves.push(move);
  }
  function insert(index, item2) {
    const move = { index, item: item2, type: 1 };
    moves.push(move);
  }
  function removeSimulate(index) {
    simulateList.splice(index, 1);
  }
  return {
    moves,
    children
  };
}
function makeKeyIndexAndFree(list, key) {
  const keyIndex = {};
  const free = [];
  for (let i = 0, len = list.length; i < len; i++) {
    const item = list[i];
    const itemKey = getItemKey(item, key);
    if (itemKey) {
      keyIndex[itemKey] = i;
    } else {
      free.push(item);
    }
  }
  return {
    keyIndex,
    free
  };
}
function getItemKey(item, key) {
  if (!item || !key) return void 0;
  return typeof key === "string" ? item[key] : key(item);
}

// src/util.ts
function each(array, fn) {
  array.forEach(fn);
}
function toArray(listLike) {
  if (!listLike) {
    return [];
  }
  return Array.from(listLike);
}
function setAttr(node, key, value) {
  switch (key) {
    case "style":
      node.style.cssText = value;
      break;
    case "value":
      const tagName = node.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") {
        node.value = value;
      } else {
        node.setAttribute(key, value);
      }
      break;
    default:
      node.setAttribute(key, value);
      break;
  }
}

// src/patch.ts
var REPLACE = 0;
var REORDER = 1;
var PROPS = 2;
var TEXT = 3;
function patch(node, patches2) {
  const walker = { index: 0 };
  dfsWalk(node, walker, patches2);
}
function dfsWalk(node, walker, patches2) {
  const currentPatches = patches2[walker.index];
  const len = node.childNodes ? node.childNodes.length : 0;
  for (let i = 0; i < len; i++) {
    const child = node.childNodes[i];
    walker.index++;
    dfsWalk(child, walker, patches2);
  }
  if (currentPatches) {
    applyPatches(node, currentPatches);
  }
}
function applyPatches(node, currentPatches) {
  each(currentPatches, (currentPatch) => {
    switch (currentPatch.type) {
      case REPLACE:
        const newNode = typeof currentPatch.node === "string" ? document.createTextNode(currentPatch.node) : currentPatch.node.render();
        node.parentNode.replaceChild(newNode, node);
        break;
      case REORDER:
        reorderChildren(node, currentPatch.moves);
        break;
      case PROPS:
        setProps(node, currentPatch.props);
        break;
      case TEXT:
        if ("textContent" in node) {
          node.textContent = currentPatch.content;
        } else {
          node.nodeValue = currentPatch.content;
        }
        break;
      default:
        throw new Error("Unknown patch type " + currentPatch.type);
    }
  });
}
function setProps(node, props) {
  for (const key in props) {
    if (props[key] === void 0) {
      node.removeAttribute(key);
    } else {
      const value = props[key];
      setAttr(node, key, value);
    }
  }
}
function reorderChildren(node, moves) {
  const staticNodeList = toArray(node.childNodes);
  const maps = {};
  each(staticNodeList, (node2) => {
    if (node2.nodeType === 1) {
      const key = node2.getAttribute("key");
      if (key) {
        maps[key] = node2;
      }
    }
  });
  each(moves, (move) => {
    const index = move.index;
    if (move.type === 0) {
      if (staticNodeList[index] === node.childNodes[index]) {
        node.removeChild(node.childNodes[index]);
      }
      staticNodeList.splice(index, 1);
    } else if (move.type === 1) {
      let insertNode;
      if (!move.item) {
        return;
      }
      if (typeof move.item === "string") {
        insertNode = document.createTextNode(move.item);
      } else if ("key" in move.item && maps[move.item.key]) {
        insertNode = maps[move.item.key].cloneNode(true);
      } else {
        insertNode = move.item.render();
      }
      staticNodeList.splice(index, 0, insertNode);
      node.insertBefore(insertNode, node.childNodes[index] || null);
    }
  });
}
patch.REPLACE = REPLACE;
patch.REORDER = REORDER;
patch.PROPS = PROPS;
patch.TEXT = TEXT;

// src/diff.ts
function diff2(oldTree, newTree2) {
  let index = 0;
  const patches2 = {};
  dfsWalk2(oldTree, newTree2, index, patches2);
  return patches2;
}
function dfsWalk2(oldNode, newNode, index, patches2) {
  const currentPatch = [];
  if (newNode === null) {
  } else if (typeof oldNode === "string" && typeof newNode === "string") {
    if (newNode !== oldNode) {
      currentPatch.push({ type: patch.TEXT, content: newNode });
    }
  } else if (oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
    const propsPatches = diffProps(oldNode, newNode);
    if (propsPatches) {
      currentPatch.push({ type: patch.PROPS, props: propsPatches });
    }
    if (!isIgnoreChildren(newNode)) {
      diffChildren(
        oldNode.children || [],
        newNode.children || [],
        index,
        patches2,
        currentPatch
      );
    }
  } else {
    currentPatch.push({ type: patch.REPLACE, node: newNode });
  }
  if (currentPatch.length) {
    patches2[index] = currentPatch;
  }
}
function diffChildren(oldChildren, newChildren, index, patches2, currentPatch) {
  const diffs = diff(oldChildren, newChildren, "key");
  newChildren = diffs.children;
  if (diffs.moves.length) {
    const reorderPatch = { type: patch.REORDER, moves: diffs.moves };
    currentPatch.push(reorderPatch);
  }
  let leftNode = null;
  let currentNodeIndex = index;
  oldChildren.forEach((child, i) => {
    const newChild = newChildren[i];
    currentNodeIndex = leftNode && (leftNode == null ? void 0 : leftNode.count) ? currentNodeIndex + leftNode.count + 1 : currentNodeIndex + 1;
    dfsWalk2(child, newChild, currentNodeIndex, patches2);
    leftNode = child;
  });
}
function diffProps(oldNode, newNode) {
  let count = 0;
  const oldProps = oldNode.props;
  const newProps = newNode.props;
  const propsPatches = {};
  for (const key in oldProps) {
    if (newProps[key] !== oldProps[key]) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }
  for (const key in newProps) {
    if (!oldProps.hasOwnProperty(key)) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }
  if (count === 0) {
    return null;
  }
  return propsPatches;
}
function isIgnoreChildren(node) {
  return node.props && node.props.hasOwnProperty("ignore");
}

// src/element.ts
var Element = class _Element {
  constructor(tagName, props, children) {
    this.tagName = tagName;
    this.props = props || {};
    this.children = children || [];
    this.key = props ? props.key : void 0;
    let count = 0;
    each(this.children, (child, i) => {
      if (child instanceof _Element) {
        count += child.count;
      } else {
        this.children[i] = "" + child;
      }
      count++;
    });
    this.count = count;
  }
  render() {
    const el = document.createElement(this.tagName);
    const props = this.props;
    for (const propName in props) {
      if (props.hasOwnProperty(propName)) {
        const propValue = props[propName];
        console.log(el, propName, propValue);
        setAttr(el, propName, propValue);
      }
    }
    each(this.children, (child) => {
      const childEl = child instanceof _Element ? child.render() : document.createTextNode(child);
      el.appendChild(childEl);
    });
    return el;
  }
};
function createElement(tagName, props, children) {
  if (Array.isArray(props)) {
    children = props;
    props = {};
  }
  if (!Array.isArray(children)) {
    children = children ? [children] : [];
  }
  props = props || {};
  return new Element(tagName, props, children);
}

// src/main.ts
var tree = createElement("div", { id: "container" }, [
  createElement("h1", { style: "color: blue" }, ["simple virtal dom"]),
  createElement("p", ["hello, virtual-dom"]),
  createElement("ul", [
    createElement("li")
  ])
]);
var root = tree.render();
var domRoot = document.getElementById("app");
domRoot.appendChild(root);
var newTree = createElement("div", { id: "container" }, [
  createElement("h1", { style: "color: red" }, ["simple virtal dom"]),
  createElement("p", ["hello, virtual-dom"]),
  createElement("ul", [
    createElement("li", ["patch1"]),
    createElement("li", ["patch2"])
  ])
]);
var patches = diff2(tree, newTree);
patch(root, patches);
