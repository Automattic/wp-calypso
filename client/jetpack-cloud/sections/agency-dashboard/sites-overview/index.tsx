import { useTranslate } from 'i18n-calypso';
import { ReactElement, useState } from 'react';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import SiteContent from './site-content';
import SiteSearch from './site-search';
import SiteWelcomeBanner from './site-welcome-banner';

import './style.scss';

export default function SitesOverview(): ReactElement {
	const translate = useTranslate();
	const searchParam = new URLSearchParams( window.location.search ).get( 's' );

	const [ searchQuery, setSearchQuery ] = useState( searchParam );
	const { data, isError, isFetching } = useFetchDashboardSites( searchQuery );

	const handleSearch = ( query: string | null ) => {
		setSearchQuery( query );
	};

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
				<SiteSearch searchQuery={ searchQuery } handleSearch={ handleSearch } />
			</div>
			<SiteContent data={ data } isError={ isError } isFetching={ isFetching } />
		</div>
	);
}
