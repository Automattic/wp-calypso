/**
 * `SiteWordAdsEarnings` constructor.
 *
 * *Example:*
 *    // Require `wpcom-unpublished` library
 *    import wpcomUnpublished from 'wpcom-unpublished';
 *
 *    // Create a `wpcomUnpublished` instance
 *    var wpcom = wpcomUnpublished();
 *
 *    // Create a `SiteWordAdsEarnings` instance
 *    var wordAds = wpcom
 *      .site( 'my-blog.wordpress.com' )
 *      .wordAds()
 *      .earnings();
 *
 *
 * @param {String} sid - site identifier
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
 */
function SiteWordAdsEarnings( sid, wpcom ) {
	if ( ! ( this instanceof SiteWordAdsEarnings ) ) {
		return new SiteWordAdsEarnings( sid, wpcom );
	}

	this._sid = sid;
	this.wpcom = wpcom;
}

/**
 * Get detailed WordAds earnings information about the site.
 *
 * *Example:*
 *    // Get site earnings information
 *    wpcom
 *    .site( 'my-blog.wordpress.com' )
 *    .wordAds()
 *    .earnings()
 *    .get( function( err, data ) {
 *      // `earnings` information object
 *    } );
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
SiteWordAdsEarnings.prototype.get = function( query, fn ) {
	return this.wpcom.req.get( '/sites/' + this._sid + '/wordads/earnings', query, fn );
};

/**
 * Expose `SiteWordAdsEarnings` module
 */

module.exports = SiteWordAdsEarnings;
