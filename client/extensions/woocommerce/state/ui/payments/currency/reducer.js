/**
 * Internal dependencies
 */

import { withoutPersistence } from 'calypso/state/utils';
import {
	WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS,
	WOOCOMMERCE_CURRENCY_CHANGE,
} from 'woocommerce/state/action-types';

export const initialState = '';

function changeAction( state, { currency } ) {
	return currency;
}

function currencyUpdatedAction() {
	return null;
}

export default withoutPersistence( ( state = initialState, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_CURRENCY_CHANGE:
			return changeAction( state, action );
		case WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS:
			return currencyUpdatedAction( state, action );
	}

	return state;
} );
