/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

const fetchDefaultProducts = async ( currency ) => {
	try {
		const result = await apiFetch( {
			path: `/wpcom/v2/memberships/products?type=donation&currency=${ currency }`,
			method: 'POST',
		} );
		return result;
	} catch ( error ) {
		return Promise.reject( error.message );
	}
};

export default fetchDefaultProducts;
