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
	WOOCOMMERCE_SHIPPING_CLASS_DELETED,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATE,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATED,
	WOOCOMMERCE_SHIPPING_CLASS_CREATE,
	WOOCOMMERCE_SHIPPING_CLASS_CREATED,
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

	const onRetryClick = e => {
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

/**
 * Updates an existing shipping class.
 *
 * @param  {number}   siteId          Site ID.
 * @param  {number}   id              The ID of the shipping class.
 * @param  {Object}   changes         All changes that have been done to the shipping class.
 * @param  {function} successCallback A callback that might be executed on success (Optional).
 * @param  {function} failureCallback A callback that might be executed on failure (Optional).
 * @return {Object}                   An action object.
 */
export const updateShippingClass = ( siteId, id, changes, successCallback, failureCallback ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASS_UPDATE,
		siteId,
		id,
		changes,
		successCallback,
		failureCallback,
	};
};

/**
 * Indicates that a shipping class has been updated.
 *
 * @param  {number} siteId Site ID.
 * @param  {Object} data   The data of the shipping class.
 * @return {Object}        An action object.
 */
export const updateShippingClassSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASS_UPDATED,
		siteId,
		data,
	};
};

/**
 * Generates an error notice for when a shipping class could not be updated.
 *
 * @return {Object} An action object.
 */
export const updateShippingClassFailure = () => {
	return errorNotice( translate( 'A shipping class could not be updated.' ) );
};

/**
 * Attempts to create a shipping class.
 *
 * @param  {number}   siteId          Site ID.
 * @param  {string}   temporaryId     An ID that has temporarily been assigned to the class.
 * @param  {Object}   data            All changes that have been done to the shipping class.
 * @param  {function} successCallback A callback that might be executed on success (Optional).
 * @param  {function} failureCallback A callback that might be executed on failure (Optional).
 * @return {Object}                   An action object.
 */
export const createShippingClass = (
	siteId,
	temporaryId,
	data,
	successCallback,
	failureCallback
) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASS_CREATE,
		siteId,
		data,
		successCallback,
		failureCallback,
		temporaryId,
	};
};

/**
 * Indicates that a shipping class has been created.
 *
 * @param  {Object} action The action that triggered the creation process.
 * @param  {Object} data   The data of the shipping class.
 * @return {Object}        An action object.
 */
export const createShippingClassSuccess = ( { siteId, temporaryId }, data ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASS_CREATED,
		siteId,
		data,
		temporaryId,
	};
};

/**
 * Generates an error notice for when a shipping class could not be created.
 *
 * @return {Object}        An action object.
 */
export const createShippingClassFailure = () => {
	return errorNotice( translate( 'A shipping class could not be saved.' ) );
};

/**
 * Attempts to delete a shipping class.
 *
 * @param  {number}   siteId          Site ID.
 * @param  {number}   classId         The ID of the shipping class.
 * @param  {function} successCallback A callback that might be executed on success (Optional).
 * @param  {function} failureCallback A callback that might be executed on failure (Optional).
 * @return {Object}                   An action object.
 */
export const deleteShippingClass = ( siteId, classId, successCallback, failureCallback ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASS_DELETE,
		siteId,
		classId,
		successCallback,
		failureCallback,
	};
};

/**
 * Indicates that a shipping class has been updated.
 *
 * @param  {number} siteId  Site ID.
 * @param  {number} classId ID of the deleted shipping class.
 * @return {Object}         An action object.
 */
export const deleteShippingClassSuccess = ( siteId, classId ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASS_DELETED,
		siteId,
		classId,
	};
};

/**
 * Generates an error notice for when a shipping class could not be deleted.
 *
 * @return {Object} An action object.
 */
export const deleteShippingClassFailure = () => {
	return errorNotice( translate( 'A shipping class could not be deleted.' ) );
};
