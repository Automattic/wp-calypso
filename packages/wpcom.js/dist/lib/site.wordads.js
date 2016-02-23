var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

/**
 * Module dependencies.
 */

var _siteWordadsSettings = require('./site.wordads.settings');

var _siteWordadsSettings2 = _interopRequireDefault(_siteWordadsSettings);

var _siteWordadsEarnings = require('./site.wordads.earnings');

var _siteWordadsEarnings2 = _interopRequireDefault(_siteWordadsEarnings);

var _siteWordadsTos = require('./site.wordads.tos');

var _siteWordadsTos2 = _interopRequireDefault(_siteWordadsTos);

/**
 * `SiteWordAds` constructor.
 *
 * Use a `WPCOM#Me` instance to create a new `SiteWordAds` instance.
 *
 * *Example:*
 *    // Require `wpcom-unpublished` library
 *    import wpcomUnpublished from 'wpcom-unpublished';
 *
 *    // Create a `wpcomUnpublished` instance
 *    var wpcom = wpcomUnpublished();
 *
 *    // Create a `SiteWordAds` instance
 *    var wordAds = wpcom
 *      .site( 'my-blog.wordpress.com' )
 *      .wordAds();
 *
 * @param {String} sid - site identifier
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
 */
function SiteWordAds(sid, wpcom) {
  if (!(this instanceof SiteWordAds)) {
    return new SiteWordAds(sid, wpcom);
  }

  this._sid = sid;
  this.wpcom = wpcom;
}

/**
 * Return a `SiteWordAdsSettings` instance.
 *
 * *Example:*
 *    // Create a SiteWordAdsSettings instance
 *
 *    var wordAds = wpcom
 *      .site( 'my-blog.wordpress.com' )
 *      .wordAds()
 *      .settings();
 *
 * @return {SiteWordAdsSettings} site WordAds settings instance
 */
SiteWordAds.prototype.settings = function () {
  return new _siteWordadsSettings2['default'](this._sid, this.wpcom);
};

/**
 * Return a `SiteWordAdsEarnings` instance.
 *
 * *Example:*
 *    // Create a SiteWordAdsEarnings instance
 *
 *    var wordAds = wpcom
 *      .site( 'my-blog.wordpress.com' )
 *      .wordAds()
 *      .earnings();
 *
 * @return {SiteWordAdsEarnings} site WordAds earnings instance
 */
SiteWordAds.prototype.earnings = function () {
  return new _siteWordadsEarnings2['default'](this._sid, this.wpcom);
};

/**
 * Return a `SiteWordAdsTOS` instance.
 *
 * *Example:*
 *    // Create a SiteWordAdsTOS instance
 *
 *    var wordAds = wpcom
 *      .site( 'my-blog.wordpress.com' )
 *      .wordAds()
 *      .tos();
 *
 * Return  SiteWordAdsTOS object for the site.
 *
 * @return {SiteWordAdsTOS} site wordAds TOS instance
 */
SiteWordAds.prototype.tos = function () {
  return new _siteWordadsTos2['default'](this._sid, this.wpcom);
};

/**
 * Expose `SiteWordAds` module
 */
module.exports = SiteWordAds;