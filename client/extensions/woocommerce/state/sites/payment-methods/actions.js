/**
 * Internal dependencies
 */
import getPaymentMethodDetails from '../../../lib/get-payment-method-details';
import { getPaymentMethodEdits } from 'woocommerce/state/ui/payments/methods/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE,
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
} from 'woocommerce/state/action-types';
import {
	arePaymentMethodsLoaded,
	arePaymentMethodsLoading,
} from './selectors';

const addPaymentMethodDetails = ( method ) => {
	return {
		...method,
		settings: {
			enabled: {
				id: 'enabled',
				label: 'Enabled',
				type: 'checkbox',
				value: method.enabled ? 'yes' : 'no',
			},
			...method.settings,
		},
		...getPaymentMethodDetails( method.id ) };
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

	return request( siteId ).get( 'payment_gateways' )
		.then( ( data ) => {
			dispatch( fetchPaymentMethodsSuccess( siteId, data ) );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};

const savePaymentMethodSuccess = ( siteId, data ) => {
	const paymentMethod = addPaymentMethodDetails( data );
	return {
		type: WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
		siteId,
		data: paymentMethod,
	};
};

export const savePaymentMethod = ( siteId, method, successAction = null, failureAction = null ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const rawEdits = getPaymentMethodEdits( state, siteId );
	const edits = {};
	Object.keys( rawEdits ).map( function( editKey ) {
		return edits[ editKey ] = rawEdits[ editKey ].value;
	} );
	const body = { settings: edits };
	const updateAction = {
		type: WOOCOMMERCE_PAYMENT_METHOD_UPDATE,
		siteId,
	};

	dispatch( updateAction );

	return request( siteId ).put( `payment_gateways/${ method.id }`, body )
		.then( ( data ) => {
			dispatch( savePaymentMethodSuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( err => {
			dispatch( setError( siteId, updateAction, err ) );
			if ( failureAction ) {
				dispatch( failureAction( err ) );
			}
		} );
};
