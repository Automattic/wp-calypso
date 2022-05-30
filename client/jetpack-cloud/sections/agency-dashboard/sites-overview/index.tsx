import { useTranslate } from 'i18n-calypso';
import { ReactElement, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SitesOverviewContext from './context';
import SiteContent from './site-content';
import SiteSearch from './site-search';
import SiteWelcomeBanner from './site-welcome-banner';

import './style.scss';

export default function SitesOverview(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { search, currentPage } = useContext( SitesOverviewContext );

	const { data, isError, isFetching } = useFetchDashboardSites( search, currentPage );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_visit' ) );
	}, [ dispatch ] );

	return (
		<div className="sites-overview">
			<SiteWelcomeBanner isDashboardView />
			<div className="sites-overview__page-title-container">
				<h2 className="sites-overview__page-title">{ translate( 'Dashboard' ) }</h2>
				<div className="sites-overview__page-subtitle">
					{ translate( 'Manage all your Jetpack sites from one location' ) }
				</div>
			</div>
			<div className="sites-overview__search">
				<SiteSearch searchQuery={ search } currentPage={ currentPage } />
			</div>
			<SiteContent
				data={ data }
				isError={ isError }
				isFetching={ isFetching }
				currentPage={ currentPage }
			/>
		</div>
	);
}
