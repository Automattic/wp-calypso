/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPaymentCurrencySettings, areSettingsGeneralLoaded } from 'woocommerce/state/sites/settings/general/selectors';

const getCurrencyEdits = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'payments', siteId, 'currency' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of payment methods that the UI should show. That will be the list of methods returned by
 * the wc-api with the edits "overlayed" on top of them.
 */
export const getCurrencyWithEdits = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areSettingsGeneralLoaded( state, siteId ) ) {
		return '';
	}
	const currency = getPaymentCurrencySettings( state, siteId ).value;
	const edits = getCurrencyEdits( state, siteId );
	if ( ! edits ) {
		return currency;
	}
	return edits;
};
