/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import { find } from 'lodash';
import { error } from '../../actions';
import {
	WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_CURRENCY,
	WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_CURRENCY_SUCCESS,
} from '../../../action-types';

export function fetchPaymentCurrency( siteId ) {
	return ( dispatch ) => {
		const getAction = {
			type: WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_CURRENCY,
			payload: { siteId },
		};

		dispatch( getAction );

		const jpPath = `/jetpack-blogs/${ siteId }/rest-api/`;
		const apiPath = '/wc/v2/settings/general';

		return wp.req.get( { path: jpPath }, { path: apiPath } )
			.then( ( { data } ) => {
				dispatch( fetchPaymentCurrencySuccess( siteId, data ) );
			} )
			.catch( err => {
				dispatch( error( siteId, getAction, err ) );
			} );
	};
}

export function fetchPaymentCurrencySuccess( siteId, data ) {
	if ( ! Array.isArray( data ) ) {
		const originalAction = {
			type: WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_CURRENCY,
			payload: { siteId }
		};
		return error( siteId, originalAction, { message: 'Invalid Categories Array', data } );
	}

	const currency = find( data, ( item ) => item.id === 'woocommerce_currency' );
	return {
		type: WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_CURRENCY_SUCCESS,
		payload: {
			siteId,
			currency,
		}
	};
}
