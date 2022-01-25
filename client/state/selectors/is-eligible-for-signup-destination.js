import { retrieveSignupDestination } from 'calypso/signup/storageUtils';

/**
 * @returns {boolean} true if the current user is able to see the checklist after checkout
 */
export default function isEligibleForSignupDestination() {
	return Boolean( retrieveSignupDestination() );
}
