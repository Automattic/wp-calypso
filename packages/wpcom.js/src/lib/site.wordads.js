/**
 * Module dependencies.
 */
import SiteWordAdsSettings from './site.wordads.settings';
import SiteWordAdsEarnings from './site.wordads.earnings';
import SiteWordAdsTOS from './site.wordads.tos';

/**
 * `SiteWordAds` constructor.
 *
 * Use a `WPCOM#Me` instance to create a new `SiteWordAds` instance.
 *
 * @param {string} sid - site identifier
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function SiteWordAds( sid, wpcom ) {
	if ( ! ( this instanceof SiteWordAds ) ) {
		return new SiteWordAds( sid, wpcom );
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
 * @returns {SiteWordAdsSettings} site WordAds settings instance
 */
SiteWordAds.prototype.settings = function () {
	return new SiteWordAdsSettings( this._sid, this.wpcom );
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
 * @returns {SiteWordAdsEarnings} site WordAds earnings instance
 */
SiteWordAds.prototype.earnings = function () {
	return new SiteWordAdsEarnings( this._sid, this.wpcom );
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
 * @returns {SiteWordAdsTOS} site wordAds TOS instance
 */
SiteWordAds.prototype.tos = function () {
	return new SiteWordAdsTOS( this._sid, this.wpcom );
};
