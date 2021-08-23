/**
 * External dependencies
 */

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:wpcom-undocumented:site' );

/**
 * Resources array
 * A list of endpoints with the same structure
 * [  wpcom-undocumented.functionName, siteAPiSubPath, apiVersion ]
 */
const resources = [
	[ 'statsEvents', 'posts/' ],
	[ 'statsInsights', 'stats/insights', '1.1' ],
	[ 'statsFileDownloads', 'stats/file-downloads', '1.1' ],
	[ 'statsAds', 'wordads/stats', '1.1' ],
];

const list = function ( resourceOptions ) {
	return function ( query, fn ) {
		let subpath = resourceOptions.subpath;

		// Handle replacement of '/:var' in the subpath with value from query
		/* eslint-disable no-useless-escape */
		subpath = subpath.replace( /\/:([^\/]+)/g, function ( match, property ) {
			let replacement;
			if ( 'undefined' !== typeof query[ property ] ) {
				replacement = query[ property ];
				delete query[ property ];
				return '/' + replacement;
			}
			return '/';
		} );
		/* eslint-enable no-useless-escape */

		query.apiVersion = resourceOptions.apiVersion;

		const path = '/sites/' + this._id + '/' + subpath;

		debug( 'calling undocumented site api path', path );
		debug( 'query', query );
		debug( 'resourceOptions', resourceOptions );

		if ( 'post' === resourceOptions.method ) {
			return this.wpcom.req.post( path, {}, query, fn );
		}
		return this.wpcom.req[ resourceOptions.method ]( path, query, fn );
	};
};

// Walk for each resource and create related method
resources.forEach( function ( resource ) {
	const name = resource[ 0 ];
	const resourceOptions = {
		subpath: resource[ 1 ],
		apiVersion: resource[ 2 ] || '1',
		method: resource[ 3 ] || 'get',
	};

	UndocumentedSite.prototype[ name ] = list.call( this, resourceOptions );
} );

/* eslint-disable jsdoc/no-undefined-types */
/**
 * Create an UndocumentedSite instance
 *
 * @param {number}   id          Site ID
 * @param {object} wpcom       WPCOM instance
 *
 * @returns {UndocumentedSite} UndocumentedSite instance
 *
 * @public
 */
function UndocumentedSite( id, wpcom ) {
	debug( 'UndocumentedSite', id );
	if ( ! ( this instanceof UndocumentedSite ) ) {
		return new UndocumentedSite( id, wpcom );
	}
	this.wpcom = wpcom;
	this._id = id;
}

/**
 * Requests Store orders stats
 *
 * @param {object} query query parameters
 * @returns {Promise} A Promise to resolve when complete.
 */
UndocumentedSite.prototype.statsOrders = function ( query ) {
	return this.wpcom.req.get(
		{
			path: `/sites/${ this._id }/stats/orders`,
			apiNamespace: 'wpcom/v2',
		},
		query
	);
};

/**
 * Requests Store referrer stats
 *
 * @param {object} query query parameters
 * @returns {Promise} A Promise to resolve when complete.
 */
UndocumentedSite.prototype.statsStoreReferrers = function ( query ) {
	return this.wpcom.req.get(
		{
			path: `/sites/${ this._id }/stats/events-by-referrer`,
			apiNamespace: 'wpcom/v2',
		},
		query
	);
};

/**
 * Requests Store top-sellers stats
 *
 * @param {object} query query parameters
 * @returns {Promise} A Promise to resolve when complete.
 */
UndocumentedSite.prototype.statsTopSellers = function ( query ) {
	return this.wpcom.req.get(
		{
			path: `/sites/${ this._id }/stats/top-sellers`,
			apiNamespace: 'wpcom/v2',
		},
		query
	);
};

/**
 * Requests Store top earners
 *
 * @param {object} query query parameters
 * @returns {Promise} A Promise to resolve when complete.
 */
UndocumentedSite.prototype.statsTopEarners = function ( query ) {
	return this.wpcom.req.get(
		{
			path: `/sites/${ this._id }/stats/top-earners`,
			apiNamespace: 'wpcom/v2',
		},
		query
	);
};

/**
 * Requests Store top categories
 *
 * @param {object} query query parameters
 * @returns {Promise} A Promise to resolve when complete.
 */
UndocumentedSite.prototype.statsTopCategories = function ( query ) {
	return this.wpcom.req.get(
		{
			path: `/sites/${ this._id }/stats/top-product-categories-by-usage`,
			apiNamespace: 'wpcom/v2',
		},
		query
	);
};

/**
 * Requests Store top-* lists
 *
 * @param {object} query query parameters
 * @returns {Promise} A Promise to resolve when complete.
 */
UndocumentedSite.prototype.statsTopCoupons = function ( query ) {
	return this.wpcom.req.get(
		{
			path: `/sites/${ this._id }/stats/top-coupons-by-usage`,
			apiNamespace: 'wpcom/v2',
		},
		query
	);
};

/**
 * Expose `UndocumentedSite` module
 */
export default UndocumentedSite;
