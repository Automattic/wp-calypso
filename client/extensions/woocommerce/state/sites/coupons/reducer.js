/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_COUPONS_UPDATED,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_COUPONS_UPDATED ]: pageUpdated,
} );

function pageUpdated( state, action ) {
	const { params, coupons, totalPages, totalCoupons } = action;

	if ( coupons ) {
		return {
			params,
			coupons,
			totalPages,
			totalCoupons,
		};
	}

	return null;
}

