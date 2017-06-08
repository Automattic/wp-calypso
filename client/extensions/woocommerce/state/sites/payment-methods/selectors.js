/**
 * External dependencies
 */
import { get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} Object containing payment methods
 */
export const getApiPaymentMethods = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'paymentMethods' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the payment methods list has been successfully loaded from the server
 */
export const arePaymentMethodsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getApiPaymentMethods( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the payment methods list is currently being retrieved from the server
 */
export const arePaymentMethodsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getApiPaymentMethods( state, siteId );
};
