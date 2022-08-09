/* eslint-disable no-restricted-imports */
import { useHas3PC, useSupportAvailability } from '@automattic/data-stores';
import { canAccessWpcomApis } from 'wpcom-proxy-request';

export function useStillNeedHelpURL() {
	const { hasCookies } = useHas3PC();
	console.log( 'canAccessWpcomApis()', canAccessWpcomApis());
	const { data: supportAvailability } = useSupportAvailability( 'OTHER', canAccessWpcomApis() );

	// email support is available for all non-free users, let's use it as a proxy for free users
	// TODO: check purchases instead
	const isFreeUser = ! supportAvailability?.is_user_eligible_for_tickets;

	if ( ! canAccessWpcomApis() ) {
		return 'https://wordpress.com/help/contact';
	}

	if ( ! isFreeUser ) {
		return '/contact-options';
	}

	if ( supportAvailability?.is_user_eligible_for_directly && hasCookies ) {
		return '/contact-form?mode=DIRECTLY';
	}

	return '/contact-form?mode=FORUM';
}
