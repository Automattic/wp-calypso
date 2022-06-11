import { useHas3PC, useSupportAvailability } from '@automattic/data-stores';

export function useStillNeedHelpURL() {
	const { data: supportAvailability } = useSupportAvailability( 'OTHER' );
	const { hasCookies } = useHas3PC();
	// email support is available for all non-free users, let's use it as a proxy for free users
	// TODO: check purchases instead
	const isFreeUser =
		! supportAvailability?.is_user_eligible_for_kayako &&
		! supportAvailability?.is_user_eligible_for_upwork;
	debugger;

	if ( ! isFreeUser ) {
		return '/contact-options';
	}
	if ( supportAvailability?.is_user_eligible_for_directly && hasCookies ) {
		return '/contact-form?mode=DIRECTLY';
	}

	return '/contact-form?mode=FORUM';
}
