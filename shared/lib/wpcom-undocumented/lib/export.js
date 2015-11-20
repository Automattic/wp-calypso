/**
 * External dependencies.
 */
var debug = require( 'debug' )( 'calypso:wpcom-undocumented:export' );

/**
 * Export methods
 *
 * @param {String} id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 */
function Export( id, sid, wpcom ) {
	if ( ! ( this instanceof Export ) ) {
		return new Export( id, sid, wpcom );
	}

	this.wpcom = wpcom;
	this._sid = sid;
	this._id = id;
}

/**
 * Submit a new export
 *
 * @param {Function} fn
 * @api public
 */
Export.prototype.new = function ( fn ) {
	debug( '/sites/:site_id:/exports/new query' );
	return this.wpcom.req.post( { path: '/sites/' + this._sid + '/exports/new' }, fn );
};

/**
 * Start a new export
 *
 * @param {Function} fn
 * @param {Object} exportConfig
 * @api public
 */
Export.prototype.start = function ( exportConfig, fn ) {
	debug( '/sites/:site_id:/exports/:export_id:/start query' );
	var params = {
		path: '/sites/' + this._sid + '/exports/' + this._id + '/start',
		body: {
			content: exportConfig.content,
			post_author: exportConfig.post_author,
			post_start_date: exportConfig.post_start_date,
			post_end_date: exportConfig.post_end_date,
			category: exportConfig.category,
			page_author: exportConfig.page_author,
			page_start_date: exportConfig.page_start_date,
			page_end_date: exportConfig.page_end_date,
			page_status: exportConfig.page_status
		}
	};
	return this.wpcom.req.post( params, fn );
};

/**
 * Get an export
 *
 * @param {Function} fn
 * @api public
 */
Export.prototype.get = function ( fn ) {
	debug( '/sites/:site_id:/exports/:export_id query' );
	return this.wpcom.req.get( { path: '/sites/' + this._sid + '/exports/' + this._id }, fn );
};

/**
 * Expose `Export` module
 */
module.exports = Export;
