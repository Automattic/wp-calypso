/** @format */
/**
 * External dependencies
 */
import { find, get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of shipping methods, as retrieved from the server. It can also be the string "LOADING"
 * if the methods are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
export const getShippingMethods = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'shippingMethods' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping methods list has been successfully loaded from the server
 */
export const areShippingMethodsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getShippingMethods( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping methods list is currently being retrieved from the server
 */
export const areShippingMethodsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getShippingMethods( state, siteId );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number|Object} id Shipping method ID
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The shipping method definition, or an object with dummy (but valid) values if it wasn't found
 */
export const getShippingMethod = ( state, id, siteId = getSelectedSiteId( state ) ) => {
	if ( areShippingMethodsLoaded( state, siteId ) ) {
		const method = find( getShippingMethods( state, siteId ), { id } );
		if ( method ) {
			return method;
		}
	}
	return { id, title: id, description: '' };
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Function} utility function taking method type as an argument and returning a matched type
 */
export const getShippingMethodNameMap = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areShippingMethodsLoaded( state, siteId ) ) {
			return typeId => typeId;
		}

		const map = getShippingMethods( state, siteId ).reduce( ( result, { id, title } ) => {
			result[ id ] = title;
			return result;
		}, {} );

		return typeId => map[ typeId ] || typeId;
	},
	[ areShippingMethodsLoaded, getShippingMethods ]
);
