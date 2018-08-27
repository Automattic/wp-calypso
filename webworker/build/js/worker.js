var WorkerThread = (function (exports) {
  'use strict';

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
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
  var count = 0;
  var transfer = [];
  var mapping = new Map();
  /**
   * Stores a node in mapping, and makes the index available on the Node directly.
   * @param node Node to store and modify with index
   * @return index Node was stored with in mapping
   */

  function store(node) {
    if (node._index_ !== undefined) {
      return node._index_;
    }

    mapping.set(node._index_ = ++count, node);
    transfer.push(node);
    return count;
  }
  /**
   * Retrieves a node based on an index.
   * @param index location in map to retrieve a Node for
   * @return either the Node represented in index position, or null if not available.
   */

  function get(index) {
    // mapping has a 1 based index, since on first store we ++count before storing.
    return !!index && mapping.get(index) || null;
  }
  /**
   * Returns nodes registered but not yet transferred.
   * Side effect: Resets the transfer array to default value, to prevent passing the same values multiple times.
   */

  function consume() {
    var copy = transfer;
    transfer = [];
    return copy;
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
  var toLower = function toLower(string) {
    return string.toLowerCase();
  };
  var keyValueString = function keyValueString(key, value) {
    return key + "=\"" + value + "\"";
  };

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
  var observers = [];
  var pendingMutations = false;

  var match = function match(observerTarget, target) {
    return observerTarget !== null && target._index_ === observerTarget._index_;
  };

  var pushMutation = function pushMutation(observer, record) {
    observer.pushRecord(record);

    if (!pendingMutations) {
      pendingMutations = true;
      Promise.resolve().then(function () {
        pendingMutations = false;
        observers.forEach(function (observer) {
          return observer.callback(observer.takeRecords());
        });
      });
    }
  };
  /**
   * When DOM mutations occur, Nodes will call this method with MutationRecords
   * These records are then pushed into MutationObserver instances that match the MutationRecord.target
   * @param record MutationRecord to push into MutationObservers.
   */


  function mutate(record) {
    observers.forEach(function (observer) {
      if (!observer.options.subtreeFlattened || record.type === 4
      /* COMMAND */
      ) {
          pushMutation(observer, record);
          return;
        }

      var target = record.target;
      var matched = match(observer.target, target);

      if (!matched) {
        do {
          if (matched = match(observer.target, target)) {
            pushMutation(observer, record);
            break;
          }
        } while (target = target.parentNode);
      }
    });
  }
  var MutationObserver =
  /*#__PURE__*/
  function () {
    function MutationObserver(callback) {
      this._records_ = [];
      this.callback = callback;
    }
    /**
     * Register the MutationObserver instance to observe a Nodes mutations.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     * @param target Node to observe DOM mutations
     */


    var _proto = MutationObserver.prototype;

    _proto.observe = function observe(target, options) {
      this.disconnect();
      this.target = target;
      this.options = Object.assign({
        subtreeFlattened: false
      }, options);
      observers.push(this);
    };
    /**
     * Stop the MutationObserver instance from observing a Nodes mutations.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     */


    _proto.disconnect = function disconnect() {
      this.target = null;
      var index = observers.indexOf(this);

      if (index >= 0) {
        observers.splice(index, 1);
      }
    };
    /**
     * Empties the MutationObserver instance's record queue and returns what was in there.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     * @return Mutation Records stored on this MutationObserver instance.
     */


    _proto.takeRecords = function takeRecords() {
      return this._records_.splice(0, this._records_.length);
    };
    /**
     * NOTE: This method doesn't exist on native MutationObserver.
     * @param record MutationRecord to store for this instance.
     */


    _proto.pushRecord = function pushRecord(record) {
      this._records_.push(record);
    };

    return MutationObserver;
  }();

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
  var count$1 = 0;
  var transfer$1 = [];
  var mapping$1 = new Map();
  /**
   * Stores a string in mapping and returns the index of the location.
   * @param value string to store
   * @return location in map
   */

  function store$1(value) {
    if (mapping$1.has(value)) {
      // Safe to cast since we verified the mapping contains the value
      return mapping$1.get(value);
    }

    mapping$1.set(value, ++count$1);
    transfer$1.push(value);
    return count$1;
  }
  /**
   * Returns strings registered but not yet transferred.
   * Side effect: Resets the transfer array to default value, to prevent passing the same values multiple times.
   */

  function consume$1() {
    var strings = transfer$1;
    transfer$1 = [];
    return strings;
  }

  var globalDocument = null;
  /**
   * Propagates a property change for a Node to itself and all childNodes.
   * @param node Node to start applying change to
   * @param property Property to modify
   * @param value New value to apply
   */

  var propagate = function propagate(node, property, value) {
    node[property] = value;
    node.childNodes.forEach(function (child) {
      return propagate(child, property, value);
    });
  }; // https://developer.mozilla.org/en-US/docs/Web/API/Node
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
  //
  // Please note, in this implmentation Node doesn't extend EventTarget.
  // This is intentional to reduce the number of classes.


  var Node =
  /*#__PURE__*/
  function () {
    function Node(nodeType, nodeName) {
      this.childNodes = [];
      this.parentNode = null;
      this.isConnected = false;
      this._handlers_ = {};
      this.nodeType = nodeType;
      this.nodeName = nodeName; // The first Node created is the global document.

      if (globalDocument === null) {
        globalDocument = this;
      }

      this.ownerDocument = globalDocument;
      this._index_ = store(this);
    } // Unimplemented Properties
    // Node.baseURI – https://developer.mozilla.org/en-US/docs/Web/API/Node/baseURI
    // Unimplemented Methods
    // Node.compareDocumentPosition() – https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
    // Node.getRootNode() – https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode
    // Node.isDefaultNamespace() – https://developer.mozilla.org/en-US/docs/Web/API/Node/isDefaultNamespace
    // Node.isEqualNode() – https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode
    // Node.isSameNode() – https://developer.mozilla.org/en-US/docs/Web/API/Node/isSameNode
    // Node.lookupPrefix() – https://developer.mozilla.org/en-US/docs/Web/API/Node/lookupPrefix
    // Node.lookupNamespaceURI() – https://developer.mozilla.org/en-US/docs/Web/API/Node/lookupNamespaceURI
    // Node.normalize() – https://developer.mozilla.org/en-US/docs/Web/API/Node/normalize
    // Implemented at Element/Text layer
    // Node.nodeValue – https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue
    // Node.cloneNode – https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode

    /**
     * Getter returning the text representation of Element.childNodes.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
     * @return text from all childNodes.
     */


    var _proto = Node.prototype;

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/hasChildNodes
     * @return boolean if the Node has childNodes.
     */
    _proto.hasChildNodes = function hasChildNodes() {
      return this.childNodes.length > 0;
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
     * @param otherNode
     * @return whether a Node is a descendant of a given Node
     */


    _proto.contains = function contains(otherNode) {
      if (this.childNodes.length > 0) {
        if (this.childNodes.includes(this)) {
          return true;
        }

        return this.childNodes.some(function (child) {
          return child.contains(otherNode);
        });
      }

      return otherNode === this;
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
     * @param child
     * @param referenceNode
     * @return child after it has been inserted.
     */


    _proto.insertBefore = function insertBefore(child, referenceNode) {
      if (child === null) {
        return null;
      }

      if (child === this) {
        // The new child cannot contain the parent.
        return child;
      }

      if (referenceNode == null) {
        // When a referenceNode is not valid, appendChild(child).
        this.appendChild(child);
        mutate({
          addedNodes: [child],
          type: 2
          /* CHILD_LIST */
          ,
          target: this
        });
        return child;
      }

      if (this.childNodes.indexOf(referenceNode) >= 0) {
        // Should only insertBefore direct children of this Node.
        child.remove(); // Removing a child can cause this.childNodes to change, meaning we need to splice from its updated location.

        this.childNodes.splice(this.childNodes.indexOf(referenceNode), 0, child);
        child.parentNode = this;
        propagate(child, 'isConnected', this.isConnected);
        mutate({
          addedNodes: [child],
          nextSibling: referenceNode,
          type: 2
          /* CHILD_LIST */
          ,
          target: this
        });
        return child;
      }

      return null;
    };
    /**
     * Adds the specified childNode argument as the last child to the current node.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
     * @param child Child Node to append to this Node.
     */


    _proto.appendChild = function appendChild(child) {
      child.remove();
      child.parentNode = this;
      propagate(child, 'isConnected', this.isConnected);
      this.childNodes.push(child);
      mutate({
        addedNodes: [child],
        previousSibling: this.childNodes[this.childNodes.length - 2],
        type: 2
        /* CHILD_LIST */
        ,
        target: this
      });
    };
    /**
     * Removes a child node from the current element.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
     * @param child Child Node to remove from this Node.
     * @return Node removed from the tree or null if the node wasn't attached to this tree.
     */


    _proto.removeChild = function removeChild(child) {
      var index = this.childNodes.indexOf(child);
      var exists = index >= 0;

      if (exists) {
        child.parentNode = null;
        propagate(child, 'isConnected', false);
        this.childNodes.splice(index, 1);
        mutate({
          removedNodes: [child],
          type: 2
          /* CHILD_LIST */
          ,
          target: this
        });
        return child;
      }

      return null;
    }; // TODO(KB): Verify behaviour.

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/replaceChild
     * @param newChild new Node to replace old Node.
     * @param oldChild existing Node to be replaced.
     * @return child that was replaced.
     */


    _proto.replaceChild = function replaceChild(newChild, oldChild) {
      if (newChild !== oldChild) {
        var index = this.childNodes.indexOf(oldChild);

        if (index >= 0) {
          oldChild.parentNode = null;
          propagate(oldChild, 'isConnected', false);
          this.childNodes.splice(index, 1, newChild);
          mutate({
            addedNodes: [newChild],
            removedNodes: [oldChild],
            type: 2
            /* CHILD_LIST */
            ,
            target: this
          });
        }
      }

      return oldChild;
    };
    /**
     * Removes this Node from the tree it belogs too.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
     */


    _proto.remove = function remove() {
      this.parentNode && this.parentNode.removeChild(this);
    };
    /**
     * Add an event listener to callback when a specific event type is dispatched.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     * @param type Event Type (i.e 'click')
     * @param handler Function called when event is dispatched.
     */


    _proto.addEventListener = function addEventListener(type, handler) {
      var _ref;

      var handlers = this._handlers_[toLower(type)];

      var index = 0;

      if (handlers && handlers.length > 0) {
        index = handlers.push(handler);
      } else {
        this._handlers_[toLower(type)] = [handler];
      }

      mutate({
        target: this,
        type: 4
        /* COMMAND */
        ,
        addedEvents: [(_ref = {}, _ref[9
        /* type */
        ] = store$1(type), _ref[7
        /* _index_ */
        ] = this._index_, _ref[33
        /* index */
        ] = index, _ref)]
      });
    };
    /**
     * Remove a registered event listener for a specific event type.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
     * @param type Event Type (i.e 'click')
     * @param handler Function to stop calling when event is dispatched.
     */


    _proto.removeEventListener = function removeEventListener(type, handler) {
      var handlers = this._handlers_[toLower(type)];

      var index = !!handlers ? handlers.indexOf(handler) : -1;

      if (index >= 0) {
        var _ref2;

        handlers.splice(index, 1);
        mutate({
          target: this,
          type: 4
          /* COMMAND */
          ,
          removedEvents: [(_ref2 = {}, _ref2[9
          /* type */
          ] = store$1(type), _ref2[7
          /* _index_ */
          ] = this._index_, _ref2[33
          /* index */
          ] = index, _ref2)]
        });
      }
    };
    /**
     * Dispatch an event for this Node.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
     * @param event Event to dispatch to this node and potentially cascade to parents.
     */


    _proto.dispatchEvent = function dispatchEvent(event) {
      var target = event.currentTarget = this;
      var handlers;
      var iterator;

      do {
        handlers = target && target._handlers_ && target._handlers_[toLower(event.type)];

        if (handlers) {
          for (iterator = handlers.length; iterator--;) {
            if ((handlers[iterator].call(target, event) === false || event._end) && event.cancelable) {
              break;
            }
          }
        }
      } while (event.bubbles && !(event.cancelable && event._stop) && (target = target && target.parentNode));

      return !event.defaultPrevented;
    };

    _createClass(Node, [{
      key: "textContent",
      get: function get$$1() {
        var textContent = '';
        var childNodes = this.childNodes;

        if (childNodes.length) {
          childNodes.forEach(function (childNode) {
            return textContent += childNode.textContent;
          });
          return textContent;
        }

        return '';
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild
       * @return Node's first child in the tree, or null if the node has no children.
       */

    }, {
      key: "firstChild",
      get: function get$$1() {
        return this.childNodes.length > 0 ? this.childNodes[0] : null;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/lastChild
       * @return The last child of a node, or null if there are no child elements.
       */

    }, {
      key: "lastChild",
      get: function get$$1() {
        return this.childNodes.length > 0 ? this.childNodes[this.childNodes.length - 1] : null;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling
       * @return node immediately following the specified one in it's parent's childNodes, or null if one doesn't exist.
       */

    }, {
      key: "nextSibling",
      get: function get$$1() {
        if (this.parentNode === null) {
          return null;
        }

        var parentChildNodes = this.parentNode.childNodes;
        return parentChildNodes[parentChildNodes.indexOf(this) + 1] || null;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/previousSibling
       * @return node immediately preceding the specified one in its parent's childNodes, or null if the specified node is the first in that list.
       */

    }, {
      key: "previousSibling",
      get: function get$$1() {
        if (this.parentNode === null) {
          return null;
        }

        var parentChildNodes = this.parentNode.childNodes;
        return parentChildNodes[parentChildNodes.indexOf(this) - 1] || null;
      }
    }]);

    return Node;
  }();

  var DOMTokenList =
  /*#__PURE__*/
  function () {
    /**
     * The DOMTokenList interface represents a set of space-separated tokens.
     * It is indexed beginning with 0 as with JavaScript Array objects and is case-sensitive.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList
     * @param defineOn Element or class extension to define getter/setter pair for token list access.
     * @param element Specific Element instance to modify when value is changed.
     * @param attributeName Name of the attribute used by Element to access DOMTokenList.
     * @param accessorKey Key used to access DOMTokenList directly from specific element.
     * @param propertyName Key used to access DOMTokenList as string getter/setter.
     */
    function DOMTokenList(defineOn, element, attributeName, accessorKey, propertyName) {
      var _this = this;

      this.array_ = [];
      this.element_ = element;
      this.attributeName_ = attributeName;
      this.storeAttributeMethod_ = element.storeAttributeNS_.bind(element);
      element.propertyBackedAttributes_[attributeName] = [function () {
        return _this.value;
      }, function (value) {
        return _this.value = value;
      }];

      if (accessorKey && propertyName) {
        Object.defineProperty(defineOn.prototype, propertyName, {
          enumerable: true,
          configurable: true,
          get: function get() {
            return this[accessorKey].value;
          },
          set: function set(value) {
            this[accessorKey].value = value;
          }
        });
      }
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/value
     * @return string representation of tokens (space delimitted).
     */


    var _proto = DOMTokenList.prototype;

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/item
     * @param index number from DOMTokenList entities to retrieve value of
     * @return value stored at the index requested, or undefined if beyond known range.
     */
    _proto.item = function item(index) {
      return this.array_[index];
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains
     * @param token value the DOMTokenList is tested for.
     * @return boolean indicating if the token is contained by the DOMTokenList.
     */


    _proto.contains = function contains(token) {
      return this.array_.includes(token);
    };
    /**
     * Add a token or tokens to the list.
     * Note: All duplicates are removed, and the first token's position with the value is preserved.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add
     * @param tokens each token is a string to add to a TokenList.
     */


    _proto.add = function add() {
      var _this$array_;

      var oldValue = this.value;

      for (var _len = arguments.length, tokens = new Array(_len), _key = 0; _key < _len; _key++) {
        tokens[_key] = arguments[_key];
      }

      (_this$array_ = this.array_).splice.apply(_this$array_, [0, this.array_.length].concat(new Set(this.array_.concat(tokens))));

      this.mutationCompleteHandler_(oldValue, this.value);
    };
    /**
     * Remove a token or tokens from the list.
     * Note: All duplicates are removed, and the first token's position with the value is preserved.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove
     * @param tokens each token is a string to remove from a TokenList.
     */


    _proto.remove = function remove() {
      var _this$array_2;

      for (var _len2 = arguments.length, tokens = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        tokens[_key2] = arguments[_key2];
      }

      var oldValue = this.value;

      (_this$array_2 = this.array_).splice.apply(_this$array_2, [0, this.array_.length].concat(new Set(this.array_.filter(function (token) {
        return !tokens.includes(token);
      }))));

      this.mutationCompleteHandler_(oldValue, this.value);
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/replace
     * @param token
     * @param newToken
     */


    _proto.replace = function replace(token, newToken) {
      var _this$array_3;

      if (!this.array_.includes(token)) {
        return;
      }

      var oldValue = this.value;
      var set = new Set(this.array_);

      if (token !== newToken) {
        set.delete(token);

        if (newToken !== '') {
          set.add(newToken);
        }
      }

      (_this$array_3 = this.array_).splice.apply(_this$array_3, [0, this.array_.length].concat(set));

      this.mutationCompleteHandler_(oldValue, this.value);
    };
    /**
     * Adds or removes a token based on its presence in the token list.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
     * @param token string to add or remove from the token list
     * @param force changes toggle into a one way-only operation. true => token added. false => token removed.
     * @return true if the token is in the list following mutation, false if not.
     */


    _proto.toggle = function toggle(token, force) {
      if (!this.array_.includes(token)) {
        if (force !== false) {
          // Note, this will add the token if force is undefined (not passed into the method), or true.
          this.add(token);
        }

        return true;
      } else if (force !== true) {
        // Note, this will remove the token if force is undefined (not passed into the method), or false.
        this.remove(token);
        return false;
      }

      return true;
    };
    /**
     * Report tokenList mutations to MutationObserver.
     * @param oldValue value before mutation
     * @param value value after mutation
     * @private
     */


    _proto.mutationCompleteHandler_ = function mutationCompleteHandler_(oldValue, value) {
      this.storeAttributeMethod_(null, this.attributeName_, value);
      mutate({
        type: 0
        /* ATTRIBUTES */
        ,
        target: this.element_,
        attributeName: this.attributeName_,
        value: value,
        oldValue: oldValue
      });
    };

    _createClass(DOMTokenList, [{
      key: "value",
      get: function get() {
        return this.array_.join(' ');
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/length
       * @return integer representing the number of objects stored in the object.
       */
      ,

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/value
       * @param collection String of values space delimited to replace the current DOMTokenList with.
       */
      set: function set(collection) {
        var _this$array_4;

        var oldValue = this.value;
        var newValue = collection.trim(); // Replace current tokens with new tokens.

        (_this$array_4 = this.array_).splice.apply(_this$array_4, [0, this.array_.length].concat(newValue !== '' ? newValue.split(/\s+/) : ''));

        this.mutationCompleteHandler_(oldValue, newValue);
      }
    }, {
      key: "length",
      get: function get() {
        return this.array_.length;
      }
    }]);

    return DOMTokenList;
  }();

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
  var toString = function toString(attributes) {
    return attributes.map(function (_ref) {
      var name = _ref.name,
          value = _ref.value;
      return keyValueString(name, value);
    }).join(' ');
  };
  var matchPredicate = function matchPredicate(namespaceURI, name) {
    return function (attr) {
      return attr.namespaceURI === namespaceURI && attr.name === name;
    };
  };

  var CharacterData =
  /*#__PURE__*/
  function (_Node) {
    _inheritsLoose(CharacterData, _Node);

    function CharacterData(data, nodeType, nodeName) {
      var _this;

      _this = _Node.call(this, nodeType, nodeName) || this;
      _this._data_ = data;
      return _this;
    } // Unimplemented Methods
    // NonDocumentTypeChildNode.nextElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/nextElementSibling
    // NonDocumentTypeChildNode.previousElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/previousElementSibling
    // CharacterData.appendData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/appendData
    // CharacterData.deleteData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/deleteData
    // CharacterData.insertData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/insertData
    // CharacterData.replaceData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/replaceData
    // CharacterData.substringData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/substringData

    /**
     * @return Returns the string contained in private CharacterData.data
     */


    _createClass(CharacterData, [{
      key: "data",
      get: function get() {
        return this._data_;
      }
      /**
       * @param value string value to store as CharacterData.data.
       */
      ,
      set: function set(value) {
        var oldValue = this.data;
        this._data_ = value;
        mutate({
          target: this,
          type: 1
          /* CHARACTER_DATA */
          ,
          value: value,
          oldValue: oldValue
        });
      }
      /**
       * @return Returns the size of the string contained in CharacterData.data
       */

    }, {
      key: "length",
      get: function get() {
        return this._data_.length;
      }
      /**
       * @return Returns the string contained in CharacterData.data
       */

    }, {
      key: "nodeValue",
      get: function get() {
        return this._data_;
      }
      /**
       * @param value string value to store as CharacterData.data.
       */
      ,
      set: function set(value) {
        this.data = value;
      }
    }]);

    return CharacterData;
  }(Node);

  var Text =
  /*#__PURE__*/
  function (_CharacterData) {
    _inheritsLoose(Text, _CharacterData);

    function Text(data) {
      var _this$_transferredFor, _this$_creationFormat;

      var _this;

      _this = _CharacterData.call(this, data, 3
      /* TEXT_NODE */
      , '#text') || this;
      _this._transferredFormat_ = (_this$_transferredFor = {}, _this$_transferredFor[7
      /* _index_ */
      ] = _this._index_, _this$_transferredFor[8
      /* transferred */
      ] = 1, _this$_transferredFor);
      _this._creationFormat_ = (_this$_creationFormat = {}, _this$_creationFormat[7
      /* _index_ */
      ] = _this._index_, _this$_creationFormat[8
      /* transferred */
      ] = 0, _this$_creationFormat[0
      /* nodeType */
      ] =
      /* FALSE */
      3, _this$_creationFormat[1
      /* nodeName */
      ] = store$1('#text'), _this$_creationFormat[5
      /* textContent */
      ] = store$1(_this.data), _this$_creationFormat);
      return _this;
    } // Unimplemented Properties
    // Text.isElementContentWhitespace – https://developer.mozilla.org/en-US/docs/Web/API/Text/isElementContentWhitespace
    // Text.wholeText – https://developer.mozilla.org/en-US/docs/Web/API/Text/wholeText
    // Text.assignedSlot – https://developer.mozilla.org/en-US/docs/Web/API/Text/assignedSlot


    var _proto = Text.prototype;

    _proto.hydrate = function hydrate() {
      return this._creationFormat_;
    };
    /**
     * textContent getter, retrieves underlying CharacterData data.
     * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
     */


    /**
     * Breaks Text node into two nodes at the specified offset, keeping both nodes in the tree as siblings.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Text/splitText
     * @param offset number position to split text at.
     * @return Text Node after the offset.
     */
    _proto.splitText = function splitText(offset) {
      var remainderTextNode = new Text(this.data.slice(offset, this.data.length));
      var parentNode = this.parentNode;
      this.nodeValue = this.data.slice(0, offset);

      if (parentNode !== null) {
        // When this node is attached to the DOM, the remainder text needs to be inserted directly after.
        var parentChildNodes = parentNode.childNodes;
        var insertBeforePosition = parentChildNodes.indexOf(this) + 1;
        var insertBeforeNode = parentChildNodes.length >= insertBeforePosition ? parentChildNodes[insertBeforePosition] : null;
        return parentNode.insertBefore(remainderTextNode, insertBeforeNode);
      }

      return remainderTextNode;
    };

    _createClass(Text, [{
      key: "textContent",
      get: function get() {
        return this.data;
      }
      /**
       * textContent setter, mutates underlying CharacterData data.
       * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
       * @param value new value
       */
      ,
      set: function set(value) {
        // Mutation Observation is performed by CharacterData.
        this.nodeValue = value;
      }
    }]);

    return Text;
  }(CharacterData);

  var hyphenateKey = function hyphenateKey(key) {
    return toLower(key.replace(/(webkit|ms|moz|khtml)/g, '-$1').replace(/([a-zA-Z])(?=[A-Z])/g, '$1-'));
  };

  var appendKeys = function appendKeys(keys) {
    var keysToAppend = keys.filter(function (key) {
      return !CSSStyleDeclaration.prototype.hasOwnProperty(key);
    });

    if (keysToAppend.length <= 0) {
      return;
    }

    var previousPrototypeLength = CSSStyleDeclaration.prototype.length || 0;

    if (previousPrototypeLength !== 0) {
      CSSStyleDeclaration.prototype.length = previousPrototypeLength + keysToAppend.length;
    } else {
      Object.defineProperty(CSSStyleDeclaration.prototype, 'length', {
        configurable: true,
        writable: true,
        value: keysToAppend.length
      });
    }

    keysToAppend.forEach(function (key, index) {
      var _Object$definePropert;

      var hyphenatedKey = hyphenateKey(key);
      CSSStyleDeclaration.prototype[index + previousPrototypeLength] = hyphenatedKey;
      Object.defineProperties(CSSStyleDeclaration.prototype, (_Object$definePropert = {}, _Object$definePropert[key] = {
        get: function get() {
          return this.getPropertyValue(hyphenatedKey);
        },
        set: function set(value) {
          this.setProperty(hyphenatedKey, value);
        }
      }, _Object$definePropert));
    });
  };
  var CSSStyleDeclaration =
  /*#__PURE__*/
  function () {
    function CSSStyleDeclaration(element) {
      var _this = this;

      this.properties_ = {};
      this.storeAttributeMethod_ = element.storeAttributeNS_.bind(element);
      this.element_ = element;

      if (element && element.propertyBackedAttributes_) {
        element.propertyBackedAttributes_.style = [function () {
          return _this.cssText;
        }, function (value) {
          return _this.cssText = value;
        }];
      }
    }
    /**
     * Retrieve the value for a given property key.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue
     * @param key the name of the property to retrieve the value for.
     * @return value stored for the provided key.
     */


    var _proto = CSSStyleDeclaration.prototype;

    _proto.getPropertyValue = function getPropertyValue(key) {
      return this.properties_[key] || '';
    };
    /**
     * Remove a value for a given property key.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty
     * @param key the name of the property to retrieve the value for.
     * @return previously stored value for the provided key.
     */


    _proto.removeProperty = function removeProperty(key) {
      var oldValue = this.getPropertyValue(key);
      this.properties_[key] = null;
      this.mutationCompleteHandler_(this.cssText);
      return oldValue;
    };
    /**
     * Stores a given value for the provided key.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty
     * @param key modify this key
     * @param value store this value
     */


    _proto.setProperty = function setProperty(key, value) {
      this.properties_[key] = value;
      this.mutationCompleteHandler_(this.cssText);
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssText
     * @return css text string representing known and valid style declarations.
     */


    /**
     * Report CSSStyleDeclaration mutations to MutationObserver.
     * @param value value after mutation
     * @private
     */
    _proto.mutationCompleteHandler_ = function mutationCompleteHandler_(value) {
      var oldValue = this.storeAttributeMethod_(null, 'style', value);
      mutate({
        type: 0
        /* ATTRIBUTES */
        ,
        target: this.element_,
        attributeName: 'style',
        value: value,
        oldValue: oldValue
      });
    };

    _createClass(CSSStyleDeclaration, [{
      key: "cssText",
      get: function get() {
        var value;
        var returnValue = '';

        for (var key in this.properties_) {
          if ((value = this.getPropertyValue(key)) !== '') {
            returnValue += key + ": " + value + "; ";
          }
        }

        return returnValue.trim();
      }
      /**
       * Replace all style declarations with new values parsed from a cssText string.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssText
       * @param value css text string to parse and store
       */
      ,
      set: function set(value) {
        this.properties_ = {};
        var values = value.split(/[:;]/);
        var length = values.length;

        for (var index = 0; index + 1 < length; index += 2) {
          this.properties_[toLower(values[index].trim())] = values[index + 1].trim();
        }

        this.mutationCompleteHandler_(this.cssText);
      }
    }]);

    return CSSStyleDeclaration;
  }();

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
  // To future authors: It would be great if we could enforce that elements are not modified by a ConditionPredicate.
  var tagNameConditionPredicate = function tagNameConditionPredicate(tagNames) {
    return function (element) {
      return tagNames.includes(element.tagName);
    };
  };
  var matchChildrenElements = function matchChildrenElements(element, conditionPredicate) {
    var matchingElements = [];
    element.children.forEach(function (child) {
      if (conditionPredicate(child)) {
        matchingElements.push(child);
      }

      matchingElements.push.apply(matchingElements, matchChildrenElements(child, conditionPredicate));
    });
    return matchingElements;
  };
  var matchChildElement = function matchChildElement(element, conditionPredicate) {
    var returnValue = null;
    element.children.some(function (child) {
      if (conditionPredicate(child)) {
        returnValue = child;
        return true;
      }

      var grandChildMatch = matchChildElement(child, conditionPredicate);

      if (grandChildMatch !== null) {
        returnValue = grandChildMatch;
        return true;
      }

      return false;
    });
    return returnValue;
  };
  var matchNearestParent = function matchNearestParent(element, conditionPredicate) {
    while (element = element.parentNode) {
      if (conditionPredicate(element)) {
        return element;
      }
    }

    return null;
  };

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
  var reflectProperties = function reflectProperties(properties, defineOn) {
    properties.forEach(function (pair) {
      var _loop = function _loop(key) {
        var defaultValue = pair[key][0];
        var propertyIsNumber = typeof defaultValue === 'number';
        var propertyIsBoolean = typeof defaultValue === 'boolean';
        var attributeKey = pair[key][1] || toLower(key);
        Object.defineProperty(defineOn.prototype, key, {
          enumerable: true,
          get: function get() {
            var storedAttribute = this.getAttribute(attributeKey);

            if (propertyIsBoolean) {
              return storedAttribute !== null ? storedAttribute === 'true' : defaultValue;
            }

            var castableValue = storedAttribute || defaultValue;
            return propertyIsNumber ? Number(castableValue) : String(castableValue);
          },
          set: function set(value) {
            this.setAttribute(attributeKey, String(value));
          }
        });
      };

      for (var key in pair) {
        _loop(key);
      }
    });
  };

  var isElementPredicate = function isElementPredicate(node) {
    return node.nodeType === 1;
  }
  /* ELEMENT_NODE */
  ;

  var NODE_NAME_MAPPING = {};
  function registerSubclass(nodeName, subclass) {
    NODE_NAME_MAPPING[nodeName] = subclass;
  }
  var Element =
  /*#__PURE__*/
  function (_Node) {
    _inheritsLoose(Element, _Node);

    function Element(nodeType, nodeName, namespaceURI) {
      var _this$_transferredFor, _this$_creationFormat;

      var _this;

      _this = _Node.call(this, nodeType, nodeName) || this;
      _this.attributes = [];
      _this.propertyBackedAttributes_ = {};
      _this.classList = new DOMTokenList(Element, _assertThisInitialized(_assertThisInitialized(_this)), 'class', 'classList', 'className');
      _this.style = new CSSStyleDeclaration(_assertThisInitialized(_assertThisInitialized(_this)));
      _this.namespaceURI = namespaceURI;
      _this._transferredFormat_ = (_this$_transferredFor = {}, _this$_transferredFor[7
      /* _index_ */
      ] = _this._index_, _this$_transferredFor[8
      /* transferred */
      ] = 1, _this$_transferredFor);
      _this._creationFormat_ = (_this$_creationFormat = {}, _this$_creationFormat[7
      /* _index_ */
      ] = _this._index_, _this$_creationFormat[8
      /* transferred */
      ] = 0, _this$_creationFormat[0
      /* nodeType */
      ] = _this.nodeType, _this$_creationFormat[1
      /* nodeName */
      ] = store$1(_this.nodeName), _this$_creationFormat[6
      /* namespaceURI */
      ] = _this.namespaceURI === null ? undefined : store$1(_this.namespaceURI), _this$_creationFormat);
      return _this;
    }
    /**
     * When hydrating the tree, we need to send HydrateableNode representations
     * for the main thread to process and store items from for future modifications.
     */


    var _proto = Element.prototype;

    _proto.hydrate = function hydrate() {
      var _ref, _ref2;

      return Object.assign({}, this._creationFormat_, this.childNodes.length > 0 ? (_ref = {}, _ref[4
      /* childNodes */
      ] = this.childNodes.map(function (node) {
        return node.hydrate();
      }), _ref) : {}, this.attributes.length > 0 ? (_ref2 = {}, _ref2[2
      /* attributes */
      ] = this.attributes.map(function (attribute) {
        return [store$1(attribute.namespaceURI || 'null'), store$1(attribute.name), store$1(attribute.value)];
      }), _ref2) : {});
    }; // Unimplemented properties
    // Element.clientHeight – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
    // Element.clientLeft – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft
    // Element.clientTop – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
    // Element.clientWidth – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
    // Element.querySelector – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
    // Element.querySelectorAll – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
    // set Element.innerHTML – https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
    // Element.localName – https://developer.mozilla.org/en-US/docs/Web/API/Element/localName
    // NonDocumentTypeChildNode.nextElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/nextElementSibling
    // Element.prefix – https://developer.mozilla.org/en-US/docs/Web/API/Element/prefix
    // NonDocummentTypeChildNode.previousElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/previousElementSibling
    // Element.scrollHeight – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
    // Element.scrollLeft – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
    // Element.scrollLeftMax – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeftMax
    // Element.scrollTop – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
    // Element.scrollTopMax – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax
    // Element.scrollWidth – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth
    // Element.shadowRoot – !! CustomElements – https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot
    // Element.slot – !! CustomElements – https://developer.mozilla.org/en-US/docs/Web/API/Element/slot
    // Element.tabStop – https://developer.mozilla.org/en-US/docs/Web/API/Element/tabStop
    // Element.undoManager – https://developer.mozilla.org/en-US/docs/Web/API/Element/undoManager
    // Element.undoScope – https://developer.mozilla.org/en-US/docs/Web/API/Element/undoScope
    // Unimplemented Methods
    // Element.attachShadow() – !! CustomElements – https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
    // Element.animate() – https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
    // Element.closest() – https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
    // Element.getAttributeNames() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames
    // Element.getBoundingClientRect() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    // Element.getClientRects() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects
    // Element.getElementsByTagNameNS() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagNameNS
    // Element.insertAdjacentElement() – https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
    // Element.insertAdjacentHTML() – https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
    // Element.insertAdjacentText() – https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentText
    // Element.matches() – https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
    // Element.querySelector() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
    // Element.querySelectorAll() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
    // Element.releasePointerCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/releasePointerCapture
    // Element.requestFullscreen() – https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
    // Element.requestPointerLock() – https://developer.mozilla.org/en-US/docs/Web/API/Element/requestPointerLock
    // Element.scrollIntoView() – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    // Element.setCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/setCapture
    // Element.setPointerCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
    // Mixins not implemented
    // Slotable.assignedSlot – https://developer.mozilla.org/en-US/docs/Web/API/Slotable/assignedSlot

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
     * @return string representation of serialized HTML describing the Element and its descendants.
     */


    /**
     * Sets the value of an attribute on this element using a null namespace.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
     * @param name attribute name
     * @param value attribute value
     */
    _proto.setAttribute = function setAttribute(name, value) {
      this.setAttributeNS(null, name, value);
    };
    /**
     * Get the value of an attribute on this Element with the null namespace.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
     * @param name attribute name
     * @return value of a specified attribute on the element, or null if the attribute doesn't exist.
     */


    _proto.getAttribute = function getAttribute(name) {
      return this.getAttributeNS(null, name);
    };
    /**
     * Remove an attribute from this element in the null namespace.
     *
     * Method returns void, so it is not chainable.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
     * @param name attribute name
     */


    _proto.removeAttribute = function removeAttribute(name) {
      this.removeAttributeNS(null, name);
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute
     * @param name attribute name
     * @return Boolean indicating if the element has the specified attribute.
     */


    _proto.hasAttribute = function hasAttribute(name) {
      return this.hasAttributeNS(null, name);
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributes
     * @return Boolean indicating if the element has any attributes.
     */


    _proto.hasAttributes = function hasAttributes() {
      return this.attributes.length > 0;
    };
    /**
     * Sets the value of an attribute on this Element with the provided namespace.
     *
     * If the attribute already exists, the value is updated; otherwise a new attribute is added with the specified name and value.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttributeNS
     * @param namespaceURI
     * @param name attribute name
     * @param value attribute value
     */


    _proto.setAttributeNS = function setAttributeNS(namespaceURI, name, value) {
      if (this.propertyBackedAttributes_[name] !== undefined) {
        if (!this.attributes.find(matchPredicate(namespaceURI, name))) {
          this.attributes.push({
            namespaceURI: namespaceURI,
            name: name,
            value: value
          });
        }

        this.propertyBackedAttributes_[name][1](value);
        return;
      }

      var oldValue = this.storeAttributeNS_(namespaceURI, name, value);
      mutate({
        type: 0
        /* ATTRIBUTES */
        ,
        target: this,
        attributeName: name,
        attributeNamespace: namespaceURI,
        value: value,
        oldValue: oldValue
      });
    };

    _proto.storeAttributeNS_ = function storeAttributeNS_(namespaceURI, name, value) {
      var attr = this.attributes.find(matchPredicate(namespaceURI, name));
      var oldValue = attr && attr.value || '';

      if (attr) {
        attr.value = value;
      } else {
        this.attributes.push({
          namespaceURI: namespaceURI,
          name: name,
          value: value
        });
      }

      return oldValue;
    };
    /**
     * Get the value of an attribute on this Element with the specified namespace.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS
     * @param namespaceURI attribute namespace
     * @param name attribute name
     * @return value of a specified attribute on the element, or null if the attribute doesn't exist.
     */


    _proto.getAttributeNS = function getAttributeNS(namespaceURI, name) {
      var attr = this.attributes.find(matchPredicate(namespaceURI, name));

      if (attr) {
        return this.propertyBackedAttributes_[name] !== undefined ? this.propertyBackedAttributes_[name][0]() : attr.value;
      }

      return null;
    };
    /**
     * Remove an attribute from this element in the specified namespace.
     *
     * Method returns void, so it is not chainable.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
     * @param namespaceURI attribute namespace
     * @param name attribute name
     */


    _proto.removeAttributeNS = function removeAttributeNS(namespaceURI, name) {
      var index = this.attributes.findIndex(matchPredicate(namespaceURI, name));

      if (index >= 0) {
        var oldValue = this.attributes[index].value;
        this.attributes.splice(index, 1);
        mutate({
          type: 0
          /* ATTRIBUTES */
          ,
          target: this,
          attributeName: name,
          attributeNamespace: namespaceURI,
          oldValue: oldValue
        });
      }
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributeNS
     * @param namespaceURI attribute namespace
     * @param name attribute name
     * @return Boolean indicating if the element has the specified attribute.
     */


    _proto.hasAttributeNS = function hasAttributeNS(namespaceURI, name) {
      return this.attributes.some(matchPredicate(namespaceURI, name));
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
     * @param names contains one more more classnames to match on. Multiples are space seperated, indicating an AND operation.
     * @return Element array with matching classnames
     */


    _proto.getElementsByClassName = function getElementsByClassName(names) {
      var inputClassList = names.split(' '); // TODO(KB) – Compare performance of [].some(value => DOMTokenList.contains(value)) and regex.
      // const classRegex = new RegExp(classNames.split(' ').map(name => `(?=.*${name})`).join(''));

      return matchChildrenElements(this, function (element) {
        return inputClassList.some(function (inputClassName) {
          return element.classList.contains(inputClassName);
        });
      });
    };
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
     * @param tagName the qualified name to look for. The special string "*" represents all elements.
     * @return Element array with matching tagnames
     */


    _proto.getElementsByTagName = function getElementsByTagName(tagName) {
      return matchChildrenElements(this, tagName === '*' ? function (_) {
        return true;
      } : function (element) {
        return element.tagName === tagName;
      });
    };

    _createClass(Element, [{
      key: "outerHTML",
      get: function get() {
        return "<" + [this.nodeName, toString(this.attributes)].join(' ').trim() + ">" + this.innerHTML + "</" + this.nodeName + ">";
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
       * @return string representation of serialized HTML describing the Element's descendants.
       */

    }, {
      key: "innerHTML",
      get: function get() {
        var childNodes = this.childNodes;

        if (childNodes.length) {
          return childNodes.map(function (child) {
            return child.nodeType === 1
            /* ELEMENT_NODE */
            ? child.outerHTML : child.textContent;
          }).join('');
        }

        return '';
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
       * @param text new text replacing all childNodes content.
       */

    }, {
      key: "textContent",
      set: function set(text) {
        // TODO(KB): Investigate removing all children in a single .splice to childNodes.
        this.childNodes.forEach(function (childNode) {
          return childNode.remove();
        });
        this.appendChild(new Text(text));
      }
      /**
       * Getter returning the text representation of Element.childNodes.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
       * @return text from all childNodes.
       */
      ,
      get: function get() {
        return _Node.prototype.textContent;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
       * @return string tag name (i.e 'div')
       */

    }, {
      key: "tagName",
      get: function get() {
        return this.nodeName;
      }
      /**
       * Getter returning children of an Element that are Elements themselves.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
       * @return Element objects that are children of this ParentNode, omitting all of its non-element nodes.
       */

    }, {
      key: "children",
      get: function get() {
        return this.childNodes.filter(isElementPredicate);
      }
      /**
       * Getter returning the number of child elements of a Element.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/childElementCount
       * @return number of child elements of the given Element.
       */

    }, {
      key: "childElementCount",
      get: function get() {
        return this.children.length;
      }
      /**
       * Getter returning the first Element in Element.childNodes.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/firstElementChild
       * @return first childNode that is also an element.
       */

    }, {
      key: "firstElementChild",
      get: function get() {
        return this.childNodes.find(isElementPredicate) || null;
      }
      /**
       * Getter returning the last Element in Element.childNodes.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/lastElementChild
       * @return first childNode that is also an element.
       */

    }, {
      key: "lastElementChild",
      get: function get() {
        var children = this.children;
        return children[children.length - 1] || null;
      }
    }]);

    return Element;
  }(Node);
  reflectProperties([{
    id: ['']
  }], Element);

  var HTMLElement =
  /*#__PURE__*/
  function (_Element) {
    _inheritsLoose(HTMLElement, _Element);

    function HTMLElement() {
      return _Element.apply(this, arguments) || this;
    }

    _createClass(HTMLElement, [{
      key: "form",

      /**
       * Find the nearest parent form element.
       * Implemented in HTMLElement since so many extensions of HTMLElement repeat this functionality. This is not to spec.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement
       * @return nearest parent form element.
       */
      get: function get() {
        return matchNearestParent(this, tagNameConditionPredicate(['form']));
      }
    }]);

    return HTMLElement;
  }(Element); // Reflected properties
  // HTMLElement.accessKey => string, reflected attribute
  // HTMLElement.contentEditable => string, reflected attribute
  // HTMLElement.dir => string, reflected attribute
  // HTMLElement.lang => string, reflected attribute
  // HTMLElement.title => string, reflected attribute
  // HTMLElement.draggable => boolean, reflected attribute
  // HTMLElement.hidden => boolean, reflected attribute
  // HTMLElement.noModule => boolean, reflected attribute
  // HTMLElement.spellcheck => boolean, reflected attribute
  // HTMLElement.translate => boolean, reflected attribute

  reflectProperties([{
    accessKey: ['']
  }, {
    contentEditable: ['inherit']
  }, {
    dir: ['']
  }, {
    lang: ['']
  }, {
    title: ['']
  }, {
    draggable: [false]
  }, {
    hidden: [false]
  }, {
    noModule: [false]
  }, {
    spellcheck: [true]
  }, {
    translate: [true]
  }], HTMLElement); // Properties
  // HTMLElement.accessKeyLabel => string, readonly value of "accessKey"
  // HTMLElement.isContentEditable => boolean, readonly value of contentEditable
  // HTMLElement.nonce => string, NOT REFLECTED
  // HTMLElement.tabIndex => number, reflected attribute
  // Layout Properties (TBD)
  // HTMLElement.offsetHeight => double, readonly
  // HTMLElement.offsetLeft => double, readonly
  // HTMLElement.offsetParent => Element
  // HTMLElement.offsetTop => double, readonly
  // HTMLElement.offsetWidth => double, readonly
  // Unimplemented Properties
  // HTMLElement.contextMenu => HTMLElement
  // HTMLElement.dataset => Map<string (get/set), string>
  // HTMLElement.dropzone => DOMSettableTokenList (DOMTokenList)
  // HTMLElement.inert => boolean, reflected
  // HTMLElement.itemScope => boolean
  // HTMLElement.itemType => DOMSettableTokenList (DOMTokenList)
  // HTMLElement.itemId => string
  // HTMLElement.itemRef => DOMSettableTokenList (DOMTokenList)
  // HTMLElement.itemProp => DOMSettableTokenList (DOMTokenList)
  // HTMLElement.itemValue => object
  // HTMLElement.properties => HTMLPropertiesCollection, readonly

  var HTMLAnchorElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLAnchorElement, _HTMLElement);

    function HTMLAnchorElement() {
      var _this;

      _this = _HTMLElement.apply(this, arguments) || this;
      _this.relList = new DOMTokenList(HTMLAnchorElement, _assertThisInitialized(_assertThisInitialized(_this)), 'rel', 'relList', 'rel');
      return _this;
    }
    /**
     * Returns the href property/attribute value
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/toString
     * @return string href attached to HTMLAnchorElement
     */


    var _proto = HTMLAnchorElement.prototype;

    _proto.toString = function toString() {
      return this.href;
    };
    /**
     * A Synonym for the Node.textContent property getter.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
     * @return value of text node direct child of this Element.
     */


    _createClass(HTMLAnchorElement, [{
      key: "text",
      get: function get() {
        return this.textContent;
      }
      /**
       * A Synonym for the Node.textContent property setter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
       * @param text replacement for all current childNodes.
       */
      ,
      set: function set(text) {
        this.textContent = text;
      }
    }]);

    return HTMLAnchorElement;
  }(HTMLElement);
  registerSubclass('a', HTMLAnchorElement); // Reflected properties, strings.
  // HTMLAnchorElement.href => string, reflected attribute
  // HTMLAnchorElement.hreflang => string, reflected attribute
  // HTMLAnchorElement.media => string, reflected attribute
  // HTMLAnchorElement.target => string, reflected attribute
  // HTMLAnchorElement.type => string, reflected attribute

  reflectProperties([{
    href: ['']
  }, {
    hreflang: ['']
  }, {
    media: ['']
  }, {
    target: ['']
  }, {
    type: ['']
  }], HTMLAnchorElement); // Unimplemented
  // HTMLAnchorElement.download => string, reflected attribute
  // HTMLAnchorElement.type => Is a DOMString that reflects the type HTML attribute, indicating the MIME type of the linked resource.
  // Unimplemented URL parse of href attribute due to IE11 compatibility and low usage.
  // Note: Implementation doable using a private url property

  /*
    class {
      private url: URL | null = null;

      constructor(...) {
        // Element.getAttribute('href') => Element.href.
        Object.assign(this.propertyBackedAttributes_, {
          href: this.href,
        });
      }

      get href(): string {
        return this.url ? this.url.href : '';
      }
      set href(url: string) {
        this.url = new URL(url);
        this.setAttribute('href', this.url.href);
      }
    }
  */
  // HTMLAnchorElement.host => string
  // HTMLAnchorElement.hostname => string
  // HTMLAnchorElement.protocol => string
  // HTMLAnchorElement.pathname => string
  // HTMLAnchorElement.search => string
  // HTMLAnchorElement.hash => string
  // HTMLAnchorElement.username => string
  // HTMLAnchorElement.password => string
  // HTMLAnchorElement.origin => string, readonly (getter no setter)

  var HTMLButtonElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLButtonElement, _HTMLElement);

    function HTMLButtonElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLButtonElement;
  }(HTMLElement);
  registerSubclass('button', HTMLButtonElement); // Reflected properties, strings.
  // HTMLButtonElement.formAction => string, reflected attribute
  // HTMLButtonElement.formEnctype => string, reflected attribute
  // HTMLButtonElement.formMethod => string, reflected attribute
  // HTMLButtonElement.formTarget => string, reflected attribute
  // HTMLButtonElement.name => string, reflected attribute
  // HTMLButtonElement.type => string, reflected attribute (default submit)
  // HTMLButtonElement.value => string, reflected attribute
  // HTMLButtonElement.autofocus => boolean, reflected attribute
  // HTMLButtonElement.disabled => boolean, reflected attribute

  reflectProperties([{
    formAction: ['']
  }, {
    formEnctype: ['']
  }, {
    formMethod: ['']
  }, {
    formTarget: ['']
  }, {
    name: ['']
  }, {
    type: ['submit']
  }, {
    value: ['']
  }, {
    autofocus: [false]
  }, {
    disabled: [false]
  }], HTMLButtonElement); // Not reflected
  // HTMLButtonElement.formNoValidate => boolean
  // HTMLButtonElement.validity => ValidityState, readonly
  // Unimplemented
  // HTMLButtonElement.form => HTMLFormElement | null, readonly
  // HTMLButtonElement.labels => Array<HTMLLabelElement>, readonly
  // HTMLButtonElement.menu => HTMLMenuElement
  // HTMLButtonElement.willValidate => boolean, readonly
  // HTMLButtonElement.validationMessage => string, readonly

  var HTMLDataElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLDataElement, _HTMLElement);

    function HTMLDataElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLDataElement;
  }(HTMLElement);
  registerSubclass('data', HTMLDataElement); // Reflected properties, strings.
  // HTMLEmbedElement.value => string, reflected attribute

  reflectProperties([{
    value: ['']
  }], HTMLDataElement);

  var HTMLEmbedElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLEmbedElement, _HTMLElement);

    function HTMLEmbedElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLEmbedElement;
  }(HTMLElement);
  registerSubclass('embed', HTMLEmbedElement); // Reflected properties, strings.
  // HTMLEmbedElement.height => string, reflected attribute
  // HTMLEmbedElement.src => string, reflected attribute
  // HTMLEmbedElement.type => string, reflected attribute
  // HTMLEmbedElement.width => string, reflected attribute

  reflectProperties([{
    height: ['']
  }, {
    src: ['']
  }, {
    type: ['']
  }, {
    width: ['']
  }], HTMLEmbedElement); // Unimplemented
  // HTMLEmbedElement.align => string, not reflected
  // HTMLEmbedElement.name => string, not reflected

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
  var MATCHING_CHILD_ELEMENT_TAGNAMES = 'button fieldset input object output select textarea'.split(' ');
  /**
   * The HTMLFormControlsCollection interface represents a collection of HTML form control elements.
   * It is mixedin to both HTMLFormElement and HTMLFieldSetElement.
   */

  var HTMLFormControlsCollectionMixin = function HTMLFormControlsCollectionMixin(defineOn) {
    Object.defineProperty(defineOn.prototype, 'elements', {
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormControlsCollection
       * @return Element array matching children of specific tagnames.
       */
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(MATCHING_CHILD_ELEMENT_TAGNAMES));
      }
    });
  };

  var HTMLFieldSetElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLFieldSetElement, _HTMLElement);

    function HTMLFieldSetElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    _createClass(HTMLFieldSetElement, [{
      key: "type",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement
       * @return hardcoded string 'fieldset'
       */
      get: function get() {
        return this.tagName;
      }
    }]);

    return HTMLFieldSetElement;
  }(HTMLElement);
  registerSubclass('fieldset', HTMLFieldSetElement);
  HTMLFormControlsCollectionMixin(HTMLFieldSetElement); // Reflected properties
  // HTMLFieldSetElement.name => string, reflected attribute
  // HTMLFieldSetElement.disabled => boolean, reflected attribute

  reflectProperties([{
    name: ['']
  }, {
    disabled: [false]
  }], HTMLFieldSetElement); // Unimplemented properties
  // HTMLFieldSetElement.validity
  // HTMLFieldSetElement.willValidate
  // HTMLFieldSetElement.validationMessage

  var HTMLFormElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLFormElement, _HTMLElement);

    function HTMLFormElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    _createClass(HTMLFormElement, [{
      key: "length",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/length
       * @return number of controls in the form
       */
      get: function get() {
        return this.elements.length;
      }
    }]);

    return HTMLFormElement;
  }(HTMLElement);
  registerSubclass('form', HTMLFormElement);
  HTMLFormControlsCollectionMixin(HTMLFormElement); // Reflected properties
  // HTMLFormElement.name => string, reflected attribute
  // HTMLFormElement.method => string, reflected attribute
  // HTMLFormElement.target => string, reflected attribute
  // HTMLFormElement.action => string, reflected attribute
  // HTMLFormElement.enctype => string, reflected attribute
  // HTMLFormElement.acceptCharset => string, reflected attribute
  // HTMLFormElement.autocomplete => string, reflected attribute
  // HTMLFormElement.autocapitalize => string, reflected attribute

  reflectProperties([{
    name: ['']
  }, {
    method: ['get']
  }, {
    target: ['']
  }, {
    action: ['']
  }, {
    enctype: ['application/x-www-form-urlencoded']
  }, {
    acceptCharset: ['', 'accept-charset']
  }, {
    autocomplete: ['on']
  }, {
    autocapitalize: ['sentences']
  }], HTMLFormElement); // Unimplemented properties
  // HTMLFormElement.encoding => string, reflected attribute
  // HTMLFormElement.noValidate => boolean, reflected attribute

  /*
  Unimplemented, TBD:

  Named inputs are added to their owner form instance as properties, and can overwrite native properties
  if they share the same name (eg a form with an input named action will have its action property return
  that input instead of the form's action HTML attribute).
  */

  var HTMLIFrameElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLIFrameElement, _HTMLElement);

    function HTMLIFrameElement() {
      var _this;

      _this = _HTMLElement.apply(this, arguments) || this; // HTMLIFrameElement.sandbox, DOMTokenList, reflected attribute

      _this.sandbox = new DOMTokenList(HTMLIFrameElement, _assertThisInitialized(_assertThisInitialized(_this)), 'sandbox', null, null);
      return _this;
    }

    return HTMLIFrameElement;
  }(HTMLElement);
  registerSubclass('iframe', HTMLIFrameElement); // Reflected properties
  // HTMLIFrameElement.allow => string, reflected attribute
  // HTMLIFrameElement.allowFullscreen => boolean, reflected attribute
  // HTMLIFrameElement.csp => string, reflected attribute
  // HTMLIFrameElement.height => string, reflected attribute
  // HTMLIFrameElement.name => string, reflected attribute
  // HTMLIFrameElement.referrerPolicy => string, reflected attribute
  // HTMLIFrameElement.src => string, reflected attribute
  // HTMLIFrameElement.srcdoc => string, reflected attribute
  // HTMLIFrameElement.width => string, reflected attribute

  reflectProperties([{
    allow: ['']
  }, {
    allowFullscreen: [false]
  }, {
    csp: ['']
  }, {
    height: ['']
  }, {
    name: ['']
  }, {
    referrerPolicy: ['']
  }, {
    src: ['']
  }, {
    srcdoc: ['']
  }, {
    width: ['']
  }], HTMLIFrameElement); // Unimplemented Properties
  // HTMLIFrameElement.allowPaymentRequest => boolean, reflected attribute
  // HTMLIFrameElement.contentDocument => Document, read only (active document in the inline frame's nested browsing context)
  // HTMLIFrameElement.contentWindow => WindowProxy, read only (window proxy for the nested browsing context)

  var HTMLImageElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLImageElement, _HTMLElement);

    function HTMLImageElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLImageElement;
  }(HTMLElement);
  registerSubclass('img', HTMLImageElement); // Reflected Properties
  // HTMLImageElement.alt => string, reflected attribute
  // HTMLImageElement.crossOrigin => string, reflected attribute
  // HTMLImageElement.height => number, reflected attribute
  // HTMLImageElement.isMap => boolean, reflected attribute
  // HTMLImageElement.referrerPolicy => string, reflected attribute
  // HTMLImageElement.src => string, reflected attribute
  // HTMLImageElement.sizes => string, reflected attribute
  // HTMLImageElement.srcset => string, reflected attribute
  // HTMLImageElement.useMap => string, reflected attribute
  // HTMLImageElement.width => number, reflected attribute

  reflectProperties([{
    alt: ['']
  }, {
    crossOrigin: ['']
  }, {
    height: [0]
  }, {
    isMap: [false]
  }, {
    referrerPolicy: ['']
  }, {
    src: ['']
  }, {
    sizes: ['']
  }, {
    srcset: ['']
  }, {
    useMap: ['']
  }, {
    width: [0]
  }], HTMLImageElement); // Unimplmented Properties
  // HTMLImageElement.complete Read only
  // Returns a Boolean that is true if the browser has finished fetching the image, whether successful or not. It also shows true, if the image has no src value.
  // HTMLImageElement.currentSrc Read only
  // Returns a DOMString representing the URL to the currently displayed image (which may change, for example in response to media queries).
  // HTMLImageElement.naturalHeight Read only
  // Returns a unsigned long representing the intrinsic height of the image in CSS pixels, if it is available; else, it shows 0.
  // HTMLImageElement.naturalWidth Read only
  // Returns a unsigned long representing the intrinsic width of the image in CSS pixels, if it is available; otherwise, it will show 0.

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
  /**
   * The HTMLInputLabels interface represents a collection of input getters for their related label Elements.
   * It is mixedin to both HTMLInputElement, HTMLMeterElement, and HTMLProgressElement.
   */

  var HTMLInputLabelsMixin = function HTMLInputLabelsMixin(defineOn) {
    Object.defineProperty(defineOn.prototype, 'labels', {
      /**
       * Getter returning label elements associated to this meter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLProgressElement/labels
       * @return label elements associated to this meter.
       */
      get: function get() {
        var _this = this;

        return matchChildrenElements(this.ownerDocument || this, function (element) {
          return element.tagName === 'label' && element.for && element.for === _this.id;
        });
      }
    });
  };

  var HTMLInputElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLInputElement, _HTMLElement);

    function HTMLInputElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLInputElement;
  }(HTMLElement);
  registerSubclass('input', HTMLInputElement);
  HTMLInputLabelsMixin(HTMLInputElement); // Reflected Properties
  // HTMLInputElement.formAction => string, reflected attribute
  // HTMLInputElement.formEncType	=> string, reflected attribute
  // HTMLInputElement.formMethod => string, reflected attribute
  // HTMLInputElement.formTarget => string, reflected attribute
  // HTMLInputElement.name => string, reflected attribute
  // HTMLInputElement.type => string, reflected attribute
  // HTMLInputElement.disabled => boolean, reflected attribute
  // HTMLInputElement.autofocus => boolean, reflected attribute
  // HTMLInputElement.required => boolean, reflected attribute
  // HTMLInputElement.defaultChecked => boolean, reflected attribute ("checked")
  // HTMLInputElement.alt => string, reflected attribute
  // HTMLInputElement.height => number, reflected attribute
  // HTMLInputElement.src => string, reflected attribute
  // HTMLInputElement.width => number, reflected attribute
  // HTMLInputElement.accept => string, reflected attribute
  // HTMLInputElement.autocomplete => string, reflected attribute
  // HTMLInputElement.maxLength => number, reflected attribute
  // HTMLInputElement.size => number, reflected attribute
  // HTMLInputElement.pattern => string, reflected attribute
  // HTMLInputElement.placeholder => string, reflected attribute
  // HTMLInputElement.readOnly => boolean, reflected attribute
  // HTMLInputElement.min => string, reflected attribute
  // HTMLInputElement.max => string, reflected attribute
  // HTMLInputElement.defaultValue => string, reflected attribute
  // HTMLInputElement.dirname => string, reflected attribute
  // HTMLInputElement.multiple => boolean, reflected attribute
  // HTMLInputElement.step => string, reflected attribute
  // HTMLInputElement.autocapitalize => string, reflected attribute

  reflectProperties([{
    formAction: ['']
  }, {
    formEncType: ['']
  }, {
    formMethod: ['']
  }, {
    formTarget: ['']
  }, {
    name: ['']
  }, {
    type: ['text']
  }, {
    disabled: [false]
  }, {
    autofocus: [false]
  }, {
    required: [false]
  }, {
    defaultChecked: [false, 'checked']
  }, {
    alt: ['']
  }, {
    height: [0]
  }, {
    src: ['']
  }, {
    width: [0]
  }, {
    accept: ['']
  }, {
    autocomplete: ['']
  }, {
    maxLength: [0]
  }, {
    size: [0]
  }, {
    pattern: ['']
  }, {
    placeholder: ['']
  }, {
    readOnly: [false]
  }, {
    min: ['']
  }, {
    max: ['']
  }, {
    defaultValue: ['', 'value']
  }, {
    dirName: ['']
  }, {
    multiple: [false]
  }, {
    step: ['']
  }, {
    autocapitalize: ['']
  }], HTMLInputElement); // TODO(KB) Not Reflected Properties
  // HTMLInputElement.value => string
  // HTMLInputElement.checked	=> boolean
  // HTMLInputElement.indeterminate => boolean
  // Unimplemented Properties
  // HTMLInputElement.formNoValidate => string, reflected attribute
  // HTMLInputElement.validity => ValidityState, readonly
  // HTMLInputElement.validationMessage => string, readonly
  // HTMLInputElement.willValidate => boolean, readonly
  // HTMLInputElement.allowdirs => boolean
  // HTMLInputElement.files	=> Array<File>
  // HTMLInputElement.webkitdirectory	=> boolean, reflected attribute
  // HTMLInputElement.webkitEntries => Array<FileSystemEntry>
  // HTMLInputElement.selectionStart => number
  // HTMLInputElement.selectionEnd => number
  // HTMLInputElement.selectionDirection => string
  // HTMLInputElement.list => Element, read only (element pointed by list attribute)
  // HTMLInputElement.valueAsDate => Date
  // HTMLInputElement.valueAsNumber => number
  // Unimplemented Methods
  // HTMLInputElement.setSelectionRange()
  // HTMLInputElement.setRangeText()
  // HTMLInputElement.setCustomValidity()
  // HTMLInputElement.checkValidity()
  // HTMLInputElement.stepDown()
  // HTMLInputElement.stepUp()

  var HTMLLabelElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLLabelElement, _HTMLElement);

    function HTMLLabelElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    _createClass(HTMLLabelElement, [{
      key: "control",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control
       * @return input element
       */
      get: function get() {
        var htmlFor = this.getAttribute('for');

        if (htmlFor !== null) {
          return this.ownerDocument && this.ownerDocument.getElementById(htmlFor);
        }

        return matchChildElement(this, tagNameConditionPredicate(['input']));
      }
    }]);

    return HTMLLabelElement;
  }(HTMLElement);
  registerSubclass('label', HTMLLabelElement); // Reflected Properties
  // HTMLLabelElement.htmlFor => string, reflected attribute 'for'

  reflectProperties([{
    htmlFor: ['', 'for']
  }], HTMLLabelElement);

  var HTMLLinkElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLLinkElement, _HTMLElement);

    function HTMLLinkElement() {
      var _this;

      _this = _HTMLElement.apply(this, arguments) || this;
      _this.relList = new DOMTokenList(HTMLLinkElement, _assertThisInitialized(_assertThisInitialized(_this)), 'rel', 'relList', 'rel');
      return _this;
    }

    return HTMLLinkElement;
  }(HTMLElement);
  registerSubclass('link', HTMLLinkElement); // Reflected Properties
  // HTMLLinkElement.as => string, reflected attribute
  // HTMLLinkElement.crossOrigin => string, reflected attribute
  // HTMLLinkElement.disabled => boolean, reflected attribute
  // HTMLLinkElement.href => string, reflected attribute
  // HTMLLinkElement.hreflang => string, reflected attribute
  // HTMLLinkElement.media => string, reflected attribute
  // HTMLLinkElement.referrerPolicy => string, reflected attribute
  // HTMLLinkElement.sizes => string, reflected attribute
  // HTMLLinkElement.type => string, reflected attribute

  reflectProperties([{
    as: ['']
  }, {
    crossOrigin: ['']
  }, {
    disabled: [false]
  }, {
    href: ['']
  }, {
    hreflang: ['']
  }, {
    media: ['']
  }, {
    referrerPolicy: ['']
  }, {
    sizes: ['']
  }, {
    type: ['']
  }], HTMLLinkElement); // Unimplemented Properties
  // LinkStyle.sheet Read only
  // Returns the StyleSheet object associated with the given element, or null if there is none.

  var HTMLMapElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLMapElement, _HTMLElement);

    function HTMLMapElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    _createClass(HTMLMapElement, [{
      key: "areas",

      /**
       * Getter returning area elements associated to this map.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMapElement
       * @return area elements associated to this map.
       */
      get: function get() {
        return matchChildrenElements(this, function (element) {
          return element.tagName === 'area';
        });
      }
    }]);

    return HTMLMapElement;
  }(HTMLElement);
  registerSubclass('link', HTMLMapElement); // Reflected Properties
  // HTMLMapElement.name => string, reflected attribute

  reflectProperties([{
    name: ['']
  }], HTMLMapElement);

  var HTMLMeterElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLMeterElement, _HTMLElement);

    function HTMLMeterElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLMeterElement;
  }(HTMLElement);
  registerSubclass('meter', HTMLMeterElement);
  HTMLInputLabelsMixin(HTMLMeterElement); // Reflected Properties
  // HTMLMeterElement.high => number, reflected attribute
  // HTMLMeterElement.low => number, reflected attribute
  // HTMLMeterElement.max => number, reflected attribute
  // HTMLMeterElement.min => number, reflected attribute
  // HTMLMeterElement.optimum => number, reflected attribute
  // HTMLMeterElement.value => number, reflected attribute

  reflectProperties([{
    high: [0]
  }, {
    low: [0]
  }, {
    max: [1]
  }, {
    min: [0]
  }, {
    optimum: [0]
  }, {
    value: [0]
  }], HTMLMeterElement);

  var HTMLModElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLModElement, _HTMLElement);

    function HTMLModElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLModElement;
  }(HTMLElement);
  registerSubclass('del', HTMLModElement);
  registerSubclass('ins', HTMLModElement); // Reflected Properties
  // HTMLModElement.cite => string, reflected attribute
  // HTMLModElement.datetime => string, reflected attribute

  reflectProperties([{
    cite: ['']
  }, {
    datetime: ['']
  }], HTMLModElement);

  var HTMLOListElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLOListElement, _HTMLElement);

    function HTMLOListElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLOListElement;
  }(HTMLElement);
  registerSubclass('ol', HTMLOListElement); // Reflected Properties
  // HTMLModElement.reversed => boolean, reflected attribute
  // HTMLModElement.start => number, reflected attribute
  // HTMLOListElement.type => string, reflected attribute

  reflectProperties([{
    reversed: [false]
  }, {
    start: [1]
  }, {
    type: ['']
  }], HTMLOListElement);

  var HTMLOptionElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLOptionElement, _HTMLElement);

    function HTMLOptionElement(nodeType, nodeName, namespaceURI) {
      var _this;

      _this = _HTMLElement.call(this, nodeType, nodeName, namespaceURI) || this;
      _this.isSelected = false;
      _this.propertyBackedAttributes_.selected = [function () {
        return String(_this.isSelected);
      }, function (value) {
        return _this.selected = value === 'true';
      }];
      return _this;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
     * @return position of the option within the list of options it's within, or zero if there is no valid parent.
     */


    _createClass(HTMLOptionElement, [{
      key: "index",
      get: function get() {
        return this.parentNode && this.parentNode.children.indexOf(this) || 0;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @return label attribute value or text content if there is no attribute.
       */

    }, {
      key: "label",
      get: function get() {
        return this.getAttribute('label') || this.textContent;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @param label new label value to store as an attribute.
       */
      ,
      set: function set(label) {
        this.setAttribute('label', label);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @return boolean based on if the option element is selected.
       */

    }, {
      key: "selected",
      get: function get() {
        return this.isSelected;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @param value new selected boolean value.
       */
      ,
      set: function set(value) {
        this.isSelected = value; // TODO(KB) This is a mutation.
      }
      /**
       * A Synonym for the Node.textContent property getter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @return value of text node direct child of this Element.
       */

    }, {
      key: "text",
      get: function get() {
        return this.textContent;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @param text new text content to store for this Element.
       */
      ,
      set: function set(text) {
        this.textContent = text;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @return value attribute value or text content if there is no attribute.
       */

    }, {
      key: "value",
      get: function get() {
        return this.getAttribute('value') || this.textContent;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
       * @param value new value for an option element.
       */
      ,
      set: function set(value) {
        this.setAttribute('value', value);
      }
    }]);

    return HTMLOptionElement;
  }(HTMLElement);
  registerSubclass('option', HTMLOptionElement); // Reflected Properties
  // HTMLOptionElement.defaultSelected => boolean, reflected attribute
  // HTMLOptionElement.disabled => boolean, reflected attribute
  // HTMLOptionElement.type => string, reflected attribute

  reflectProperties([{
    defaultSelected: [false, 'selected']
  }, {
    disabled: [false]
  }, {
    type: ['']
  }], HTMLOptionElement); // Implemented at HTMLElement
  // HTMLOptionElement.form, Read only	=> HTMLFormElement

  var HTMLProgressElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLProgressElement, _HTMLElement);

    function HTMLProgressElement() {
      var _this;

      _this = _HTMLElement.apply(this, arguments) || this;
      _this._indeterminate = true;
      _this._value = 0;
      return _this;
    }

    _createClass(HTMLProgressElement, [{
      key: "position",
      get: function get() {
        return this._indeterminate ? -1 : this._value / this.max;
      }
    }, {
      key: "value",
      get: function get() {
        return this._value;
      },
      set: function set(value) {
        this._indeterminate = false;
        this._value = value; // TODO(KB) This is a property mutation needing tracked.
      }
    }]);

    return HTMLProgressElement;
  }(HTMLElement);
  registerSubclass('progress', HTMLProgressElement);
  HTMLInputLabelsMixin(HTMLProgressElement); // Reflected Properties
  // HTMLModElement.max => number, reflected attribute

  reflectProperties([{
    max: [1]
  }], HTMLProgressElement);

  var HTMLQuoteElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLQuoteElement, _HTMLElement);

    function HTMLQuoteElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLQuoteElement;
  }(HTMLElement);
  registerSubclass('blockquote', HTMLQuoteElement);
  registerSubclass('q', HTMLQuoteElement); // Reflected Properties
  // HTMLModElement.cite => string, reflected attribute

  reflectProperties([{
    cite: ['']
  }], HTMLQuoteElement);

  var HTMLScriptElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLScriptElement, _HTMLElement);

    function HTMLScriptElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    _createClass(HTMLScriptElement, [{
      key: "text",

      /**
       * A Synonym for the Node.textContent property getter.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
       * @return value of text node direct child of this Element.
       */
      get: function get() {
        return this.textContent;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
       * @param text new text content to store for this Element.
       */
      ,
      set: function set(text) {
        this.textContent = text;
      }
    }]);

    return HTMLScriptElement;
  }(HTMLElement);
  registerSubclass('script', HTMLScriptElement); // Reflected Properties
  // HTMLScriptElement.type => string, reflected attribute
  // HTMLScriptElement.src => string, reflected attribute
  // HTMLScriptElement.charset => string, reflected attribute
  // HTMLScriptElement.async => boolean, reflected attribute
  // HTMLScriptElement.defer => boolean, reflected attribute
  // HTMLScriptElement.crossOrigin => string, reflected attribute
  // HTMLScriptElement.noModule => boolean, reflected attribute

  reflectProperties([{
    type: ['']
  }, {
    src: ['']
  }, {
    charset: ['']
  }, {
    async: [false]
  }, {
    defer: [false]
  }, {
    crossOrigin: ['']
  }, {
    noModule: [false]
  }], HTMLScriptElement);

  var isOptionPredicate = tagNameConditionPredicate(['option']);

  var isSelectedOptionPredicate = function isSelectedOptionPredicate(element) {
    return element.tagName === 'option' && element.selected;
  };

  var HTMLSelectElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLSelectElement, _HTMLElement);

    function HTMLSelectElement() {
      var _this;

      _this = _HTMLElement.apply(this, arguments) || this;
      _this._size_ = -1
      /* UNMODIFIED */
      ;
      return _this;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/length
     * @return number of controls in the form
     */


    _createClass(HTMLSelectElement, [{
      key: "length",
      get: function get() {
        return matchChildrenElements(this, isOptionPredicate).length;
      }
      /**
       * Getter returning option elements that are direct children of a HTMLSelectElement
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @return Element "options" objects that are direct children.
       */

    }, {
      key: "options",
      get: function get() {
        return this.children.filter(isOptionPredicate);
      }
      /**
       * Getter returning the index of the first selected <option> element.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex
       * @return the index of the first selected option element, or -1 if no element is selected.
       */

    }, {
      key: "selectedIndex",
      get: function get() {
        var firstSelectedChild = matchChildElement(this, isSelectedOptionPredicate);
        return firstSelectedChild ? this.children.indexOf(firstSelectedChild) : -1;
      }
      /**
       * Setter making the <option> element at the passed index selected.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex
       * @param selectedIndex index number to make selected.
       */
      ,
      set: function set(selectedIndex) {
        this.children.forEach(function (element, index) {
          element.selected = index === selectedIndex;
        });
      }
      /**
       * Getter returning the <option> elements selected.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedOptions
       * @return array of Elements currently selected.
       */

    }, {
      key: "selectedOptions",
      get: function get() {
        return matchChildrenElements(this, isSelectedOptionPredicate);
      }
      /**
       * Getter returning the size of the select element (by default 1 for single and 4 for multiple)
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @return size of the select element.
       */

    }, {
      key: "size",
      get: function get() {
        return this._size_ === -1
        /* UNMODIFIED */
        ? this.multiple ? 4
        /* MULTIPLE */
        : 1
        /* SINGLE */
        : this._size_;
      }
      /**
       * Override the size of this element (each positive unit is the height of a single option)
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @param size number to set the size to.
       */
      ,
      set: function set(size) {
        this._size_ = size > 0 ? size : this.multiple ? 4
        /* MULTIPLE */
        : 1
        /* SINGLE */
        ;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @return string representing the select element type.
       */

    }, {
      key: "type",
      get: function get() {
        return this.multiple ? "select-one"
        /* MULTIPLE */
        : "select-multiple"
        /* SINGLE */
        ;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
       * @return the value of the first selected option
       */

    }, {
      key: "value",
      get: function get() {
        var firstSelectedChild = matchChildElement(this, isSelectedOptionPredicate);
        return firstSelectedChild ? firstSelectedChild.value : '';
      }
    }]);

    return HTMLSelectElement;
  }(HTMLElement);
  registerSubclass('select', HTMLSelectElement);
  HTMLInputLabelsMixin(HTMLSelectElement); // Reflected Properties
  // HTMLSelectElement.multiple => boolean, reflected attribute
  // HTMLSelectElement.name => string, reflected attribute
  // HTMLSelectElement.required => boolean, reflected attribute

  reflectProperties([{
    multiple: [false]
  }, {
    name: ['']
  }, {
    required: [false]
  }], HTMLSelectElement); // Implemented on HTMLElement
  // HTMLSelectElement.form => HTMLFormElement, readonly
  // Unimplemented Properties
  // HTMLSelectElement.validation => string
  // HTMLSelectElement.validity => ValidityState
  // HTMLSelectElement.willValidate => boolean

  var HTMLSourceElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLSourceElement, _HTMLElement);

    function HTMLSourceElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLSourceElement;
  }(HTMLElement);
  registerSubclass('source', HTMLSourceElement); // Reflected Properties
  // HTMLSourceElement.media => string, reflected attribute
  // HTMLSourceElement.sizes => string, reflected attribute
  // HTMLSourceElement.src => string, reflected attribute
  // HTMLSourceElement.srcset => string, reflected attribute
  // HTMLSourceElement.type => string, reflected attribute

  reflectProperties([{
    media: ['']
  }, {
    sizes: ['']
  }, {
    src: ['']
  }, {
    srcset: ['']
  }, {
    type: ['']
  }], HTMLSourceElement); // Unimplemented Properties
  // HTMLSourceElement.keySystem => string

  var HTMLStyleElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLStyleElement, _HTMLElement);

    function HTMLStyleElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLStyleElement;
  }(HTMLElement);
  registerSubclass('style', HTMLStyleElement); // Reflected Properties
  // HTMLStyleElement.media => string, reflected attribute
  // HTMLStyleElement.type => string, reflected attribute

  reflectProperties([{
    media: ['']
  }, {
    type: ['']
  }], HTMLStyleElement); // Unimplemented Properties
  // HTMLStyleElement.disabled => boolean
  // HTMLStyleElement.scoped => boolean, reflected attribute
  // HTMLStyleElement.sheet => StyleSheet, read only

  var HTMLTableCellElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLTableCellElement, _HTMLElement);

    function HTMLTableCellElement() {
      var _this;

      _this = _HTMLElement.apply(this, arguments) || this;
      _this.headers = new DOMTokenList(HTMLTableCellElement, _assertThisInitialized(_assertThisInitialized(_this)), 'headers', null, null);
      return _this;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement
     * @return position of the cell within the parent tr, if not nested in a tr the value is -1.
     */


    _createClass(HTMLTableCellElement, [{
      key: "cellIndex",
      get: function get() {
        var parent = matchNearestParent(this, tagNameConditionPredicate(['tr']));
        return parent !== null ? matchChildrenElements(parent, tagNameConditionPredicate(['th', 'td'])).indexOf(this) : -1;
      }
    }]);

    return HTMLTableCellElement;
  }(HTMLElement);
  registerSubclass('th', HTMLTableCellElement);
  registerSubclass('td', HTMLTableCellElement); // Reflected Properties
  // HTMLTableCellElement.abbr => string, reflected attribute
  // HTMLTableCellElement.colSpan => number, reflected attribute
  // HTMLTableCellElement.rowSpan => number, reflected attribute
  // HTMLTableCellElement.scope => string, reflected attribute

  reflectProperties([{
    abbr: ['']
  }, {
    colSpan: [1]
  }, {
    rowSpan: [1]
  }, {
    scope: ['']
  }], HTMLTableCellElement);

  var HTMLTableColElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLTableColElement, _HTMLElement);

    function HTMLTableColElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLTableColElement;
  }(HTMLElement);
  registerSubclass('col', HTMLTableColElement); // Reflected Properties
  // HTMLTableColElement.span => number, reflected attribute

  reflectProperties([{
    span: [1]
  }], HTMLTableColElement);

  var removeElement = function removeElement(element) {
    return element && element.remove();
  };

  var insertBeforeElementsWithTagName = function insertBeforeElementsWithTagName(parent, element, tagNames) {
    var insertBeforeElement = matchChildElement(parent, function (element) {
      return !tagNames.includes(element.tagName);
    });

    if (insertBeforeElement) {
      parent.insertBefore(element, insertBeforeElement);
    } else {
      parent.appendChild(element);
    }
  };

  var HTMLTableElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLTableElement, _HTMLElement);

    function HTMLTableElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    _createClass(HTMLTableElement, [{
      key: "caption",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/caption
       * @return first matching caption Element or null if none exists.
       */
      get: function get() {
        return matchChildElement(this, tagNameConditionPredicate(['caption']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/caption
       * @param element new caption element to replace the existing, or become the first element child.
       */
      ,
      set: function set(newElement) {
        if (newElement && newElement.tagName === 'caption') {
          // If a correct object is given,
          // it is inserted in the tree as the first child of this element and the first <caption>
          // that is a child of this element is removed from the tree, if any.
          removeElement(this.caption);
          this.insertBefore(newElement, this.firstElementChild);
        }
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
       * @return first matching thead Element or null if none exists.
       */

    }, {
      key: "tHead",
      get: function get() {
        return matchChildElement(this, tagNameConditionPredicate(['thead']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
       * @param newElement new thead element to insert in this table.
       */
      ,
      set: function set(newElement) {
        if (newElement && newElement.tagName === 'thead') {
          // If a correct object is given,
          // it is inserted in the tree immediately before the first element that is
          // neither a <caption>, nor a <colgroup>, or as the last child if there is no such element.
          // Additionally, the first <thead> that is a child of this element is removed from the tree, if any.
          removeElement(this.tHead);
          insertBeforeElementsWithTagName(this, newElement, ['caption', 'colgroup']);
        }
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
       * @return first matching thead Element or null if none exists.
       */

    }, {
      key: "tFoot",
      get: function get() {
        return matchChildElement(this, tagNameConditionPredicate(['tfoot']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
       * @param newElement new tfoot element to insert in this table.
       */
      ,
      set: function set(newElement) {
        if (newElement && newElement.tagName === 'tfoot') {
          // If a correct object is given,
          // it is inserted in the tree immediately before the first element that is neither a <caption>,
          // a <colgroup>, nor a <thead>, or as the last child if there is no such element, and the first <tfoot> that is a child of
          // this element is removed from the tree, if any.
          removeElement(this.tFoot);
          insertBeforeElementsWithTagName(this, newElement, ['caption', 'colgroup', 'thead']);
        }
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement
       * @return array of 'tr' tagname elements
       */

    }, {
      key: "rows",
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(['tr']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement
       * @return array of 'tbody' tagname elements
       */

    }, {
      key: "tBodies",
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(['tbody']));
      }
    }]);

    return HTMLTableElement;
  }(HTMLElement);
  registerSubclass('table', HTMLTableElement); // Unimplemented Properties
  // HTMLTableElement.sortable => boolean
  // Unimplemented Methods
  // HTMLTableElement.createTHead()
  // HTMLTableElement.deleteTHead()
  // HTMLTableElement.createTFoot()
  // HTMLTableElement.deleteTFoot()
  // HTMLTableElement.createCaption()
  // HTMLTableElement.deleteCaption()
  // HTMLTableElement.insertRow()
  // HTMLTableElement.deleteRow()

  var TABLE_SECTION_TAGNAMES = 'table tbody thead tfoot'.split(' ');

  var indexInAncestor = function indexInAncestor(element, isValidAncestor) {
    var parent = matchNearestParent(element, isValidAncestor); // TODO(KB): This is either a HTMLTableElement or HTMLTableSectionElement.

    return parent === null ? -1 : parent.rows.indexOf(element);
  };

  var HTMLTableRowElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLTableRowElement, _HTMLElement);

    function HTMLTableRowElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    var _proto = HTMLTableRowElement.prototype;

    /**
     * Removes the cell in provided position of this row.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
     * @param index position of the cell in the row to remove.
     */
    _proto.deleteCell = function deleteCell(index) {
      var cell = this.cells[index];
      cell && cell.remove();
    };
    /**
     * Insert a new cell ('td') in the row at a specified position.
     * @param index position in the children to insert before.
     * @return newly inserted td element.
     */


    _proto.insertCell = function insertCell(index) {
      var cells = this.cells;
      var td = this.ownerDocument.createElement('td');

      if (index < 0 || index >= cells.length) {
        this.appendChild(td);
      } else {
        this.insertBefore(td, this.children[index]);
      }

      return td;
    };

    _createClass(HTMLTableRowElement, [{
      key: "cells",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
       * @return td and th elements that are children of this row.
       */
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(['td', 'th']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
       * @return position of the row within a table, if not nested within in a table the value is -1.
       */

    }, {
      key: "rowIndex",
      get: function get() {
        return indexInAncestor(this, tagNameConditionPredicate(['table']));
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
       * @return position of the row within a parent section, if not nested directly in a section the value is -1.
       */

    }, {
      key: "sectionRowIndex",
      get: function get() {
        return indexInAncestor(this, tagNameConditionPredicate(TABLE_SECTION_TAGNAMES));
      }
    }]);

    return HTMLTableRowElement;
  }(HTMLElement);
  registerSubclass('tr', HTMLTableRowElement);

  var HTMLTableSectionElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLTableSectionElement, _HTMLElement);

    function HTMLTableSectionElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    var _proto = HTMLTableSectionElement.prototype;

    /**
     * Remove a node in a specified position from the section.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
     * @param index position in the section to remove the node of.
     */
    _proto.deleteRow = function deleteRow(index) {
      var rows = this.rows;

      if (index >= 0 || index <= rows.length) {
        rows[index].remove();
      }
    };
    /**
     * Insert a new row ('tr') in the row at a specified position.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
     * @param index position in the children to insert before.
     * @return newly inserted tr element.
     */


    _proto.insertRow = function insertRow(index) {
      var rows = this.rows;
      var tr = this.ownerDocument.createElement('tr');

      if (index < 0 || index >= rows.length) {
        this.appendChild(tr);
      } else {
        this.insertBefore(tr, this.children[index]);
      }

      return tr;
    };

    _createClass(HTMLTableSectionElement, [{
      key: "rows",

      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
       * @return All rows (tr elements) within the table section.
       */
      get: function get() {
        return matchChildrenElements(this, tagNameConditionPredicate(['tr']));
      }
    }]);

    return HTMLTableSectionElement;
  }(HTMLElement);
  registerSubclass('thead', HTMLTableSectionElement);
  registerSubclass('tfoot', HTMLTableSectionElement);
  registerSubclass('tbody', HTMLTableSectionElement);

  var HTMLTimeElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(HTMLTimeElement, _HTMLElement);

    function HTMLTimeElement() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    return HTMLTimeElement;
  }(HTMLElement);
  registerSubclass('time', HTMLTimeElement); // Reflected Properties
  // HTMLTimeElement.dateTime => string, reflected attribute

  reflectProperties([{
    dateTime: ['']
  }], HTMLTimeElement);

  var SVGElement =
  /*#__PURE__*/
  function (_Element) {
    _inheritsLoose(SVGElement, _Element);

    function SVGElement() {
      return _Element.apply(this, arguments) || this;
    }

    return SVGElement;
  }(Element);
  registerSubclass('svg', SVGElement);

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
  var Event =
  /*#__PURE__*/
  function () {
    function Event(type, opts) {
      this._stop = false;
      this._end = false;
      this.type = type;
      this.bubbles = !!opts.bubbles;
      this.cancelable = !!opts.cancelable;
    }

    var _proto = Event.prototype;

    _proto.stopPropagation = function stopPropagation() {
      this._stop = true;
    };

    _proto.stopImmediatePropagation = function stopImmediatePropagation() {
      this._end = this._stop = true;
    };

    _proto.preventDefault = function preventDefault() {
      this.defaultPrevented = true;
    };

    return Event;
  }();

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
  var document;
  var observing = false;
  var hydrated = false;

  var serializeNodes = function serializeNodes(nodes) {
    return nodes.map(function (node) {
      return node._transferredFormat_;
    });
  };
  /**
   *
   * @param mutations
   */


  function serializeHydration(mutations) {
    var _ref;

    consume();
    var hydratedNode = document.body.hydrate();
    var events = [];
    mutations.forEach(function (mutation) {
      if (mutation.type === 4
      /* COMMAND */
      && mutation.addedEvents) {
        mutation.addedEvents.forEach(function (addEvent) {
          events.push(addEvent);
        });
      }
    });
    return _ref = {}, _ref[9
    /* type */
    ] = 2, _ref[39
    /* strings */
    ] = consume$1(), _ref[35
    /* nodes */
    ] = hydratedNode, _ref[20
    /* addedEvents */
    ] = events, _ref;
  }
  /**
   *
   * @param mutations
   */


  function serializeMutations(mutations) {
    var _ref2;

    var nodes = consume().map(function (node) {
      return node._creationFormat_;
    });
    var transferrableMutations = [];
    mutations.forEach(function (mutation) {
      var _transferable;

      var transferable = (_transferable = {}, _transferable[9
      /* type */
      ] = mutation.type, _transferable[10
      /* target */
      ] = mutation.target._index_, _transferable);
      mutation.addedNodes && (transferable[11
      /* addedNodes */
      ] = serializeNodes(mutation.addedNodes));
      mutation.removedNodes && (transferable[12
      /* removedNodes */
      ] = serializeNodes(mutation.removedNodes));
      mutation.nextSibling && (transferable[14
      /* nextSibling */
      ] = mutation.nextSibling._transferredFormat_);
      mutation.attributeName != null && (transferable[15
      /* attributeName */
      ] = store$1(mutation.attributeName));
      mutation.attributeNamespace != null && (transferable[16
      /* attributeNamespace */
      ] = store$1(mutation.attributeNamespace));
      mutation.oldValue != null && (transferable[19
      /* oldValue */
      ] = store$1(mutation.oldValue));
      mutation.propertyName && (transferable[17
      /* propertyName */
      ] = store$1(mutation.propertyName));
      mutation.value != null && (transferable[18
      /* value */
      ] = store$1(mutation.value));
      mutation.addedEvents && (transferable[20
      /* addedEvents */
      ] = mutation.addedEvents);
      mutation.removedEvents && (transferable[21
      /* removedEvents */
      ] = mutation.removedEvents);
      transferrableMutations.push(transferable);
    });
    return _ref2 = {}, _ref2[9
    /* type */
    ] = 3, _ref2[39
    /* strings */
    ] = consume$1(), _ref2[35
    /* nodes */
    ] = nodes, _ref2[34
    /* mutations */
    ] = transferrableMutations, _ref2;
  }
  /**
   *
   * @param incoming
   * @param postMessage
   */


  function handleMutations(incoming, postMessage) {
    if (postMessage) {
      postMessage(hydrated === false ? serializeHydration(incoming) : serializeMutations(incoming));
    }

    hydrated = true;
  }
  /**
   *
   * @param doc
   * @param postMessage
   */


  function observe(doc, postMessage) {
    if (!observing) {
      document = doc;
      new doc.defaultView.MutationObserver(function (mutations) {
        return handleMutations(mutations, postMessage);
      }).observe(doc.body);
      observing = true;
    } else {
      console.error('observe() was called more than once.');
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
  /**
   * When an event is dispatched from the main thread, it needs to be propagated in the worker thread.
   * Propagate adds an event listener to the worker global scope and uses the WorkerDOM Node.dispatchEvent
   * method to dispatch the transfered event in the worker thread.
   */

  function propagate$1() {
    if (typeof addEventListener !== 'undefined') {
      addEventListener('message', function (_ref) {
        var data = _ref.data;

        if (data[9
        /* type */
        ] !== 1
        /* EVENT */
        ) {
            return;
          }

        var event = data[37
        /* event */
        ];
        var node = get(event[7
        /* _index_ */
        ]);

        if (node !== null) {
          var target = event[10
          /* target */
          ];
          node.dispatchEvent(Object.assign(new Event(event[9
          /* type */
          ], {
            bubbles: event[22
            /* bubbles */
            ],
            cancelable: event[23
            /* cancelable */
            ]
          }), {
            cancelBubble: event[24
            /* cancelBubble */
            ],
            defaultPrevented: event[26
            /* defaultPrevented */
            ],
            eventPhase: event[27
            /* eventPhase */
            ],
            isTrusted: event[28
            /* isTrusted */
            ],
            returnValue: event[29
            /* returnValue */
            ],
            target: get(target ? target[7
            /* _index_ */
            ] : null),
            timeStamp: event[30
            /* timeStamp */
            ],
            scoped: event[31
            /* scoped */
            ],
            keyCode: event[32
            /* keyCode */
            ]
          }));
        }
      });
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
  /**
   * When an event is dispatched from the main thread, it needs to be propagated in the worker thread.
   * Propagate adds an event listener to the worker global scope and uses the WorkerDOM Node.dispatchEvent
   * method to dispatch the transfered event in the worker thread.
   */

  function propagate$2() {
    if (typeof addEventListener !== 'function') {
      return;
    }

    addEventListener('message', function (_ref) {
      var data = _ref.data;

      if (data[9
      /* type */
      ] !== 5
      /* SYNC */
      ) {
          return;
        }

      var sync = data[38
      /* sync */
      ];
      var node = get(sync[7
      /* _index_ */
      ]);

      if (node) {
        node.value = sync[18
        /* value */
        ];
      }
    });
  }

  var Document =
  /*#__PURE__*/
  function (_Element) {
    _inheritsLoose(Document, _Element);

    function Document() {
      var _this;

      _this = _Element.call(this, 9
      /* DOCUMENT_NODE */
      , '#document', null) || this;
      _this.documentElement = _assertThisInitialized(_assertThisInitialized(_this));

      _this.createElement = function (tagName) {
        return _this.createElementNS(null, tagName);
      };

      _this.createElementNS = function (namespaceURI, tagName) {
        return new (NODE_NAME_MAPPING[tagName] || HTMLElement)(1
        /* ELEMENT_NODE */
        , tagName, namespaceURI);
      };

      _this.createTextNode = function (text) {
        return new Text(text);
      };

      _this.defaultView = {
        document: _assertThisInitialized(_assertThisInitialized(_this)),
        MutationObserver: MutationObserver,
        Document: Document,
        Node: Node,
        Text: Text,
        Element: Element,
        SVGElement: SVGElement,
        Event: Event
      };
      return _this;
    }
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
     * @return Element with matching id attribute.
     */


    var _proto = Document.prototype;

    _proto.getElementById = function getElementById(id) {
      return matchChildElement(this.body, function (element) {
        return element.id === id;
      });
    };

    return Document;
  }(Element);
  /**
   *
   * @param postMessageMethod
   */

  function createDocument(postMessageMethod) {
    // Use local references of privileged functions that are used asynchronously
    // (e.g. `postMessage`) to prevent overwriting by 3P JS.
    var _postMessage = postMessageMethod;
    var doc = new Document();
    doc.isConnected = true;
    doc.appendChild(doc.body = doc.createElement('body'));

    if (_postMessage) {
      observe(doc, _postMessage);
      propagate$1();
      propagate$2();
    }

    return doc;
  }
  /** Should only be used for testing. */

  var documentForTesting = undefined;

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
  var doc = createDocument(self.postMessage);
  var workerDOM = {
    document: doc,
    addEventListener: doc.addEventListener.bind(doc),
    removeEventListener: doc.removeEventListener.bind(doc),
    localStorage: {},
    location: {},
    url: '/',
    appendKeys: appendKeys
  };

  exports.workerDOM = workerDOM;

  return exports;

}({}));
//# sourceMappingURL=worker.js.map
