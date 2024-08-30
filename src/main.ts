import { diff } from "./diff";
import { createElement } from "./element";
import { patch } from "./patch";

const tree = createElement("div", { id: "container" }, [
  createElement("h1", { style: "color: blue" }, ["simple virtal dom"]),
  createElement("p", ["hello, virtual-dom"]),
  createElement("ul", [
    createElement("li"),
  ]),
]);

// 2. generate a real dom from virtual dom. `root` is a `div` createElement
const root = tree.render();
const domRoot = document.getElementById("app") as HTMLDivElement;
domRoot.appendChild(root);

// 3. generate another different virtual dom tree
const newTree = createElement("div", { id: "container" }, [
  createElement("h1", { style: "color: red" }, ["simple virtal dom"]),
  createElement("p", ["hello, virtual-dom"]),
  createElement("ul", [
    createElement("li", ["patch1"]),
    createElement("li", ["patch2"]),
  ]),
]);

// 4. diff two virtual dom trees and get patches
var patches = diff(tree, newTree);

// 5. apply patches to real dom
patch(root, patches);
