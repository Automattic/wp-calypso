/**
 * `SiteWordAdsTOS` constructor.
 *
 * @param {string} sid - site identifier
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {null} null
 */
export default function SiteWordAdsTOS( sid, wpcom ) {
	if ( ! ( this instanceof SiteWordAdsTOS ) ) {
		return new SiteWordAdsTOS( sid, wpcom );
	}

	this._sid = sid;
	this.wpcom = wpcom;
}

/**
 * GET site's WordAds TOS
 *
 * *Example:*
 *    // Get site TOS information
 *    wpcom
 *    .site( 'my-blog.wordpress.com' )
 *    .wordAds()
 *    .tos()
 *    .get( function( err, data ) {
 *      // `settings` information object
 *    } );

 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
SiteWordAdsTOS.prototype.get = function ( query, fn ) {
	return this.wpcom.req.get( '/sites/' + this._sid + '/wordads/tos', query, fn );
};

/**
 * UPDATE site's WordAds TOS
 *
 * *Example:*
 *    // Update TOS
 *    wpcom
 *    .site( 'my-blog.wordpress.com' )
 *    .wordAds()
 *    .tos()
 *    .update( { tos: 'signed' }, function( err, data ) {
 *      // data settings information object
 *    } );
 *
 * @param {object} [query] - query object parameter
 * @param {object} body - body object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
SiteWordAdsTOS.prototype.update = function ( query, body, fn ) {
	var path = '/sites/' + this._sid + '/wordads/tos';
	return this.wpcom.req.post( path, query, body, fn );
};

/**
 * SIGN site's WordAds TOS
 *
 * *Example:*
 *    // Sign TOS
 *    wpcom
 *    .site( 'my-blog.wordpress.com' )
 *    .wordAds()
 *    .tos()
 *    .sign( function( err, data ) {
 *      // data settings information object
 *    } );
 *
 * @param {object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
SiteWordAdsTOS.prototype.sign = function ( query, fn ) {
	var path = '/sites/' + this._sid + '/wordads/tos';
	return this.wpcom.req.post( path, query, { tos: 'signed' }, fn );
};
