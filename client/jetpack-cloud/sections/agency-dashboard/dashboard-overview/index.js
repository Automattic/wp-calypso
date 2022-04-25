import config from '@automattic/calypso-config';
import page from 'page';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Spinner from 'calypso/components/spinner';
import { isAgencyUser } from 'calypso/lib/partner/utils';
import {
	hasFetchedPartner,
	getCurrentPartner,
	isFetchingPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import SitesOverview from '../sites-overview';

export default function DashboardOverview() {
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const partner = useSelector( getCurrentPartner );
	const isAgency = isAgencyUser( partner );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	useEffect( () => {
		if ( hasFetched ) {
			if ( ! isAgency || ! isAgencyEnabled ) {
				page.redirect( '/' );
				return;
			}
		}
	}, [ hasFetched, isAgency, isAgencyEnabled ] );

	if ( hasFetched && isAgency ) {
		return <SitesOverview />;
	}

	return <>{ isFetching ? <Spinner /> : null }</>;
}
