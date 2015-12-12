/**
 * `SiteWordAdsTOS` constructor.
 *
 * *Example:*
 *    // Require `wpcom-unpublished` library
 *    import wpcomUnpublished from 'wpcom-unpublished';
 *
 *    // Create a `wpcomUnpublished` instance
 *    var wpcom = wpcomUnpublished();
 *
 *    // Create a `SiteWordAdsTOS` instance
 *    var wordAds = wpcom
 *      .site( 'my-blog.wordpress.com' )
 *      .wordAds()
 *      .tos();
 *
 * @param {String} sid - site identifier
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
 */
function SiteWordAdsTOS( sid, wpcom ) {
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

 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
SiteWordAdsTOS.prototype.get = function( query, fn ) {
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
 * @param {Object} [query] - query object parameter
 * @param {Object} body - body object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
SiteWordAdsTOS.prototype.update = function( query, body, fn ) {
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
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
SiteWordAdsTOS.prototype.sign = function( query, fn ) {
	var path = '/sites/' + this._sid + '/wordads/tos';
	return this.wpcom.req.post( path, query, { tos: 'signed' }, fn );
};

/**
 * Expose `SiteWordAdsTOS` module
 */
module.exports = SiteWordAdsTOS;
