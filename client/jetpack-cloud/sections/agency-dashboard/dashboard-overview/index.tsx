import config from '@automattic/calypso-config';
import page from 'page';
import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import {
	hasFetchedPartner,
	isFetchingPartner,
	isAgencyUser,
} from 'calypso/state/partner-portal/partner/selectors';
import SitesOverview from '../sites-overview';
import SitesOverviewContext from '../sites-overview/context';
import type { SitesOverviewContextInterface } from '../sites-overview/types';

import '../style.scss';

export default function DashboardOverview( {
	search,
	currentPage,
}: SitesOverviewContextInterface ): ReactElement {
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
		const context = {
			search,
			currentPage,
		};
		return (
			<SitesOverviewContext.Provider value={ context }>
				<SitesOverview />
			</SitesOverviewContext.Provider>
		);
	}

	return (
		<>{ isFetching ? <JetpackLogo size={ 72 } className="dashboard-overview__logo" /> : null }</>
	);
}
