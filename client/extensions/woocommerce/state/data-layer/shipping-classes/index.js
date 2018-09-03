/** @format */

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	fetchShippingClassesFailure,
	fetchShippingClassesSuccess,
	updateShippingClassSuccess,
	updateShippingClassFailure,
	createShippingClassSuccess,
	createShippingClassFailure,
	deleteShippingClassSuccess,
	deleteShippingClassFailure,
} from 'woocommerce/state/sites/shipping-classes/actions';
import {
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATE,
	WOOCOMMERCE_SHIPPING_CLASS_DELETE,
	WOOCOMMERCE_SHIPPING_CLASS_CREATE,
} from 'woocommerce/state/action-types';
import { verifyResponseHasData } from 'woocommerce/state/data-layer/utils';

const handlers = {};

export const shippingClassesRequest = {
	fetch: action => {
		const { siteId } = action;
		return request( siteId, action ).get( 'products/shipping_classes' );
	},

	onSuccess: ( { siteId }, { data } ) => dispatch => {
		return dispatch( fetchShippingClassesSuccess( siteId, data ) );
	},

	onError: ( action, error ) => dispatch => {
		return dispatch( fetchShippingClassesFailure( action, error, dispatch ) );
	},

	fromApi: verifyResponseHasData,
};
handlers[ WOOCOMMERCE_SHIPPING_CLASSES_REQUEST ] = [ dispatchRequestEx( shippingClassesRequest ) ];

export const shippingClassUpdate = {
	fetch: action => {
		const { siteId, id, changes } = action;
		return request( siteId, action ).put( 'products/shipping_classes/' + id, changes );
	},

	onSuccess: ( { siteId, successCallback }, { data } ) => dispatch => {
		dispatch( updateShippingClassSuccess( siteId, data ) );

		if ( successCallback ) {
			successCallback();
		}
	},

	onError: ( action, error ) => dispatch => {
		const { failureCallback } = action;

		if ( failureCallback ) {
			return failureCallback();
		}

		return dispatch( updateShippingClassFailure( action, error, dispatch ) );
	},

	fromApi: verifyResponseHasData,
};
handlers[ WOOCOMMERCE_SHIPPING_CLASS_UPDATE ] = [ dispatchRequestEx( shippingClassUpdate ) ];

export const shippingClassCreate = {
	fetch: action => {
		const { siteId, data } = action;
		return request( siteId, action ).post( 'products/shipping_classes/', data );
	},

	onSuccess: ( action, { data } ) => dispatch => {
		const { successCallback } = action;

		dispatch( createShippingClassSuccess( action, data ) );

		if ( successCallback ) {
			successCallback();
		}
	},

	onError: ( action, error ) => dispatch => {
		const { failureCallback } = action;

		if ( failureCallback ) {
			return failureCallback();
		}

		return dispatch( createShippingClassFailure( action, error, dispatch ) );
	},

	fromApi: verifyResponseHasData,
};
handlers[ WOOCOMMERCE_SHIPPING_CLASS_CREATE ] = [ dispatchRequestEx( shippingClassCreate ) ];

export const shippingClassDelete = {
	fetch: action => {
		const { siteId, classId } = action;

		return request( siteId, action ).del( 'products/shipping_classes/' + classId + '?force=true' );
	},

	onSuccess: ( { siteId, classId, successCallback } ) => dispatch => {
		dispatch( deleteShippingClassSuccess( siteId, classId ) );

		if ( successCallback ) {
			successCallback();
		}
	},

	onError: ( action, error ) => dispatch => {
		const { failureCallback } = action;

		if ( failureCallback ) {
			failureCallback();
		} else {
			dispatch( deleteShippingClassFailure( action, error, dispatch ) );
		}
	},

	fromApi: verifyResponseHasData,
};
handlers[ WOOCOMMERCE_SHIPPING_CLASS_DELETE ] = [ dispatchRequestEx( shippingClassDelete ) ];

export default handlers;
