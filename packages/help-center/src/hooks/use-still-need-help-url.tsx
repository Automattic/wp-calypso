/* eslint-disable no-restricted-imports */
import { useHas3PC, useSupportAvailability } from '@automattic/data-stores';
import { canAccessWpcomApis } from 'wpcom-proxy-request';

export function useStillNeedHelpURL() {
	const { hasCookies } = useHas3PC();
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

	if ( supportAvailability?.is_user_eligible_for_directly && hasCookies ) {
		return { url: '/contact-form?mode=DIRECTLY', isLoading };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
