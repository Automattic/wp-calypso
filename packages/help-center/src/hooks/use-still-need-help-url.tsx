/* eslint-disable no-restricted-imports */
import { useSupportAvailability } from '@automattic/data-stores';

export function useStillNeedHelpURL() {
	const { data: supportAvailability, isLoading } = useSupportAvailability( 'OTHER' );

	const isFreeUser = ! supportAvailability?.is_user_eligible_for_tickets;
	if ( ! isFreeUser ) {
		return { url: '/contact-options', isLoading };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
