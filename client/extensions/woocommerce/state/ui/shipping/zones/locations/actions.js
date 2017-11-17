/** @format */

/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_CONTINENT,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_COUNTRY,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_STATE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT_POSTCODE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_WHOLE_COUNTRY,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_STATE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_POSTCODE,
} from 'woocommerce/state/action-types';

/**
 * Opens the locations UI for editing them
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const openEditLocations = siteId => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT,
		siteId,
	};
};

/**
 * Closes the locations UI, saving any changes that were made
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const closeEditLocations = siteId => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CLOSE,
		siteId,
	};
};

/**
 * Closes the locations UI, discarding any changes that were made
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const cancelEditLocations = siteId => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_CANCEL,
		siteId,
	};
};

/**
 * Selects or un-selects a continent.
 * @param {Number} siteId Site ID.
 * @param {String} continentCode 2-letter continent code, such as EU (Europe) or NA (North America).
 * @param {Boolean} selected Whether the action was to select the continent (true), or to un-select it (false).
 * @return {Object} Action object.
 */
export const toggleContinentSelected = ( siteId, continentCode, selected ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_CONTINENT,
		siteId,
		continentCode,
		selected,
	};
};

/**
 * Selects or un-selects a country.
 * @param {Number} siteId Site ID.
 * @param {String} countryCode 2-letter ISO country code.
 * @param {Boolean} selected Whether the action was to select the country (true), or to un-select it (false).
 * @return {Object} Action object.
 */
export const toggleCountrySelected = ( siteId, countryCode, selected ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_COUNTRY,
		siteId,
		countryCode,
		selected,
	};
};

/**
 * Selects or un-selects a state.
 * @param {Number} siteId Site ID.
 * @param {String} stateCode 2-letter state code, such as CA (California).
 * @param {Boolean} selected Whether the action was to select the state (true), or to un-select it (false).
 * @return {Object} Action object.
 */
export const toggleStateSelected = ( siteId, stateCode, selected ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_SELECT_STATE,
		siteId,
		stateCode,
		selected,
	};
};

/**
 * Changes the value of the postcode range.
 * @param {Number} siteId Site ID.
 * @param {String} postcode New value for the postcode or postcode range.
 * @return {Object} Action object.
 */
export const editPostcode = ( siteId, postcode ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_EDIT_POSTCODE,
		siteId,
		postcode,
	};
};

/**
 * Sets the location filter to "Ship to whole country"
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const filterByWholeCountry = siteId => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_WHOLE_COUNTRY,
		siteId,
	};
};

/**
 * Sets the location filter to "Ship only to a few states of the selected country"
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const filterByState = siteId => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_STATE,
		siteId,
	};
};

/**
 * Sets the location filter to "Ship only to a postcode range of the selected country"
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const filterByPostcode = siteId => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FILTER_BY_POSTCODE,
		siteId,
	};
};
