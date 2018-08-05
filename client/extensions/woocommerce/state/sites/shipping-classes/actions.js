/** @format */

/**
 * Internal dependencies
 */

import { errorNotice } from 'state/notices/actions';
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

export const fetchShippingClassesFailure = () => {
	return errorNotice(
		`Could not retrieve the shipping classes for this website. Please refresh and try again!`
	);
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
