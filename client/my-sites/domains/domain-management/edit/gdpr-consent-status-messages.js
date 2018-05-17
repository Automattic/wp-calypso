/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { gdprConsentStatus } from 'lib/domains/constants';

function getGdprConsentStatusMessage( domain ) {
	switch ( domain.gdprConsentStatus ) {
		case gdprConsentStatus.NONE:
			return translate( 'Not available' );
		case gdprConsentStatus.PENDING:
			return translate( 'Pending registrar response' );
		case gdprConsentStatus.PENDING_ASYNC:
			return translate( 'Awaiting owner response' );
		case gdprConsentStatus.ACCEPTED_CONTRACTUAL_MINIMUM:
			return translate( 'Only for contractual needs' );
		case gdprConsentStatus.ACCEPTED_FULL:
			return translate( 'Full use of data allowed' );
		case gdprConsentStatus.DENIED:
			return translate( 'All use of non-contract data is denied' );
		case gdprConsentStatus.FORCED_ALL_CONTRACTUAL:
			return translate( 'Not required--only data for contract was collected' );
		default:
			return translate( 'Unavailable' );
	}
}

export { getGdprConsentStatusMessage };
