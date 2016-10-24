/**
 * Detect error looking in the reponse data object.
 *
 * @param {Function} handler - wpcom handler
 * @return {Function} handler wrapper
 */
export function requestHandler( handler ) {
	return ( params, fn ) => {
		handler( params, ( err, response ) => {
			const { code, message, data = {} } = response || {};
			const { status } = data;

			// Create Error object if the response
			// has `code`, `message` and `status` properties
			if (
				code && typeof code === 'string' &&
				message && typeof message === 'string' &&
				status && typeof status === 'number'
			) {
				return fn( new Error( message ) );
			}

			return fn( err, response );
		} );
	};
}

/**
 * Wraps the given wpcom request handler with httpEnvelopeHandler
 *
 * @param {WPCOM} wpcom - wpcom instance
 * @return {WPCOM} wpcom instance with the new request handler
 */

export function injectHandler( wpcom ) {
	const request = wpcom.request.bind( wpcom );

	return Object.assign( wpcom, {
		request: requestHandler( request )
	} );
}
