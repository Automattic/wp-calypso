import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import SiteCard from '../site-card';
import SiteTable from '../site-table';
import { formatSites } from '../utils';
import type { ReactElement } from 'react';

import './style.scss';

export default function SiteContent(): ReactElement {
	const translate = useTranslate();

	const { data, error, isLoading } = useFetchDashboardSites();

	const sites = formatSites( data );

	const columns = [
		{
			key: 'site',
			title: translate( 'Site' ),
		},
		{
			key: 'backup',
			title: translate( 'Backup' ),
		},
		{
			key: 'scan',
			title: translate( 'Scan' ),
		},
		{
			key: 'monitor',
			title: translate( 'Monitor' ),
		},
		{
			key: 'plugin',
			title: translate( 'Plugin Updates' ),
		},
	];

	if ( ! isLoading && ! error && ! sites.length ) {
		return <div className="site-content__no-sites">{ translate( 'No active sites' ) }</div>;
	}

	return (
		<>
			<SiteTable isFetching={ isLoading } columns={ columns } items={ sites } />
			<div className="site-content__mobile-view">
				<>
					{ isLoading || error ? (
						<JetpackLogo size={ 72 } className="site-content__logo" />
					) : (
						<>
							{ sites.length > 0 &&
								sites.map( ( rows, index ) => (
									<SiteCard key={ index } columns={ columns } rows={ rows } />
								) ) }
						</>
					) }
				</>
			</div>
		</>
	);
}
