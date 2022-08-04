/* eslint-disable no-restricted-imports */
import { useHas3PC, useSupportAvailability } from '@automattic/data-stores';
import { shouldTargetWpcom } from '@automattic/help-center';
import { useSelector } from 'react-redux';
import getIsSimpleSite from 'calypso/state/sites/selectors/is-simple-site';

export function useStillNeedHelpURL() {
	const { hasCookies } = useHas3PC();
	const isSimpleSite: boolean = useSelector( ( state ) => getIsSimpleSite( state ) );
	const canUseWpcomApis = Boolean( shouldTargetWpcom( isSimpleSite ) );
	const { data: supportAvailability } = useSupportAvailability( 'OTHER', canUseWpcomApis );

	// email support is available for all non-free users, let's use it as a proxy for free users
	// TODO: check purchases instead
	const isFreeUser = ! supportAvailability?.is_user_eligible_for_tickets;

	if ( ! canUseWpcomApis ) {
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
