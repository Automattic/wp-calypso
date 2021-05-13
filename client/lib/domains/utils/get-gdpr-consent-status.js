/**
 * Internal dependencies
 */
import { gdprConsentStatus } from 'calypso/lib/domains/constants';

export function getGdprConsentStatus( domainFromApi ) {
	switch ( domainFromApi.gdpr_consent_status ) {
		case 'NONE':
			return gdprConsentStatus.NONE;
		case 'PENDING':
			return gdprConsentStatus.PENDING;
		case 'PENDING_ASYNC':
			return gdprConsentStatus.PENDING_ASYNC;
		case 'ACCEPTED_CONTRACTUAL_MINIMUM':
			return gdprConsentStatus.ACCEPTED_CONTRACTUAL_MINIMUM;
		case 'ACCEPTED_FULL':
			return gdprConsentStatus.ACCEPTED_FULL;
		case 'DENIED':
			return gdprConsentStatus.DENIED;
		case 'FORCED_ALL_CONTRACTUAL':
			return gdprConsentStatus.FORCED_ALL_CONTRACTUAL;
		default:
			return null;
	}
}
