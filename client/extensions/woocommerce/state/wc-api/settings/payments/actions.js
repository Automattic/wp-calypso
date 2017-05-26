/**
 * Internal dependencies
 */
import getPaymentMethodDetails from '../../../../lib/get-payment-method-details';
import wp from 'lib/wp';
import { error } from '../../actions';
import {
	WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_METHODS,
	WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_METHODS_SUCCESS,
} from '../../../action-types';

export function fetchPaymentMethods( siteId ) {
	return ( dispatch ) => {
		const getAction = {
			type: WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_METHODS,
			payload: { siteId },
		};

		dispatch( getAction );

		const jpPath = `/jetpack-blogs/${ siteId }/rest-api/`;
		const apiPath = '/wc/v2/payment_gateways';

		return wp.req.get( { path: jpPath }, { path: apiPath } )
			.then( ( { data } ) => {
				dispatch( fetchPaymentMethodsSuccess( siteId, data ) );
			} )
			.catch( err => {
				dispatch( error( siteId, getAction, err ) );
			} );
	};
}

export function fetchPaymentMethodsSuccess( siteId, data ) {
	if ( ! Array.isArray( data ) ) {
		const originalAction = {
			type: WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_METHODS,
			payload: { siteId }
		};
		return error(
			siteId, originalAction, { message: 'Invalid Payment Methods Array', data }
		);
	}
	const paymentMethods = data.map( ( method ) => {
		return { ...method, ...getPaymentMethodDetails( method.id ) };
	} );
	return {
		type: WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_METHODS_SUCCESS,
		payload: {
			siteId,
			paymentMethods,
		}
	};
}
