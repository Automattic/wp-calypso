/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { every, filter, find, get, isArray, some, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isWcsEnabled } from 'woocommerce/state/selectors/plugins';
import { LOADING } from 'woocommerce/state/constants';
import {
	isShippingMethodSchemaLoaded,
	isShippingMethodSchemaLoading,
} from 'woocommerce/woocommerce-services/state/shipping-method-schemas/selectors';

/*
 * By default, those methods are called "XXXX (WooCommerce Services)".
 * We aren't pushing the "WooCommerce Services" brand anywhere in Calypso, so the method names must be changed.
 */
const METHOD_NAMES = {
	wc_services_usps: translate( 'USPS', { comment: 'United States Postal Services' } ),
	wc_services_canada_post: translate( 'Canada Post' ),
	wc_services_fedex: translate( 'FedEx' ),
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The list of shipping methods, as retrieved from the server. It can also be the string "LOADING"
 * if the methods are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
export const getShippingMethods = ( state, siteId = getSelectedSiteId( state ) ) => {
	const allMethods = get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'shippingMethods',
	] );
	if ( ! isArray( allMethods ) ) {
		return allMethods;
	}
	const availableMethods = isWcsEnabled( state, siteId )
		? allMethods
		: filter( allMethods, ( { id } ) => ! startsWith( id, 'wc_services' ) );
	return availableMethods.map( ( method ) => ( {
		...method,
		title: METHOD_NAMES[ method.id ] || method.title,
	} ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping methods list has been successfully loaded from the server
 */
export const areShippingMethodsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! isArray( getShippingMethods( state, siteId ) ) ) {
		return false;
	}
	const wcsMethods = filter( getShippingMethods( state, siteId ), ( { id } ) =>
		startsWith( id, 'wc_services' )
	);
	return every( wcsMethods, ( { id } ) => isShippingMethodSchemaLoaded( state, id, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping methods list is currently being retrieved from the server
 */
export const areShippingMethodsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( LOADING === getShippingMethods( state, siteId ) ) {
		return true;
	}
	const wcsMethods = filter( getShippingMethods( state, siteId ), ( { id } ) =>
		startsWith( id, 'wc_services' )
	);
	return some( wcsMethods, ( { id } ) => isShippingMethodSchemaLoading( state, id, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number|object} id Shipping method ID
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} The shipping method definition, or an object with dummy (but valid) values if it wasn't found
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
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Function} utility function taking method type as an argument and returning a matched type
 */
export const getShippingMethodNameMap = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areShippingMethodsLoaded( state, siteId ) ) {
			return ( typeId ) => typeId;
		}

		const map = getShippingMethods( state, siteId ).reduce( ( result, { id, title } ) => {
			result[ id ] = title;
			return result;
		}, {} );

		return ( typeId ) => map[ typeId ] || typeId;
	},
	[ areShippingMethodsLoaded, getShippingMethods ]
);
