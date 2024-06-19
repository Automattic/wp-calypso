/* eslint-disable no-restricted-imports */

import { useSupportAvailability } from '../data/use-support-availability';
import { useShouldUseWapuu } from './use-should-use-wapuu';

export function useStillNeedHelpURL() {
	const { data: supportAvailability, isLoading } = useSupportAvailability();
	const shouldUseWapuu = useShouldUseWapuu();
	const isFreeUser = ! supportAvailability?.is_user_eligible;

	if ( ! isFreeUser ) {
		const url = shouldUseWapuu ? '/odie' : '/contact-options';
		return { url, isLoading: false };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
