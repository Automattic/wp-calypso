import classNames from 'classnames';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import { siteColumns } from '../utils';
import BackupStorage from './backup-storage';
import BoostSitePerformance from './boost-site-performance';
import InsightsStats from './insights-stats';
import MonitorActivity from './monitor-activity';
import type { Site, AllowedTypes } from '../types';

import './style.scss';

interface Props {
	site: Site;
	columns?: AllowedTypes[];
	isSmallScreen?: boolean;
	hasError: boolean;
}

const defaultColumns: AllowedTypes[] = siteColumns.map( ( { key } ) => key );

export default function SiteExpandedContent( {
	site,
	columns = defaultColumns,
	isSmallScreen = false,
	hasError,
}: Props ) {
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], ! isSmallScreen );

	const stats = site.site_stats;
	const boostData = site.jetpack_boost_scores;
	const siteUrlWithScheme = site.url_with_scheme;

	const trackEvent = ( eventName: string ) => {
		recordEvent( eventName );
	};
	const hasMonitor = site.monitor_settings.monitor_active;

	return (
		<div
			className={ classNames( 'site-expanded-content', {
				'is-small-screen': isSmallScreen,
			} ) }
		>
			{ columns.includes( 'stats' ) && stats && (
				<InsightsStats
					stats={ stats }
					siteUrlWithScheme={ siteUrlWithScheme }
					trackEvent={ trackEvent }
				/>
			) }
			{ columns.includes( 'boost' ) && (
				<BoostSitePerformance
					boostData={ boostData }
					siteId={ site.blog_id }
					siteUrlWithScheme={ siteUrlWithScheme }
					hasBoost={ site.has_boost }
					trackEvent={ trackEvent }
					hasError={ hasError }
				/>
			) }
			{ columns.includes( 'backup' ) && stats && (
				<BackupStorage site={ site } trackEvent={ trackEvent } hasError={ hasError } />
			) }
			{ columns.includes( 'monitor' ) && (
				<MonitorActivity
					hasMonitor={ hasMonitor }
					site={ site }
					trackEvent={ trackEvent }
					hasError={ hasError }
				/>
			) }
		</div>
	);
}
