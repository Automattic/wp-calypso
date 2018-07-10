/**
 * Internal dependencies
 */
import namespaceAndEndpointMiddleware from './namespace-endpoint';

const createRootURLMiddleware = ( rootURL ) => ( options, next ) => {
	return namespaceAndEndpointMiddleware( options, ( optionsWithPath ) => {
		let url = optionsWithPath.url;
		let path = optionsWithPath.path;
		let apiRoot;

		if ( typeof path === 'string' ) {
			apiRoot = rootURL;

			if ( -1 !== rootURL.indexOf( '?' ) ) {
				path = path.replace( '?', '&' );
			}

			path = path.replace( /^\//, '' );

			// API root may already include query parameter prefix if site is
			// configured to use plain permalinks.
			if ( 'string' === typeof apiRoot && -1 !== apiRoot.indexOf( '?' ) ) {
				path = path.replace( '?', '&' );
			}

			url = apiRoot + path;
		}

		return next( {
			...optionsWithPath,
			url,
		} );
	} );
};

export default createRootURLMiddleware;
