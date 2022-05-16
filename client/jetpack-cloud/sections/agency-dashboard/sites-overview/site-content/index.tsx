import { useTranslate } from 'i18n-calypso';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import SiteTable from '../site-table';
import { formatSites } from '../utils';
import type { ReactElement } from 'react';

import './style.scss';

export default function SiteContent(): ReactElement {
	const translate = useTranslate();

	const { data, error, isLoading } = useFetchDashboardSites();

	const sites = formatSites( data );

	const columns = {
		site: translate( 'Site' ),
		backup: translate( 'Backup' ),
		scan: translate( 'Scan' ),
		monitor: translate( 'Monitor' ),
		plugin: translate( 'Plugin Updates' ),
	};

	if ( ! isLoading && ! error && ! sites.length ) {
		return <div className="site-content__no-sites">{ translate( 'No active sites' ) }</div>;
	}
	return (
		<>
			<SiteTable isFetching={ isLoading } columns={ columns } items={ sites } />
		</>
	);
}
