import config from '@automattic/calypso-config';
import page from 'page';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import {
	hasFetchedPartner,
	isFetchingPartner,
	isAgencyUser,
} from 'calypso/state/partner-portal/partner/selectors';
import SitesOverview from '../sites-overview';
import '../style.scss';

export default function DashboardOverview() {
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const isAgency = useSelector( isAgencyUser );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	useEffect( () => {
		if ( hasFetched ) {
			if ( ! isAgency || ! isAgencyEnabled ) {
				page.redirect( '/' );
				return;
			}
		}
	}, [ hasFetched, isAgency, isAgencyEnabled ] );

	if ( isAgencyEnabled && hasFetched && isAgency ) {
		return <SitesOverview />;
	}

	return (
		<>{ isFetching ? <JetpackLogo size={ 72 } className="dashboard-overview__logo" /> : null }</>
	);
}
