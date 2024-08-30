import { each, setAttr, toArray } from "./util";

const REPLACE = 0;
const REORDER = 1;
const PROPS = 2;
const TEXT = 3;

export interface Patch {
  type: number;
  node?: string | { render: () => Node };
  moves?: Move[];
  props?: { [key: string]: any };
  content?: string;
}

export interface Patches {
  [key: number]: Patch[];
}

interface Move {
  index: number;
  type: number;
  item?: { key: string } | string | { render: () => Node };
}

interface Walker {
  index: number;
}

export function patch(node: Node, patches: Patches): void {
  const walker: Walker = { index: 0 };
  dfsWalk(node, walker, patches);
}

function dfsWalk(node: Node, walker: Walker, patches: Patches): void {
  const currentPatches = patches[walker.index];
  const len = node.childNodes ? node.childNodes.length : 0;
  for (let i = 0; i < len; i++) {
    const child = node.childNodes[i];
    walker.index++;
    dfsWalk(child, walker, patches);
  }
  if (currentPatches) {
    applyPatches(node, currentPatches);
  }
}

function applyPatches(node: Node, currentPatches: Patch[]): void {
  each(currentPatches, (currentPatch) => {
    switch (currentPatch.type) {
      case REPLACE:
        const newNode =
          typeof currentPatch.node === "string"
            ? document.createTextNode(currentPatch.node)
            : (currentPatch.node as { render: () => Node }).render();
        node.parentNode!.replaceChild(newNode, node);
        break;
      case REORDER:
        reorderChildren(node as Element, currentPatch.moves!);
        break;
      case PROPS:
        setProps(node as HTMLElement, currentPatch.props!);
        break;
      case TEXT:
        if ("textContent" in node) {
          (node as Text).textContent = currentPatch.content!;
        } else {
          // For older IE versions
          (node as Text).nodeValue = currentPatch.content!;
        }
        break;
      default:
        throw new Error("Unknown patch type " + currentPatch.type);
    }
  });
}

function setProps(node: HTMLElement, props: { [key: string]: any }): void {
  for (const key in props) {
    if (props[key] === void 0) {
      node.removeAttribute(key);
    } else {
      const value = props[key];
      setAttr(node, key, value);
    }
  }
}

function reorderChildren(node: Element, moves: Move[]): void {
  const staticNodeList = toArray(node.childNodes);
  const maps: { [key: string]: Node } = {};

  each(staticNodeList, (node) => {
    if (node.nodeType === 1) {
      const key = (node as Element).getAttribute("key");
      if (key) {
        maps[key] = node;
      }
    }
  });

  each(moves, (move) => {
    const index = move.index;
    if (move.type === 0) {
      // remove item
      if (staticNodeList[index] === node.childNodes[index]) {
        // maybe have been removed for inserting
        node.removeChild(node.childNodes[index]);
      }
      staticNodeList.splice(index, 1);
    } else if (move.type === 1) {
      // insert item
      let insertNode: Node;
      if(!move.item) {
        return;
      }
      if (typeof move.item === "string") {
        insertNode = document.createTextNode(move.item);
      } else if ("key" in move.item && maps[move.item.key]) {
        insertNode = maps[move.item.key].cloneNode(true); // reuse old item
      } else {
        insertNode = (move.item as { render: () => Node }).render();
      }
      staticNodeList.splice(index, 0, insertNode as ChildNode);
      node.insertBefore(insertNode, node.childNodes[index] || null);
    }
  });
}

patch.REPLACE = REPLACE;
patch.REORDER = REORDER;
patch.PROPS = PROPS;
patch.TEXT = TEXT;
