import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import SiteCard from '../site-card';
import SiteTable from '../site-table';

import './style.scss';

const SiteContent = () => {
	const translate = useTranslate();

	const { data, error, isLoading } = useFetchDashboardSites();

	const columns = {
		site: translate( 'Site' ),
		backup: translate( 'Backup' ),
		scan: translate( 'Scan' ),
		monitor: translate( 'Monitor' ),
		plugin: translate( 'Plugins' ),
	};

	if ( ! isLoading && ! error && ! data.length ) {
		return <div className="site-content__no-sites">{ translate( 'No active sites' ) }</div>;
	}

	return (
		<>
			<SiteTable
				isFetching={ isLoading }
				columns={ columns }
				sites={ data }
				isFetchingFailed={ error }
			/>
			<div className="site-content__mobile-view">
				<>
					{ isLoading || error ? (
						<JetpackLogo size={ 72 } className="site-content__logo" />
					) : (
						<>
							{ data.length > 0 &&
								data.map( ( rows, index ) => (
									<SiteCard
										isFetching={ isLoading }
										isFetchingFailed={ error }
										key={ index }
										columns={ columns }
										rows={ rows }
									/>
								) ) }
						</>
					) }
				</>
			</div>
		</>
	);
};

export default SiteContent;
