/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	I18N_PAYMENT_METHODS_RECEIVE,
	I18N_PAYMENT_METHODS_REQUEST
} from 'state/action-types';
import { i18nPaymentsSchema } from './schema';
import { createReducer } from 'state/utils';

export const requesting = createReducer( false, {
	[ I18N_PAYMENT_METHODS_REQUEST ]: () => true,
	[ I18N_PAYMENT_METHODS_RECEIVE ]: () => false
} );

export const locales = createReducer( null, {
	[ I18N_PAYMENT_METHODS_RECEIVE ]: ( state, action ) => action.localizedPaymentMethods
}, i18nPaymentsSchema );

export default combineReducers( {
	requesting,
	locales,
} );
