import page from '@automattic/calypso-router';
import { useEffect } from 'react';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useSelector } from 'calypso/state';
import {
	getActiveAgency,
	hasFetchedAgency,
	isFetchingAgency,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import SignupForm from '../../signup-form';

export default function AgencySignup() {
	const agency = useSelector( getActiveAgency );
	const hasFetched = useSelector( hasFetchedAgency );
	const isFetching = useSelector( isFetchingAgency );

	useEffect( () => {
		if ( agency ) {
			// Redirect to the sites page if the user already has an agency record.
			page.redirect( A4A_SITES_LINK );
		}
	}, [ agency ] );

	// Show nothing if we haven't fetched the agency record yet, or if we're in the process of fetching it.
	if ( ! hasFetched || isFetching || agency ) {
		return null;
	}

	return <SignupForm />;
}
