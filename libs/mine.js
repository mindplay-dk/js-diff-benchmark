function createIndex(children) {
  let map = new Map();

  for (let i = children.length; i--;) {
    map.set(children[i], i);
  }

  return map;
}

function diff(parent, oldChildren, newChildren, endMarker) {
  // remove old children:
  let newIndex = createIndex(newChildren);
  oldChildren = oldChildren.filter(child => {
    if (newIndex.has(child)) {
      return true;
    }

    parent.removeChild(child);
    return false;
  });
  // find ranges:
  let range = [];
  let ranges = [range]; // TODO improve handling when `oldChildren == []` - we currently end up with a useless empty range

  let addedChildren = [];
  let oldIndex = createIndex(oldChildren);
  newIndex.set(endMarker, newChildren.length);

  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[i];

    if (oldIndex.has(child)) {
      if (newChildren[i - 1] == oldChildren[oldIndex.get(child) - 1]) {
        range.push(child);
      } else {
        ranges.push(range = [child]);
      }
    } else {
      addedChildren.push(child);
    }
  }

  ranges.sort((a, b) => a.length !== b.length ? a.length - b.length // shorter ranges first
  : newIndex.get(a[0]) - newIndex.get(b[0]) // lower indices first
  ); // process ranges:

  let children = parent.childNodes;
  let childrenStart = Array.prototype.indexOf.call(children, oldChildren[0]);
  let childrenEnd = childrenStart + oldChildren.length;

  for (let i = 0; i < ranges.length; i++) {
    let _range = ranges[i];
    let last = _range[_range.length - 1];
    let lastIndex = newIndex.get(last);

    for (let n = childrenStart; n <= childrenEnd; n++) {
      let next = children[n] || endMarker; //console.log("- test ", newIndex.get(next), ">", lastIndex, "?");

      if (newIndex.get(next) > lastIndex) {
        if (last.nextSibling != next) {
          for (let c = _range.length - 1; c >= 0; c--) {
            let child = _range[c];
            parent.insertBefore(child, next);
            next = child;
          }
        }

        break;
      }
    }
  } // process added children:


  for (let i = addedChildren.length; i--;) {
    const child = addedChildren[i];
    const next = newChildren[newIndex.get(child) + 1] || endMarker;
    parent.insertBefore(child, next);
  }

  return newChildren;
}

module.exports = diff;
