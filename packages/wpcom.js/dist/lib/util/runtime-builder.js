var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Module dependencies
 */

var _runtimeMethod = require('./runtime-method');

var _runtimeMethod2 = _interopRequireDefault(_runtimeMethod);

/**
 * Add methods to the given Class in the
 * runtime process.
 *
 * @param {*} Class - class to extend
 * @param {Array} list - methods list
 */

exports['default'] = function (Class, list) {
  list.forEach(function (item) {
    item = 'object' === typeof item ? item : { name: item };
    Class.prototype[item.name] = (0, _runtimeMethod2['default'])(item.name, item.subpath);
  });
};

;
module.exports = exports['default'];