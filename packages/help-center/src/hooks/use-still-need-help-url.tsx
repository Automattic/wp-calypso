/* eslint-disable no-restricted-imports */

import { useSupportStatus } from '../data/use-support-status';
import { useShouldUseWapuu } from './use-should-use-wapuu';

export function useStillNeedHelpURL( forceContactForm = false ) {
	const { data: supportStatus, isLoading } = useSupportStatus();
	const shouldUseWapuu = useShouldUseWapuu();
	const isEligibleForSupport = Boolean( supportStatus?.eligibility?.is_user_eligible );

	if ( isEligibleForSupport && shouldUseWapuu && ! forceContactForm ) {
		return { url: '/odie', isLoading: false };
	}

	if ( isEligibleForSupport ) {
		return { url: '/contact-options', isLoading: false };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
