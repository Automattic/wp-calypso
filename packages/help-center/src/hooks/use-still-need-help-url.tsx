/* eslint-disable no-restricted-imports */
import { useSupportAvailability } from '../data/use-support-availability';

export function useStillNeedHelpURL() {
	const { data: supportAvailability, isLoading } = useSupportAvailability( 'OTHER' );

	const isFreeUser = ! supportAvailability?.is_user_eligible_for_tickets;
	if ( ! isFreeUser ) {
		return { url: '/contact-options', isLoading };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
