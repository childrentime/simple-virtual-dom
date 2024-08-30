import { Element } from "./element";
import { listDiff } from "./list-diff";
import { Patch, patch, Patches } from "./patch";

export function diff(oldTree: Element, newTree: Element): Patches {
  let index = 0;
  const patches: Patches = {};
  dfsWalk(oldTree, newTree, index, patches);
  return patches;
}

function dfsWalk(
  oldNode: Element | string,
  newNode: Element | string,
  index: number,
  patches: Patches
): void {
  const currentPatch: Patch[] = [];

  if (newNode === null) {
    // Node is removed. Real DOM node will be removed when perform reordering, so no need to do anything here
  } else if (typeof oldNode === "string" && typeof newNode === "string") {
    if (newNode !== oldNode) {
      currentPatch.push({ type: patch.TEXT, content: newNode });
    }
  } else if (
    (oldNode as Element).tagName === (newNode as Element).tagName &&
    (oldNode as Element).key === (newNode as Element).key
  ) {
    // Diff props
    const propsPatches = diffProps(oldNode as Element, newNode as Element);
    if (propsPatches) {
      currentPatch.push({ type: patch.PROPS, props: propsPatches });
    }
    // Diff children. If the node has an `ignore` property, do not diff children
    if (!isIgnoreChildren(newNode as Element)) {
      diffChildren(
        (oldNode as Element).children || [],
        (newNode as Element).children || [],
        index,
        patches,
        currentPatch
      );
    }
  } else {
    currentPatch.push({ type: patch.REPLACE, node: newNode });
  }

  if (currentPatch.length) {
    patches[index] = currentPatch;
  }
}

function diffChildren(
  oldChildren: (Element | string)[],
  newChildren: (Element | string)[],
  index: number,
  patches: Patches,
  currentPatch: Patch[]
): void {
  const diffs = listDiff(oldChildren, newChildren, "key");
  newChildren = diffs.children;

  if (diffs.moves.length) {
    const reorderPatch = { type: patch.REORDER, moves: diffs.moves };
    currentPatch.push(reorderPatch);
  }

  let leftNode: Element | string | null = null;
  let currentNodeIndex = index;
  oldChildren.forEach((child, i) => {
    const newChild = newChildren[i];
    currentNodeIndex =
      leftNode && (leftNode as Element)?.count
        ? currentNodeIndex + (leftNode as Element).count + 1
        : currentNodeIndex + 1;
    dfsWalk(child, newChild, currentNodeIndex, patches);
    leftNode = child;
  });
}

function diffProps(
  oldNode: Element,
  newNode: Element
): Record<string, any> | null {
  let count = 0;
  const oldProps = oldNode.props;
  const newProps = newNode.props;

  const propsPatches: Record<string, any> = {};

  // Find out different properties
  for (const key in oldProps) {
    if (newProps[key] !== oldProps[key]) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }

  // Find out new property
  for (const key in newProps) {
    if (!oldProps.hasOwnProperty(key)) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }

  // If properties all are identical
  if (count === 0) {
    return null;
  }

  return propsPatches;
}

function isIgnoreChildren(node: Element): boolean {
  return node.props && node.props.hasOwnProperty("ignore");
}
