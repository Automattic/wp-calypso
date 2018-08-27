/** @format */

/**
 * Internal dependencies
 */

import { translate } from 'i18n-calypso';
import { errorNotice, removeNotice } from 'state/notices/actions';
import {
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS,
	WOOCOMMERCE_SHIPPING_CLASS_DELETE,
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
	let noticeAction = null;

	const onRetryClick = e => {
		const {
			notice: { noticeId },
		} = noticeAction;

		e.preventDefault();

		dispatch( {
			type: WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
			siteId,
		} );

		dispatch( removeNotice( noticeId ) );
	};

	noticeAction = errorNotice( translate( 'Could not retrieve the shipping classes.' ), {
		button: translate( 'Try again' ),
		onClick: onRetryClick,
	} );

	return noticeAction;
};

export const fetchShippingClasses = siteId => ( dispatch, getState ) => {
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

export const deleteShippingClass = ( siteId, classId ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASS_DELETE,
		siteId,
		classId,
	};
};
