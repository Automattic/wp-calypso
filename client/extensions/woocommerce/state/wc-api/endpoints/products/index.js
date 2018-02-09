/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default endpointData => {
	// TODO: Remove eslint ignore after requirements is implemented.
	// eslint-disable-next-line no-unused-vars
	function getSingle( productId, requirements ) {
		// TODO: Designate the product is to be used in state.

		return get( endpointData, [ 'products', productId ], null );
	}

	return {
		getSingle,
	};
};
