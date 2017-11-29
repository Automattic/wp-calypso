/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import { omitBy } from 'lodash';
import qs from 'querystring';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { updateOrders, failOrders } from 'woocommerce/state/sites/orders/actions';
import request from 'woocommerce/state/sites/http-request';
import { WOOCOMMERCE_ORDERS_REQUEST } from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:orders' );

export default {
	[ WOOCOMMERCE_ORDERS_REQUEST ]: [ dispatchRequest( requestOrders, receivedOrders, apiError ) ],
};

export function requestOrders( { dispatch }, action ) {
	const { siteId, query } = action;
	const queryString = qs.stringify( omitBy( query, val => '' === val ) );
	action.failureAction = failOrders( siteId, query );

	dispatch( request( siteId, action ).getWithHeaders( `orders?${ queryString }` ) );
}

export function receivedOrders( { dispatch }, action, { data } ) {
	const { siteId, query } = action;
	const { body, headers } = data;
	const total = Number( headers[ 'X-WP-Total' ] );

	dispatch( updateOrders( siteId, query, body, total ) );
}

export function apiError( { dispatch }, action, error ) {
	debug( 'API Error: ', error );

	if ( action.failureAction ) {
		dispatch( { ...action.failureAction, error } );
	}
}
