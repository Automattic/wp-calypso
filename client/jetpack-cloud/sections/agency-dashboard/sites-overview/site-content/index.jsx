import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryJetpackAgencyDashboardSites from 'calypso/components/data/query-jetpack-agency-dashboard-sites';
import JetpackLogo from 'calypso/components/jetpack-logo';
import {
	isFetchingSites,
	hasFetchedSites,
	getCurrentSites,
	getSitesRequestError,
} from 'calypso/state/agency-dashboard/sites/selectors';
import SiteCard from '../site-card';
import SiteTable from '../site-table';
import { getFormattedSites } from '../utils';
import './style.scss';

const SiteContent = () => {
	const translate = useTranslate();

	const hasFetched = useSelector( hasFetchedSites );
	const isFetching = useSelector( isFetchingSites );
	const allSites = useSelector( getCurrentSites );
	const isFetchingFailed = useSelector( getSitesRequestError );

	const sites = hasFetched ? getFormattedSites( allSites ) : [];

	const columns = {
		site: translate( 'Site' ),
		backup: translate( 'Backup' ),
		scan: translate( 'Scan' ),
		monitor: translate( 'Monitor' ),
		plugin: translate( 'Plugins' ),
	};

	let content;

	if ( hasFetched && ! isFetching && ! isFetchingFailed && ! sites.length ) {
		content = <div className="site-content__no-sites">{ translate( 'No active sites' ) }</div>;
	} else {
		content = (
			<>
				<SiteTable
					isFetching={ isFetching }
					columns={ columns }
					sites={ sites }
					isFetchingFailed={ isFetchingFailed }
				/>
				<div className="site-content__mobile-view">
					<>
						{ isFetching || isFetchingFailed ? (
							<JetpackLogo size={ 72 } className="site-content__logo" />
						) : (
							<>
								{ sites.length > 0 &&
									sites.map( ( rows, index ) => (
										<SiteCard
											isFetching={ isFetching }
											isFetchingFailed={ isFetchingFailed }
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
	}
	return (
		<>
			<QueryJetpackAgencyDashboardSites />
			{ content }
		</>
	);
};

export default SiteContent;
