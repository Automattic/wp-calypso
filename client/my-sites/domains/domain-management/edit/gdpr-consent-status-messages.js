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
	let message;

	switch ( domain.gdprConsentStatus ) {
		case gdprConsentStatus.NONE:
			message = translate( 'Not available' );
			break;
		case gdprConsentStatus.PENDING:
			message = translate( 'Pending registrar response' );
			break;
		case gdprConsentStatus.PENDING_ASYNC:
			message = translate( 'Awaiting owner response' );
			break;
		case gdprConsentStatus.ACCEPTED_CONTRACTUAL_MINIMUM:
			message = translate( 'Only for contractual needs' );
			break;
		case gdprConsentStatus.ACCEPTED_FULL:
			message = translate( 'Full use of data allowed' );
			break;
		case gdprConsentStatus.DENIED:
			message = translate( 'All use of non-contract data is denied' );
			break;
		case gdprConsentStatus.FORCED_ALL_CONTRACTUAL:
			message = translate( 'Not required--only data for contract was collected' );
			break;
		default:
			message = translate( 'Unavailable' );
	}

	return message;
}

export { getGdprConsentStatusMessage };
