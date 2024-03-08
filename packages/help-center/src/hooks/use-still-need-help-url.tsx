/* eslint-disable no-restricted-imports */

import { useSupportAvailability } from '../data/use-support-availability';
import { useIsWapuuEnabled } from './use-is-wapuu-enabled';

export function useStillNeedHelpURL() {
	const { data: supportAvailability, isLoading } = useSupportAvailability( 'OTHER' );
	const isWapuuEnabled = useIsWapuuEnabled();
	const isFreeUser = ! supportAvailability?.is_user_eligible_for_tickets;

	if ( ! isFreeUser ) {
		const url = isWapuuEnabled ? '/odie' : '/contact-options';
		return { url, isLoading: false };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
