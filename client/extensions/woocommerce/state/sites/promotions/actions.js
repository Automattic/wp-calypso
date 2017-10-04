/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PROMOTIONS_REQUEST,
} from 'woocommerce/state/action-types';

export function fetchPromotions( siteId, perPage = undefined ) {
	return {
		type: WOOCOMMERCE_PROMOTIONS_REQUEST,
		siteId,
		perPage,
	};
}

