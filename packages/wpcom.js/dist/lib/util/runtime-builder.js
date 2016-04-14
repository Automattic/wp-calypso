var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Module dependencies
 */

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

/**
 * Module vars
 */
var debug = (0, _debug2['default'])('wpcom:runtime');

/**
 * Build a generic method
 *
 * @param {Object} methodParams - method methodParams
 * @param {Function} buildPath - function called to build method path
 * @return {String} method path
 */
var methodBuilder = function methodBuilder(methodParams, buildPath) {
  return function (query, fn) {
    var path = buildPath(methodParams, this);
    return this.wpcom.req.get(path, query, fn);
  };
};

/**
 * Add methods to the given Class in the
 * runtime process.
 *
 * @param {*} Class - class to extend
 * @param {Array} list - methods list
 * @param {Function} buildPath - function to build the method endpoint path
 */

exports['default'] = function (Class, list, buildPath) {
  list.forEach(function (methodParams) {
    methodParams = 'object' === typeof methodParams ? methodParams : { name: methodParams };

    debug('Adding %o', methodParams.name);
    Class.prototype[methodParams.name] = methodBuilder(methodParams, buildPath);
  });
};

;
module.exports = exports['default'];