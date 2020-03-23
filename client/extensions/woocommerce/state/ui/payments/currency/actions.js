/**
 * Internal dependencies
 */

import { WOOCOMMERCE_CURRENCY_CHANGE } from '../../../action-types';

export const changeCurrency = ( siteId, currency ) => {
	return { type: WOOCOMMERCE_CURRENCY_CHANGE, siteId, currency };
};
