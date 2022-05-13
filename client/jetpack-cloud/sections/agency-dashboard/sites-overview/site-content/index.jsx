import { useTranslate } from 'i18n-calypso';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
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
		</>
	);
};

export default SiteContent;
