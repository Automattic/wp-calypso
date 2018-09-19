/** @format */

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

// @TODO Clean up console

export async function MODULE_ACTIVATION_REQUEST( action, store ) {
	const { moduleSlug } = action;
	const { dispatch } = store;

	try {
		const activated = await apiFetch( {
			path: `/jetpack/v4/module/${ moduleSlug }/active`,
			method: 'POST',
		} );
		console.log( activated ); // eslint-disable-line no-console
		dispatch( {
			type: 'MODULE_ACTIVATION_SUCCESS',
			moduleSlug,
		} );
	} catch ( error ) {
		console.error( error ); // eslint-disable-line no-console
	}
}
