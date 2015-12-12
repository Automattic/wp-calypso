/**
 * `SiteWordAdsSettings` constructor.
 *
 * *Example:*
 *    // Require `wpcom-unpublished` library
 *    import wpcomUnpublished from 'wpcom-unpublished';
 *
 *    // Create a `wpcomUnpublished` instance
 *    var wpcom = wpcomUnpublished();
 *
 *    // Create a `SiteWordAdsSettings` instance
 *    var wordAds = wpcom
 *      .site( 'my-blog.wordpress.com' )
 *      .wordAds()
 *      .settings();
 *
 *
 * @param {String} sid - site identifier
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
 */
function SiteWordAdsSettings( sid, wpcom ) {
	if ( ! ( this instanceof SiteWordAdsSettings ) ) {
		return new SiteWordAdsSettings( sid, wpcom );
	}

	this._sid = sid;
	this.wpcom = wpcom;
}

/**
 * Get detailed WordAds settings information about the site.
 *
 * *Example:*
 *    // Get site settings information
 *    wpcom
 *    .site( 'my-blog.wordpress.com' )
 *    .wordAds()
 *    .settings()
 *    .get( function( err, data ) {
 *      // `settings` information object
 *    } );
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
SiteWordAdsSettings.prototype.get = function( query, fn ) {
	return this.wpcom.req.get( '/sites/' + this._sid + '/wordads/settings', query, fn );
};

/**
 * Update WordAds settings for the site.
 *
 * *Example:*
 *    var settings = {}; // your settings here
 *
 *    // Get site settings information
 *    wpcom
 *    .site( 'my-blog.wordpress.com' )
 *    .wordAds()
 *    .settings()
 *    .update( settings, function( err, data ) {
 *      // data settings information object
 *    } );
 *
 * @param {Object} [query] - query object parameter
 * @param {Object} body - body object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
SiteWordAdsSettings.prototype.update = function( query, body, fn ) {
	var path = '/sites/' + this._sid + '/wordads/settings';
	return this.wpcom.req.post( path, query, body, fn );
};

/**
 * Expose `SiteWordAdsSettings` module
 */
module.exports = SiteWordAdsSettings;
