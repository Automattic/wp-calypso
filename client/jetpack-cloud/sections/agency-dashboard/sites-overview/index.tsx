import { useTranslate } from 'i18n-calypso';
import { ReactElement, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { checkIfJetpackSiteGotDisconnected } from 'calypso/state/partner-portal/agency-dashboard/selectors';
import SitesOverviewContext from './context';
import SiteContent from './site-content';
import SiteFilters from './site-filters';
import SiteSearch from './site-search';
import SiteWelcomeBanner from './site-welcome-banner';

import './style.scss';

export default function SitesOverview(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );

	const { search, currentPage, filter } = useContext( SitesOverviewContext );

	const { data, isError, isFetching } = useFetchDashboardSites(
		search,
		currentPage,
		filter,
		jetpackSiteDisconnected
	);

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_visit' ) );
	}, [ dispatch ] );

	const pageTitle = translate( 'Dashboard' );

	return (
		<div className="sites-overview">
			<DocumentHead title={ pageTitle } />
			<SidebarNavigation sectionTitle={ pageTitle } />
			<div className="sites-overview__container">
				<SiteWelcomeBanner isDashboardView />
				<div className="sites-overview__page-title-container">
					<h2 className="sites-overview__page-title">{ pageTitle }</h2>
					<div className="sites-overview__page-subtitle">
						{ translate( 'Manage all your Jetpack sites from one location' ) }
					</div>
				</div>
				<div className="sites-overview__search">
					<SiteSearch searchQuery={ search } currentPage={ currentPage } />
				</div>
				<div className="sites-overview__filter-bar">
					<SiteFilters filter={ filter } isFetching={ isFetching } />
				</div>
				<SiteContent
					data={ data }
					isError={ isError }
					isFetching={ isFetching }
					currentPage={ currentPage }
				/>
			</div>
		</div>
	);
}
