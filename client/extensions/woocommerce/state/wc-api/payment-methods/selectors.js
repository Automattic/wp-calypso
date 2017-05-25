/**
 * External dependencies
 */
import { get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from './reducer';

const getRawPaymentMethods = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'wcApi', siteId, 'paymentMethods' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the payment methods list has been successfully loaded from the server
 */
export const arePaymentMethodsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawPaymentMethods( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the payment methods list is currently being retrieved from the server
 */
export const arePaymentMethodsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawPaymentMethods( state, siteId );
};

/**
 * Gets group of payment methods. (offline, off-site, on-site)
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId wpcom site id
 * @param {String} type type of payment method
 * @return {Array} Array of Payment Methods
 */
export function getPaymentMethodsGroup( state, siteId, type ) {
	const wcApi = state.extensions.woocommerce.wcApi || {};
	const siteData = wcApi[ siteId ] || {};
	let methods;
	if ( ! Array.isArray( siteData.paymentMethods ) ) {
		methods = [];
	} else {
		methods = siteData.paymentMethods.filter( ( method ) => {
			return method.methodType === type;
		} );
	}
	return methods || [];
}
