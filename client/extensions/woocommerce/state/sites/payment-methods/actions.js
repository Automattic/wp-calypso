/**
 * Internal dependencies
 */

import getPaymentMethodDetails from '../../../lib/get-payment-method-details';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from 'woocommerce/state/sites/request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE,
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { arePaymentMethodsLoaded, arePaymentMethodsLoading } from './selectors';

const addPaymentMethodDetails = ( method ) => {
	return {
		...method,
		...getPaymentMethodDetails( method.id ),
	};
};

const fetchPaymentMethodsSuccess = ( siteId, data ) => {
	const paymentMethods = data.map( addPaymentMethodDetails );
	return {
		type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
		siteId,
		data: paymentMethods,
	};
};

export const fetchPaymentMethods = ( siteId ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( arePaymentMethodsLoaded( state, siteId ) || arePaymentMethodsLoading( state, siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId )
		.get( 'payment_gateways' )
		.then( ( data ) => {
			dispatch( fetchPaymentMethodsSuccess( siteId, data ) );
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};

export const savePaymentMethodSuccess = ( siteId, data ) => {
	const paymentMethod = addPaymentMethodDetails( data );
	return {
		type: WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
		siteId,
		data: paymentMethod,
	};
};

export const savePaymentMethod = ( siteId, method, successAction = null, failureAction = null ) => {
	return {
		type: WOOCOMMERCE_PAYMENT_METHOD_UPDATE,
		siteId,
		method,
		successAction,
		failureAction,
	};
};
