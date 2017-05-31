/**
 * Internal dependencies
 */
import { areOrdersLoaded, areOrdersLoading } from './selectors';
import createOrderObject from './assembler';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../request';
import {
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from '../../action-types';

export const fetchOrders = ( siteId ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( areOrdersLoaded( state, siteId ) || areOrdersLoading( state, siteId ) ) {
		return;
	}

	dispatch( {
		type: WOOCOMMERCE_ORDERS_REQUEST,
		siteId,
	} );

	return request( siteId ).get( 'orders' ).then( ( data ) => {
		dispatch( {
			type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
			data: data.map( createOrderObject ),
			siteId,
		} );
	} ).catch( error => {
		dispatch( {
			type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
			siteId,
			error
		} );
	} );
};
