/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_REMOVE,
} from '../../../action-types';

export const addShippingZone = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_ADD } );

export const editShippingZone = ( index ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_EDIT, index } );

export const cancelEditingShippingZone = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_CANCEL } );

// TODO: Trigger some client-side validation here
export const closeEditingShippingZone = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_CLOSE } );

export const removeShippingZone = ( index ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_REMOVE, index } );

export const addLocationToShippingZone = ( locationType, locationCode ) => ( {
	type: WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD,
	locationType,
	locationCode
} );

export const removeLocationFromShippingZone = ( locationType, locationCode ) => ( {
	type: WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE,
	locationType,
	locationCode
} );

export const addShippingMethod = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD } );

export const changeShippingMethodType = ( index, newType ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE, index, newType } );

export const editShippingMethod = ( index, field, value ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT, index, field, value } );

export const removeShippingMethod = ( index ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE, index } );
