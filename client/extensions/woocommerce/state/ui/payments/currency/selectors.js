/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	getPaymentCurrencySettings,
	areSettingsGeneralLoaded,
} from 'woocommerce/state/sites/settings/general/selectors';

export const getCurrencyEdits = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'payments', siteId, 'currency' ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {string} Returns the currently set currency with any local edits.
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
