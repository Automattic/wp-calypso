/**
 * `SiteWordAdsEarnings` constructor.
 *
 * @param {string} sid - site identifier
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function SiteWordAdsEarnings( sid, wpcom ) {
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
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
SiteWordAdsEarnings.prototype.get = function ( query, fn ) {
	return this.wpcom.req.get( '/sites/' + this._sid + '/wordads/earnings', query, fn );
};
