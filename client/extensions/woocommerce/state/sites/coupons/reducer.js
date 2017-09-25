/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { WOOCOMMERCE_COUPONS_PAGE_UPDATED } from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_COUPONS_PAGE_UPDATED ]: pageUpdated,
} );

function pageUpdated( state, action ) {
	const { pageIndex, coupons, totalPages, totalCoupons } = action;

	if ( coupons ) {
		return {
			coupons,
			pageIndex,
			totalPages,
			totalCoupons,
		};
	}

	return null;
}

