var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * Module dependencies
 */

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var debug = (0, _debug2['default'])('wpcom:builder');

/**
 * Add a method defined through of the given name, and subpath (optional)
 * to the given prototype.
 *
 * @param {name} name - method name
 * @param {String} [subpath] - endpoint subpath
 * @return {*} Class method
 */

exports['default'] = function (name, subpath) {
  debug('add %o - subpath: %o', name, subpath);

  return function (query, fn) {
    var path = '/sites/' + this._id + '/' + subpath;
    return this.wpcom.req.get(path, query, fn);
  };
};

;
module.exports = exports['default'];