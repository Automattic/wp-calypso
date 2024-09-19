import page from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import { A4A_OVERVIEW_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useSelector } from 'calypso/state';
import {
	getActiveAgency,
	hasFetchedAgency,
	isFetchingAgency,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import SignupIntro from '../../intro';
import SignupForm from '../../signup-form';

export default function AgencySignup() {
	const userLoggedIn = useSelector( isUserLoggedIn );
	const agency = useSelector( getActiveAgency );
	const hasFetched = useSelector( hasFetchedAgency );
	const isFetching = useSelector( isFetchingAgency );

	const showSignupIntro = getQueryArg( window.location.href, 'source' ) === 'client-plugin';
	const wpAdminUrl = getQueryArg( window.location.href, 'wp-admin-url' ) as string;

	useEffect( () => {
		if ( agency ) {
			// Redirect to the sites page if the user already has an agency record.
			page.redirect( A4A_OVERVIEW_LINK );
		}
	}, [ agency ] );

	// Show nothing if we haven't fetched the agency record yet, or if we're in the process of fetching it.
	if ( userLoggedIn && ( ! hasFetched || isFetching || agency ) ) {
		return null;
	}

	return (
		<>
			{ showSignupIntro && <SignupIntro wpAdminUrl={ wpAdminUrl } /> }
			<SignupForm />
		</>
	);
}
