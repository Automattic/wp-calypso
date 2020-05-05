/**
 * External dependencies
 */
import { forEach, isEmpty, omit, startsWith } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_OPEN,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_OPENED_ENABLED,
} from 'woocommerce/state/action-types';
import { getCurrentlyOpenShippingZoneMethod } from 'woocommerce/state/ui/shipping/zones/methods/selectors';
import { errorNotice } from 'state/notices/actions';
import getFormErrors from 'woocommerce/woocommerce-services/state/service-settings/selectors/errors';
import { updateField } from 'woocommerce/woocommerce-services/state/service-settings/actions';

/**
 * Adds a new shipping method to the shipping zone currently being edited.
 *
 * @param {number} siteId Site ID.
 * @param {string} methodType Type of shipping method to add. For example, "free_shipping", "local_pickup".
 * @param {string} title Title of the new method.
 * @returns {object} Action object.
 */
export const addMethodToShippingZone = ( siteId, methodType, title ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD, siteId, methodType, title };
};

/**
 * Opens the shipping method for editing
 *
 * @param {number} siteId Site ID.
 * @param {number|object} methodId ID of the shipping method to open.
 * @returns {object} Action object.
 */
export const openShippingZoneMethod = ( siteId, methodId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_OPEN, siteId, methodId };
};

/**
 * Closes the currently edited shipping method and discards the changes
 *
 * @param {number} siteId Site ID.
 * @returns {object} Action object.
 */
export const cancelShippingZoneMethod = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CANCEL, siteId };
};

/**
 * Closes the currently edited shipping method and saves the changes
 *
 * @param {number} siteId Site ID.
 * @returns {object} Action object.
 */
export const closeShippingZoneMethod = ( siteId ) => ( dispatch, getState ) => {
	const method = getCurrentlyOpenShippingZoneMethod( getState(), siteId );
	// Perform validation if the method is from WooCommerce Services
	if ( startsWith( method.methodType, 'wc_services' ) ) {
		const methodFields = omit( method, [ 'id', 'enabled', 'methodType' ] );
		// Mark all the fields as "interacted with" to trigger a full validation
		forEach( methodFields, ( value, key ) =>
			dispatch( updateField( siteId, method.id, key, value ) )
		);
		if ( ! isEmpty( getFormErrors( getState(), siteId ) ) ) {
			return dispatch(
				errorNotice(
					translate(
						'There was a problem with one or more entries. ' +
							'Please fix the errors below and try saving again.'
					),
					{ duration: 5000 }
				)
			);
		}
	}
	dispatch( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE, siteId } );
};

/**
 * Removes the given shipping method from the shipping zone currently being edited.
 *
 * @param {number} siteId Site ID.
 * @param {string} methodId ID of the shipping method to delete.
 * @returns {object} Action object.
 */
export const removeMethodFromShippingZone = ( siteId, methodId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE, siteId, methodId };
};

/**
 * Changes the opened shipping method into a shipping method of a new type. Note that, on save, this will remove the
 * shipping method from the shipping zone, and will create a new one of the given type.
 *
 * @param {number} siteId Site ID.
 * @param {string} methodType New shipping method type to switch to. For example, "free_shipping", "local_pickup".
 * @param {string} title New method title.
 * @returns {object} Action object.
 */
export const changeShippingZoneMethodType = ( siteId, methodType, title ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE, siteId, methodType, title };
};

/**
 * Changes the title of the opened shipping method.
 *
 * @param {number} siteId Site ID.
 * @param {string} title New user-facing title for the shipping method.
 * @returns {object} Action object.
 */
export const changeShippingZoneMethodTitle = ( siteId, title ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE, siteId, title };
};

/**
 * Enables or disables the opened shipping zone method. Does not change the state of the actual method until saved
 *
 * @param {number} siteId Site ID.
 * @param {boolean} enabled Whether to enable (true) or disable (false) the shipping method.
 * @returns {object} Action object.
 */
export const toggleOpenedShippingZoneMethodEnabled = ( siteId, enabled ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_OPENED_ENABLED, siteId, enabled };
};

/**
 * Enables or disables the given shipping zone method.
 *
 * @param {number} siteId Site ID.
 * @param {number|object} methodId ID of the shipping method.
 * @param {boolean} enabled Whether to enable (true) or disable (false) the shipping method.
 * @returns {object} Action object.
 */
export const toggleShippingZoneMethodEnabled = ( siteId, methodId, enabled ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED, siteId, methodId, enabled };
};
