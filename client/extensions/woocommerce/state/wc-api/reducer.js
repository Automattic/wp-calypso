/**
 * Internal dependencies
 */
import error from './error-reducer';
import paymentMethods from './settings/payments/reducer';
import productCategories from './product-categories/reducer';

import shippingZones from './shipping-zones/reducer';

const initialState = {};

const handlers = {
	...paymentMethods,
	...productCategories,
	...shippingZones,
	...error,
};

export default function( state = initialState, action ) {
	const { type, payload } = action;
	const { siteId } = payload || {};
	const handler = handlers[ type ];

	if ( handler ) {
		if ( ! siteId ) {
			throw new TypeError( `Action ${ type } handled by reducer, but no siteId set on action.` );
		}

		const siteState = state[ siteId ] || {};
		const newSiteState = handler( siteState, action );

		return { ...state, [ siteId ]: newSiteState };
	}

	return state;
}
