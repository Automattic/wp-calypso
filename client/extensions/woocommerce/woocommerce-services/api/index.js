/**
 * Internal dependencies
 */
import request from 'woocommerce/state/sites/request';

import * as urlModule from './url';
export { urlModule as url };

const handleError = ( jsonError ) => {
	if ( jsonError && jsonError.message ) {
		throw jsonError.message;
	}

	if ( jsonError && jsonError.data && jsonError.data.message ) {
		throw jsonError.data.message;
	}

	throw jsonError;
};

export const post = ( siteId, url, data ) =>
	request( siteId )
		.post( url, data, 'wc/v1' ) //WCS exposes it's REST endpoints only over wc/v1
		.catch( handleError );

export const get = ( siteId, url ) =>
	request( siteId )
		.get( url, 'wc/v1' ) //WCS exposes it's REST endpoints only over wc/v1
		.catch( handleError );
