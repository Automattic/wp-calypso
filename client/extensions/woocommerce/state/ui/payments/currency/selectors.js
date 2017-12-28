/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'client/state/ui/selectors';
import {
	getPaymentCurrencySettings,
	areSettingsGeneralLoaded,
} from 'client/extensions/woocommerce/state/sites/settings/general/selectors';

const getCurrencyEdits = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'payments', siteId, 'currency' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {String} Returns the currently set currency with any local edits.
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
