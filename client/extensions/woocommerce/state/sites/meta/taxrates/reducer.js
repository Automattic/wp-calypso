/**
 * Internal dependencies
 */

import { withoutPersistence } from 'calypso/state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_TAXRATES_REQUEST,
	WOOCOMMERCE_TAXRATES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_TAXRATES_REQUEST: {
			return LOADING;
		}
		case WOOCOMMERCE_TAXRATES_REQUEST_SUCCESS: {
			const { data } = action;
			return data;
		}
	}

	return state;
} );
