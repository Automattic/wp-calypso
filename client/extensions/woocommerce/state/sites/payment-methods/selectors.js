/**
 * External dependencies
 */

import { find, get, isArray } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} Object containing payment methods
 */
export const getPaymentMethods = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'paymentMethods' ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {string} methodId Method to fetch (if exists)
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} Object with payment method data, false if no method found
 */
export const getPaymentMethod = ( state, methodId, siteId = getSelectedSiteId( state ) ) => {
	if ( methodId === 'calypso_manual' ) {
		return {
			id: 'calypso_manual',
			title: translate( 'Manual Payment' ),
			description: '', // Not used for this method
			enabled: true,
			method_title: 'calypso_manual',
			methodType: 'offline',
			method_description: '', // Not used for this method
			method_supports: [ 'products' ],
		};
	}
	const methods = getPaymentMethods( state, siteId );
	return find( methods, { id: methodId } ) || false;
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the payment methods list has been successfully loaded from the server
 */
export const arePaymentMethodsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getPaymentMethods( state, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the payment methods list is currently being retrieved from the server
 */
export const arePaymentMethodsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getPaymentMethods( state, siteId );
};
