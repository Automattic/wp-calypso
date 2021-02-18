/**
 * External dependencies
 */
import { get, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

const getShippingMethodSchemas = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'woocommerceServices', siteId, 'shippingMethodSchemas' ],
		{}
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {string} methodId Shipping method ID
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the schema for the given shipping method has been successfully loaded from the server
 */
export const isShippingMethodSchemaLoaded = (
	state,
	methodId,
	siteId = getSelectedSiteId( state )
) => {
	return isObject( getShippingMethodSchemas( state, siteId )[ methodId ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {string} methodId Shipping method ID
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object|null} The shipping method schema object, or "null" if the schema hasn't been retrieved yet
 */
export const getShippingMethodSchema = ( state, methodId, siteId = getSelectedSiteId( state ) ) => {
	return isShippingMethodSchemaLoaded( state, methodId, siteId )
		? getShippingMethodSchemas( state, siteId )[ methodId ]
		: null;
};

/**
 * @param {object} state Whole Redux state tree
 * @param {string} methodId Shipping method ID
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping method schema is currently being retrieved from the server
 */
export const isShippingMethodSchemaLoading = (
	state,
	methodId,
	siteId = getSelectedSiteId( state )
) => {
	return LOADING === getShippingMethodSchemas( state, siteId )[ methodId ];
};
