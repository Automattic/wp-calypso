/**
 * Internal dependencies
 */
import getPaymentMethodDetails from '../../../lib/get-payment-method-details';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../request';
import { error } from '../actions';
import {
	WOOCOMMERCE_API_FETCH_PAYMENT_METHODS,
	WOOCOMMERCE_API_FETCH_PAYMENT_METHODS_SUCCESS,
} from '../../action-types';
import {
	arePaymentMethodsLoaded,
	arePaymentMethodsLoading,
} from './selectors';

export const fetchPaymentMethodsSuccess = ( siteId, data ) => {
	const paymentMethods = data.map( ( method ) => {
		return { ...method, ...getPaymentMethodDetails( method.id ) };
	} );
	return {
		type: WOOCOMMERCE_API_FETCH_PAYMENT_METHODS_SUCCESS,
		payload: {
			siteId,
			data: paymentMethods,
		},
	};
};

export const fetchPaymentMethods = ( siteId ) => ( dispatch, getState ) => {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( getState() );
	}
	if ( arePaymentMethodsLoaded( getState(), siteId ) || arePaymentMethodsLoading( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_API_FETCH_PAYMENT_METHODS,
		payload: { siteId },
	};

	dispatch( getAction );

	return request( siteId ).get( 'payment_gateways' )
		.then( ( data ) => {
			dispatch( fetchPaymentMethodsSuccess( siteId, data ) );
		} )
		.catch( err => {
			dispatch( error( siteId, getAction, err ) );
		} );
};
