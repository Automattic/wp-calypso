/* eslint-disable no-restricted-imports */
import { useSupportAvailability } from '@automattic/data-stores';
import { canAccessWpcomApis } from 'wpcom-proxy-request';

export function useStillNeedHelpURL() {
	const { data: supportAvailability, isLoading } = useSupportAvailability(
		'OTHER',
		canAccessWpcomApis()
	);

	// email support is available for all non-free users, let's use it as a proxy for free users
	// TODO: check purchases instead
	const isFreeUser = ! supportAvailability?.is_user_eligible_for_tickets;

	if ( ! canAccessWpcomApis() ) {
		return { url: 'https://wordpress.com/help/contact', isLoading };
	}

	if ( ! isFreeUser ) {
		return { url: '/contact-options', isLoading };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
