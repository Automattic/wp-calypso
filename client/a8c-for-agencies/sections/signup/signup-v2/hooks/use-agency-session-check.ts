import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useEffect } from 'react';
import { ONBOARDING_TOUR_HASH } from 'calypso/a8c-for-agencies/components/hoc/with-onboarding-tour/hooks/use-onboarding-tour';
import { A4A_OVERVIEW_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useSelector } from 'calypso/state';
import {
	getActiveAgency,
	getAgencyFetchError,
	hasFetchedAgency,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

/**
 * Resolves the agency session for the signup flow: redirects logged-in users who
 * already have an agency to the overview, and reports whether we're still resolving
 * the session so the caller can show a loader instead of flashing the signup form.
 *
 * Returns `true` while the session is still being checked for a logged-in user.
 */
export default function useAgencySessionCheck() {
	const userLoggedIn = useSelector( isUserLoggedIn );
	const currentAgency = useSelector( getActiveAgency );
	const hasFetched = useSelector( hasFetchedAgency );
	const fetchError = useSelector( getAgencyFetchError );

	useEffect( () => {
		if ( currentAgency ) {
			if ( isEnabled( 'a4a-unified-onboarding-tour' ) ) {
				page.redirect( `${ A4A_OVERVIEW_LINK }${ ONBOARDING_TOUR_HASH }` );
			} else {
				page.redirect( A4A_OVERVIEW_LINK );
			}
		}
	}, [ currentAgency ] );

	// Agencies are never fetched for logged-out visitors, so they never enter the
	// checking state. For logged-in users we keep checking until the fetch settles
	// (success or error, so a failed fetch still falls through to the form), and we
	// keep the loader up once an agency is found while the redirect above runs.
	if ( ! userLoggedIn ) {
		return false;
	}

	const hasResolved = hasFetched || !! fetchError;
	return ! hasResolved || !! currentAgency;
}
