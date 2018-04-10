/** @format */

/**
 * External dependencies
 */
import { get, isNull } from 'lodash';

/**
 * Internal dependencies
 */
import { getGeoCountryShort } from 'state/geo/selectors';

/**
 * Returns the current payment country.
 *
 * @param {Object} state - The current global state tree.
 * @return {?string} - The current payment country, or null.
 */
export default function getPaymentCountryCode( state ) {
	const countryCode = get( state, 'ui.payment.countryCode', null );

	if ( ! isNull( countryCode ) ) {
		return countryCode;
	}

	// Fall back on GeoIP if the user hasn't selected a payment country yet.
	return getGeoCountryShort( state );
}
