import sendRequest from './send-request';

/**
 * Expose `Request` module
 * @param {WPCOM} wpcom - wpcom instance
 */
export default function Req( wpcom ) {
	this.wpcom = wpcom;
}

/**
 * Request methods
 * @param {Object | string} params - params object
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Req.prototype.get = function ( params, query, fn ) {
	// `query` is optional
	if ( 'function' === typeof query ) {
		fn = query;
		query = {};
	}

	return sendRequest.call( this.wpcom, params, query, null, fn );
};

/**
 * Make `update` request
 * @param {Object | string} params
 * @param {Object} [query] - query object parameter
 * @param {Object} [body] - body object parameter
 * @param {Function} fn - callback function
 */
Req.prototype.post = Req.prototype.put = function ( params, query, body, fn ) {
	if ( undefined === fn ) {
		if ( undefined === body ) {
			if ( 'function' === typeof query ) {
				// post( params, fn )
				fn = query;
				body = null;
				query = {};
			} else {
				// post( params, body )
				body = query;
				query = {};
			}
		} else if ( 'function' === typeof body ) {
			// post( params, body, fn )
			fn = body;
			body = query;
			query = {};
		}
	}

	// params can be a string
	params = 'string' === typeof params ? { path: params } : params;

	// in v1 endpoints, DELETE and PUT operations use http POST, but for v2 endpoints we must allow this to be overridden
	params.method = params.method || 'post';

	return sendRequest.call( this.wpcom, params, query, body, fn );
};

/**
 * Make a `delete` request
 * @param {Object | string} params - params object
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Req.prototype.del = function ( params, query, fn ) {
	if ( 'function' === typeof query ) {
		fn = query;
		query = {};
	}

	return this.post( params, query, null, fn );
};
