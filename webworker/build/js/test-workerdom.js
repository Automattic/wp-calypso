/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/test-workerdom.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@ampproject/worker-dom/dist/index.mjs":
/*!************************************************************!*\
  !*** ./node_modules/@ampproject/worker-dom/dist/index.mjs ***!
  \************************************************************/
/*! exports provided: upgradeElement */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "upgradeElement", function() { return upgradeElement; });
/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let count = 0;
const STRINGS = new Map();
/**
 * Return a string for the specified index.
 * @param index string index to retrieve.
 * @returns string in map for the index.
 */

function getString(index) {
  return STRINGS.get(index) || '';
}
/**
 * Stores a string for parsing from mutation
 * @param value string to store from background thread.
 */

function storeString(value) {
  STRINGS.set(++count, value);
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let NODES;
let BASE_ELEMENT;
function prepare(baseElement) {
  NODES = new Map([[1, baseElement], [2, baseElement]]);
  BASE_ELEMENT = baseElement;
}
function isTextNode(node) {
  return ('nodeType' in node ? node.nodeType : node[0
  /* nodeType */
  ]) === 3
  /* TEXT_NODE */
  ;
}
/**
 * Create a real DOM Node from a skeleton Object (`{ nodeType, nodeName, attributes, children, data }`)
 * @example <caption>Text node</caption>
 *   createNode({ nodeType:3, data:'foo' })
 * @example <caption>Element node</caption>
 *   createNode({ nodeType:1, nodeName:'div', attributes:[{ name:'a', value:'b' }], childNodes:[ ... ] })
 */

function createNode(skeleton) {
  if (isTextNode(skeleton)) {
    const node = document.createTextNode(getString(skeleton[5
    /* textContent */
    ]));
    storeNode(node, skeleton[7
    /* _index_ */
    ]);
    return node;
  }

  const namespace = skeleton[6
  /* namespaceURI */
  ] !== undefined ? getString(skeleton[6
  /* namespaceURI */
  ]) : undefined;
  const node = namespace ? document.createElementNS(namespace, getString(skeleton[1
  /* nodeName */
  ])) : document.createElement(getString(skeleton[1
  /* nodeName */
  ])); // TODO(KB): Restore Properties
  // skeleton.properties.forEach(property => {
  //   node[`${property.name}`] = property.value;
  // });
  // ((skeleton as TransferrableElement)[TransferrableKeys.childNodes] || []).forEach(childNode => {
  //   if (childNode[TransferrableKeys.transferred] === NumericBoolean.FALSE) {
  //     node.appendChild(createNode(childNode as TransferrableNode));
  //   }
  // });

  storeNode(node, skeleton[7
  /* _index_ */
  ]);
  return node;
}
/**
 * Returns the real DOM Element corresponding to a serialized Element object.
 * @param id
 * @return
 */

function getNode(id) {
  const node = NODES.get(id);

  if (node && node.nodeName === 'BODY') {
    // If the node requested is the "BODY"
    // Then we return the base node this specific <amp-script> comes from.
    // This encapsulates each <amp-script> node.
    return BASE_ELEMENT;
  }

  return node;
}
/**
 * Establish link between DOM `node` and worker-generated identifier `id`.
 *
 * These _shouldn't_ collide between instances of <amp-script> since
 * each element creates it's own pool on both sides of the worker
 * communication bridge.
 * @param node
 * @param id
 */

function storeNode(node, id) {
  node._index_ = id;
  NODES.set(id, node);
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// TODO(KB): Fetch Polyfill for IE11.
function createWorker(workerDomURL, authorScriptURL) {
  return Promise.all([fetch(workerDomURL).then(response => response.text()), fetch(authorScriptURL).then(response => response.text())]).then(([workerScript, authorScript]) => {
    // TODO(KB): Minify this output during build process.
    const keys = [];

    for (let key in document.body.style) {
      keys.push(`'${key}'`);
    }

    const code = `
        'use strict';
        ${workerScript}
        (function() {
          var self = this;
          var window = this;
          var document = this.document;
          var localStorage = this.localStorage;
          var location = this.location;
          var defaultView = document.defaultView;
          var Node = defaultView.Node;
          var Text = defaultView.Text;
          var Element = defaultView.Element;
          var SVGElement = defaultView.SVGElement;
          var Document = defaultView.Document;
          var Event = defaultView.Event;
          var MutationObserver = defaultView.MutationObserver;

          function addEventListener(type, handler) {
            return document.addEventListener(type, handler);
          }
          function removeEventListener(type, handler) {
            return document.removeEventListener(type, handler);
          }
          this.appendKeys([${keys}]);
          ${authorScript}
        }).call(WorkerThread.workerDOM);
//# sourceURL=${encodeURI(authorScriptURL)}`;
    return new Worker(URL.createObjectURL(new Blob([code])));
  }).catch(error => {
    return null;
  });
}
function messageToWorker(worker, message) {
  worker.postMessage(message);
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const KNOWN_LISTENERS = [];
/**
 * Instead of a whitelist of elements that need their value tracked, use the existence
 * of a property called value to drive the decision.
 * @param node node to check if values should be tracked.
 * @return boolean if the node should have its value property tracked.
 */

const shouldTrackChanges = node => node && 'value' in node;
/**
 * When a node that has a value needing synced doesn't already have an event listener
 * listening for changed values, ensure the value is synced with a default listener.
 * @param worker whom to dispatch value toward.
 * @param node node to listen to value changes on.
 */


const applyDefaultChangeListener = (worker, node) => {
  shouldTrackChanges(node) && node.onchange === null && (node.onchange = () => fireValueChange(worker, node));
};
/**
 * Tell the worker DOM what the value is for a Node.
 * @param worker whom to dispatch value toward.
 * @param node where to get the value from.
 */

const fireValueChange = (worker, node) => {
  messageToWorker(worker, {
    [9
    /* type */
    ]: 5
    /* SYNC */
    ,
    [38
    /* sync */
    ]: {
      [7
      /* _index_ */
      ]: node._index_,
      [18
      /* value */
      ]: node.value
    }
  });
};
/**
 * Register an event handler for dispatching events to worker thread
 * @param worker whom to dispatch events toward
 * @param _index_ node index the event comes from (used to dispatchEvent in worker thread).
 * @return eventHandler function consuming event and dispatching to worker thread
 */


const eventHandler = (worker, _index_) => event => {
  if (shouldTrackChanges(event.currentTarget)) {
    fireValueChange(worker, event.currentTarget);
  }

  messageToWorker(worker, {
    [9
    /* type */
    ]: 1
    /* EVENT */
    ,
    [37
    /* event */
    ]: {
      [7
      /* _index_ */
      ]: _index_,
      [22
      /* bubbles */
      ]: event.bubbles,
      [23
      /* cancelable */
      ]: event.cancelable,
      [24
      /* cancelBubble */
      ]: event.cancelBubble,
      [25
      /* currentTarget */
      ]: {
        [7
        /* _index_ */
        ]: event.currentTarget._index_,
        [8
        /* transferred */
        ]: 1
        /* TRUE */

      },
      [26
      /* defaultPrevented */
      ]: event.defaultPrevented,
      [27
      /* eventPhase */
      ]: event.eventPhase,
      [28
      /* isTrusted */
      ]: event.isTrusted,
      [29
      /* returnValue */
      ]: event.returnValue,
      [10
      /* target */
      ]: {
        [7
        /* _index_ */
        ]: event.target._index_,
        [8
        /* transferred */
        ]: 1
        /* TRUE */

      },
      [30
      /* timeStamp */
      ]: event.timeStamp,
      [9
      /* type */
      ]: event.type,
      [32
      /* keyCode */
      ]: 'keyCode' in event ? event.keyCode : undefined
    }
  });
};
/**
 * Process commands transfered from worker thread to main thread.
 * @param nodesInstance nodes instance to execute commands against.
 * @param worker whom to dispatch events toward.
 * @param mutation mutation record containing commands to execute.
 */


function process(worker, mutation) {
  const _index_ = mutation[10
  /* target */
  ];
  const target = getNode(_index_);
  (mutation[21
  /* removedEvents */
  ] || []).forEach(eventSub => {
    processListenerChange(worker, target, false, getString(eventSub[9
    /* type */
    ]), eventSub[33
    /* index */
    ]);
  });
  (mutation[20
  /* addedEvents */
  ] || []).forEach(eventSub => {
    processListenerChange(worker, target, true, getString(eventSub[9
    /* type */
    ]), eventSub[33
    /* index */
    ]);
  });
}
/**
 * If the worker requests to add an event listener to 'change' for something the foreground thread is already listening to
 * ensure that only a single 'change' event is attached to prevent sending values multiple times.
 * @param worker worker issuing listener changes
 * @param target node to change listeners on
 * @param addEvent is this an 'addEvent' or 'removeEvent' change
 * @param type event type requested to change
 * @param index number in the listeners array this event corresponds to.
 */

function processListenerChange(worker, target, addEvent, type, index) {
  let changeEventSubscribed = target.onchange !== null;
  const shouldTrack = shouldTrackChanges(target);
  const isChangeEvent = type === 'change';

  if (addEvent) {
    if (isChangeEvent) {
      changeEventSubscribed = true;
      target.onchange = null;
    }

    target.addEventListener(type, KNOWN_LISTENERS[index] = eventHandler(worker, target._index_));
  } else {
    if (isChangeEvent) {
      changeEventSubscribed = false;
    }

    target.removeEventListener(type, KNOWN_LISTENERS[index]);
  }

  if (shouldTrack && !changeEventSubscribed) {
    applyDefaultChangeListener(worker, target);
  }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function allTextNodes(nodes) {
  return nodes.length > 0 && [].every.call(nodes, isTextNode);
}
/**
 * Replace all the children with the ones from the HydrateableNode.
 * Used when we're certain the content won't break the page.
 * @param nodes HydrateableNodes containing content to potentially overwrite main thread content.
 * @param parent Node in the main thread that will be the parent of the passed nodes.
 * @param worker worker that issued the request for hydration.
 */


function replaceNodes(nodes, parent, worker) {
  [].forEach.call(parent.childNodes, childNode => childNode.remove());
  nodes.forEach((node, index) => {
    const newNode = createNode(node);
    (node[2
    /* attributes */
    ] || []).forEach(attribute => {
      const namespaceURI = getString(attribute[0]);

      if (namespaceURI !== 'null') {
        newNode.setAttributeNS(namespaceURI, getString(attribute[1]), getString(attribute[2]));
      } else {
        newNode.setAttribute(getString(attribute[1]), getString(attribute[2]));
      }
    });
    parent.appendChild(newNode);
    applyDefaultChangeListener(worker, newNode);
    replaceNodes(node[4
    /* childNodes */
    ] || [], parent.childNodes[index], worker);
  });
}
/**
 * Hydrate a single node and it's children safely.
 * Attempt to ensure content is a rough match so content doesn't shift between the document representation
 * and client side generated content.
 * @param transferNode root of the background thread content (document.body from worker-thread).
 * @param node root for the foreground thread content (element upgraded to background driven).
 * @param worker worker that issued the request for hydration.
 */


function hydrateNode(transferNode, node, worker) {
  const transferIsText = isTextNode(transferNode);
  const nodeIsText = isTextNode(node);

  if (!transferIsText && !nodeIsText) {
    const childNodes = transferNode[4
    /* childNodes */
    ] || [];

    if (childNodes.length !== node.childNodes.length) {
      // If this parent node has an unequal number of childNodes, we need to ensure its for an allowable reason.
      if (allTextNodes(childNodes) && allTextNodes(node.childNodes)) {
        // Offset due to a differing number of text nodes.
        // replace the current DOM with the text nodes from the hydration.
        replaceNodes(childNodes, node, worker);
      } else {
        const filteredTransfer = childNodes.filter(childNode => !isTextNode(childNode));
        const filteredNodes = [].filter.call(node.childNodes, childNode => !isTextNode(childNode)); // Empty text nodes are used by frameworks as placeholders for future dom content.

        if (filteredTransfer.length === filteredNodes.length) {
          storeNode(node, transferNode[7
          /* _index_ */
          ]);
          replaceNodes(childNodes, node, worker);
        }
      }
    } else {
      storeNode(node, transferNode[7
      /* _index_ */
      ]);
      applyDefaultChangeListener(worker, node); // Same number of children, hydrate them.

      childNodes.forEach((childNode, index) => hydrateNode(childNode, node.childNodes[index], worker));
    }
  } else if (transferIsText && nodeIsText) {
    // Singular text node, no children.
    storeNode(node, transferNode[7
    /* _index_ */
    ]);
    node.textContent = getString(transferNode[5
    /* textContent */
    ]);
    applyDefaultChangeListener(worker, node);
  }
}
/**
 * Hydrate a root from the worker thread by comparing with the main thread representation.
 * @param skeleton root of the background thread content.
 * @param addEvents events needing subscription from the background thread content.
 * @param baseElement root of the main thread content to compare against.
 * @param worker worker issuing the upgrade request.
 */


function hydrate(skeleton, stringValues, addEvents, baseElement, worker) {
  // Process String Additions
  stringValues.forEach(value => storeString(value)); // Process Node Addition / Removal

  hydrateNode(skeleton, baseElement, worker); // Process Event Addition

  addEvents.forEach(event => {
    const node = getNode(event[7
    /* _index_ */
    ]);
    node && processListenerChange(worker, node, true, getString(event[9
    /* type */
    ]), event[33
    /* index */
    ]);
  });
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let MUTATION_QUEUE = [];
let PENDING_MUTATIONS = false;
let worker;
function prepareMutate(passedWorker) {
  worker = passedWorker;
}
const mutators = {
  [2
  /* CHILD_LIST */
  ](mutation, target, sanitizer) {
    (mutation[12
    /* removedNodes */
    ] || []).forEach(node => getNode(node[7
    /* _index_ */
    ]).remove());
    const addedNodes = mutation[11
    /* addedNodes */
    ];
    const nextSibling = mutation[14
    /* nextSibling */
    ];

    if (addedNodes) {
      addedNodes.forEach(node => {
        let newChild = getNode(node[7
        /* _index_ */
        ]);

        if (!newChild) {
          newChild = createNode(node);

          if (sanitizer) {
            sanitizer.sanitize(newChild); // TODO(choumx): Inform worker?
          }
        }

        target.insertBefore(newChild, nextSibling && getNode(nextSibling[7
        /* _index_ */
        ]) || null);
      });
    }
  },

  [0
  /* ATTRIBUTES */
  ](mutation, target, sanitizer) {
    const attributeName = mutation[15
    /* attributeName */
    ] !== undefined ? getString(mutation[15
    /* attributeName */
    ]) : null;
    const value = mutation[18
    /* value */
    ] !== undefined ? getString(mutation[18
    /* value */
    ]) : null;

    if (attributeName != null && value != null) {
      if (!sanitizer || sanitizer.validAttribute(target.nodeName, attributeName, value)) {
        target.setAttribute(attributeName, value);
      }
    }
  },

  [1
  /* CHARACTER_DATA */
  ](mutation, target) {
    const value = mutation[18
    /* value */
    ];

    if (value) {
      // Sanitization not necessary for textContent.
      target.textContent = getString(value);
    }
  },

  [3
  /* PROPERTIES */
  ](mutation, target, sanitizer) {
    const propertyName = mutation[17
    /* propertyName */
    ] !== undefined ? getString(mutation[17
    /* propertyName */
    ]) : null;
    const value = mutation[18
    /* value */
    ] !== undefined ? getString(mutation[18
    /* value */
    ]) : null;

    if (propertyName && value) {
      if (!sanitizer || sanitizer.validProperty(target.nodeName, propertyName, value)) {
        target[propertyName] = value;
      }
    }
  },

  [4
  /* COMMAND */
  ](mutation) {
    process(worker, mutation);
  }

};
/**
 * Process MutationRecords from worker thread applying changes to the existing DOM.
 * @param nodes New nodes to add in the main thread with the incoming mutations.
 * @param mutations Changes to apply in both graph shape and content of Elements.
 * @param sanitizer Sanitizer to apply to content if needed.
 */

function mutate(nodes, stringValues, mutations, sanitizer) {
  //mutations: TransferrableMutationRecord[]): void {
  // TODO(KB): Restore signature requiring lastMutationTime. (lastGestureTime: number, mutations: TransferrableMutationRecord[])
  // if (performance.now() || Date.now() - lastGestureTime > GESTURE_TO_MUTATION_THRESHOLD) {
  //   return;
  // }
  // this.lastGestureTime = lastGestureTime;
  stringValues.forEach(value => storeString(value));
  nodes.forEach(node => createNode(node));
  MUTATION_QUEUE = MUTATION_QUEUE.concat(mutations);

  if (!PENDING_MUTATIONS) {
    PENDING_MUTATIONS = true;
    requestAnimationFrame(() => syncFlush(sanitizer));
  }
}
/**
 * Apply all stored mutations syncronously. This method works well, but can cause jank if there are too many
 * mutations to apply in a single frame.
 *
 * Investigations in using asyncFlush to resolve are worth considering.
 */

function syncFlush(sanitizer) {
  MUTATION_QUEUE.forEach(mutation => {
    mutators[mutation[9
    /* type */
    ]](mutation, getNode(mutation[10
    /* target */
    ]), sanitizer);
  });
  MUTATION_QUEUE = [];
  PENDING_MUTATIONS = false;
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function install(baseElement, workerDOMUrl, sanitizer) {
  const authorURL = baseElement.getAttribute('src');

  if (authorURL === null) {
    return;
  }

  console.info("install workerdom");

  createWorker(workerDOMUrl, authorURL).then(worker => {
    if (worker === null) {
      return;
    }

    prepare(baseElement);
    prepareMutate(worker);

    worker.onmessage = ({
      data
    }) => {
      switch (data[9
      /* type */
      ]) {
        case 2
        /* HYDRATE */
        :
          console.info(`hydration from worker: ${data.type}`, data);
          hydrate(data[35
          /* nodes */
          ], data[39
          /* strings */
          ], data[20
          /* addedEvents */
          ], baseElement, worker);
          break;

        case 3
        /* MUTATE */
        :
          console.info(`mutation from worker: ${data.type}`, data);
          mutate(data[35
          /* nodes */
          ], data[39
          /* strings */
          ], data[34
          /* mutations */
          ], sanitizer);
          break;
      }
    };
  });
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function upgradeElement(baseElement, workerDOMUrl) {
  install(baseElement, workerDOMUrl);
}


//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./src/js/test-workerdom.js":
/*!**********************************!*\
  !*** ./src/js/test-workerdom.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _index = __webpack_require__(/*! @ampproject/worker-dom/dist/index.mjs */ "./node_modules/@ampproject/worker-dom/dist/index.mjs");

// TODO: use safe version?

function testWorkerDOM() {
	// let's add a mutation observer for debugging
	var targetNode = document.getElementById('upgrade-me');
	console.warn('mounted remote block', _index.upgradeElement, targetNode);
	var config = { attributes: true, childList: true, subtree: true };
	// Callback function to execute when mutations are observed
	var callback = function callback(mutationsList) {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = mutationsList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var mutation = _step.value;

				if (mutation.type == 'childList') {
					console.log('A child node has been added or removed.');
				} else if (mutation.type == 'attributes') {
					console.log('The ' + mutation.attributeName + ' attribute was modified.');
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	};

	// Create an observer instance linked to the callback function
	var observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(targetNode, config);
	console.warn('added mutation observer');

	// kick off webworker
	// upgradeElement( document.getElementById('upgrade-me'), '/webworker/remote-gutenberg.js' );
	(0, _index.upgradeElement)(targetNode, 'http://remote.localhost:3000/webworker/js/worker.mjs');
	console.warn('upgraded element');
}

window.addEventListener("load", function (event) {
	console.log("All resources finished loading!");
	testWorkerDOM();
});

/***/ })

/******/ });
//# sourceMappingURL=test-workerdom.js.map