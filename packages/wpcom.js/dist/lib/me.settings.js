var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

/**
 * Module dependencies
 */

var _meSettingsProfileLinks = require('./me.settings.profile-links');

var _meSettingsProfileLinks2 = _interopRequireDefault(_meSettingsProfileLinks);

var _meSettingsPassword = require('./me.settings.password');

var _meSettingsPassword2 = _interopRequireDefault(_meSettingsPassword);

/**
 * `MeSettings` constructor.
 *
 * Use a `WPCOM#Me` instance to create a new `MeSettings` instance.
 *
 * *Example:*
 *    // Require `wpcom-unpublished` library
 *    var wpcomUnpublished = require( 'wpcom-unpublished' );
 *
 *    // Create a `wpcomUnpublished` instance
 *    var wpcom = wpcomUnpublished();
 *
 *    // Create a `MeSettings` instance
 *    var settings = wpcom.me().settings();
 *
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
 */
function MeSettings(wpcom) {
  if (!(this instanceof MeSettings)) {
    return new MeSettings(wpcom);
  }

  this.wpcom = wpcom;
}

/**
 * Get settings for the current user.
 *
 * *Example:*
 *    // Get settings for the current user
 *    wpcom
 *    .me()
 *    .settings()
 *    .get( function( err, data ) {
 *      // user settings data object
 *    } );
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
MeSettings.prototype.get = function (query, fn) {
  return this.wpcom.req.get('/me/settings', query, fn);
};

/**
 * Update settings of the current user
 *
 * @param {Object} [query] - query object parameter
 * @param {Object} body - body object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
MeSettings.prototype.update = function (query, body, fn) {
  return this.wpcom.req.put('/me/settings/', query, body, fn);
};

/**
 * Return `MeProfileLinks` instance
 *
 * *Example:*
 *    // Create a MeProfileLinks instance
 *    var profile_links = wpcom.me().settings().profileLinks();
 *
 * @return {MeProfileLinks} MeProfileLinks instance
 */
MeSettings.prototype.profileLinks = function () {
  return new _meSettingsProfileLinks2['default'](this.wpcom);
};

/**
 * Return `MeSettingsPassword` instance
 *
 * @return {MeSettingsPassword} MeSettingsPassword instance
 */
MeSettings.prototype.password = function () {
  return new _meSettingsPassword2['default'](this.wpcom);
};

/**
 * Expose `MeSettings` module
 */
module.exports = MeSettings;