/**
 * External dependencies.
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import { errorNotice, removeNotice } from 'state/notices/actions';
import {
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { areShippingClassesLoaded, areShippingClassesLoading } from './selectors';

export const fetchShippingClassesSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS,
		siteId,
		data,
	};
};

export const fetchShippingClassesFailure = ( action, error, dispatch ) => {
	const { siteId } = action;
	const noticeId = 'query-shipping-classes-retry';

	const onRetryClick = ( e ) => {
		e.preventDefault();

		dispatch( {
			type: WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
			siteId,
		} );

		dispatch( removeNotice( noticeId ) );
	};

	return errorNotice( translate( 'Could not retrieve the shipping classes.' ), {
		id: noticeId,
		button: translate( 'Try again' ),
		onClick: onRetryClick,
	} );
};

export const fetchShippingClasses = ( siteId ) => ( dispatch, getState ) => {
	if (
		areShippingClassesLoaded( getState(), siteId ) ||
		areShippingClassesLoading( getState(), siteId )
	) {
		return;
	}

	return dispatch( {
		type: WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
		siteId,
	} );
};
