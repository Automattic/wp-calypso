/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

const fetchStatus = async () => {
	try {
		const result = await apiFetch( {
			path: '/wpcom/v2/memberships/status',
			method: 'GET',
		} );
		return result;
	} catch ( error ) {
		return Promise.reject( error.message );
	}
};

export default fetchStatus;
