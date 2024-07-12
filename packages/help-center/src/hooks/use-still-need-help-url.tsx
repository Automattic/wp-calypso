/* eslint-disable no-restricted-imports */

import { useSupportStatus } from '../data/use-support-status';
import { useShouldUseWapuu } from './use-should-use-wapuu';

export function useStillNeedHelpURL() {
	const { data: supportStatus, isLoading } = useSupportStatus();
	const shouldUseWapuu = useShouldUseWapuu();
	const isEligibleForSupport = Boolean( supportStatus?.eligibility?.is_user_eligible );

	if ( isEligibleForSupport ) {
		const url = shouldUseWapuu ? '/messenger' : '/contact-options';
		return { url, isLoading: false };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
