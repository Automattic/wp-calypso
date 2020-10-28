/**
 * Internal dependencies
 */

import { withoutPersistence } from 'calypso/state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Rename setup choices to something like calypso preferences, to match the endpoint

// TODO: Handle error

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_SETUP_CHOICES_REQUEST: {
			return LOADING;
		}
		case WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS: {
			const { data } = action;
			return data;
		}
		case WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS: {
			const { data } = action;
			return { ...state, ...data };
		}
	}

	return state;
} );
