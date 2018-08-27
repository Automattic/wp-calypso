/** @format */

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	fetchShippingClassesFailure,
	fetchShippingClassesSuccess,
} from 'woocommerce/state/sites/shipping-classes/actions';
import {
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SHIPPING_CLASS_DELETE,
	WOOCOMMERCE_SHIPPING_CLASS_DELETED,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATE,
	WOOCOMMERCE_SHIPPING_CLASS_CREATE,
	WOOCOMMERCE_SHIPPING_CLASS_CREATED,
} from 'woocommerce/state/action-types';
import { verifyResponseHasData } from 'woocommerce/state/data-layer/utils';

export const fetch = action => {
	const { siteId } = action;
	return request( siteId, action ).get( 'products/shipping_classes' );
};

const onError = ( action, error ) => dispatch => {
	dispatch( fetchShippingClassesFailure( action, error, dispatch ) );
};

const onSuccess = ( { siteId }, { data } ) => dispatch => {
	dispatch( fetchShippingClassesSuccess( siteId, data ) );
};

export default {
	[ WOOCOMMERCE_SHIPPING_CLASSES_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
			fromApi: verifyResponseHasData,
		} ),
	],

	[ WOOCOMMERCE_SHIPPING_CLASS_UPDATE ]: [
		dispatchRequestEx( {
			fetch: action => {
				const { siteId, id, changes } = action;

				return request( siteId, action ).put( 'products/shipping_classes/' + id, changes );
			},
			onSuccess: ( { siteId }, { data } ) => dispatch => {
				// @todo
				dispatch( {
					type: 'WOOCOMMERCE_SHIPPING_CLASS_UPDATED',
					siteId,
					data,
				} );
			},
			onError: ( action, error ) => dispatch => {
				dispatch( fetchShippingClassesFailure( action, error, dispatch ) );
			},
			fromApi: verifyResponseHasData,
		} ),
	],

	[ WOOCOMMERCE_SHIPPING_CLASS_CREATE ]: [
		dispatchRequestEx( {
			fetch: action => {
				const { siteId, data } = action;

				return request( siteId, action ).post( 'products/shipping_classes/', data );
			},
			onSuccess: ( { siteId, temporaryId }, { data } ) => dispatch => {
				dispatch( {
					type: WOOCOMMERCE_SHIPPING_CLASS_CREATED,
					siteId,
					data,
					temporaryId,
				} );
			},
			onError: ( action, error ) => dispatch => {
				dispatch( fetchShippingClassesFailure( action, error, dispatch ) );
			},
			fromApi: verifyResponseHasData,
		} ),
	],

	[ WOOCOMMERCE_SHIPPING_CLASS_DELETE ]: [
		dispatchRequestEx( {
			fetch: action => {
				const { siteId, classId } = action;

				return request( siteId, action ).del(
					'products/shipping_classes/' + classId + '?force=true'
				);
			},
			onSuccess: ( { siteId, classId } ) => dispatch => {
				dispatch( {
					type: WOOCOMMERCE_SHIPPING_CLASS_DELETED,
					siteId,
					classId,
				} );
			},
			onError: ( action, error ) => dispatch => {
				dispatch( fetchShippingClassesFailure( action, error, dispatch ) );
			},
			fromApi: verifyResponseHasData,
		} ),
	],
};
