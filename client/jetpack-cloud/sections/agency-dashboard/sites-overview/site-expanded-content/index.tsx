import clsx from 'clsx';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import BackupStorage from './backup-storage';
import BoostSitePerformance from './boost-site-performance';
import InsightsStats from './insights-stats';
import MonitorActivity from './monitor-activity';
import type { Site, AllowedTypes } from '../types';

import './style.scss';

interface Props {
	site: Site;
	columns: AllowedTypes[];
	isSmallScreen?: boolean;
	hasError: boolean;
}

export default function SiteExpandedContent( {
	site,
	columns,
	isSmallScreen = false,
	hasError,
}: Props ) {
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], ! isSmallScreen );

	const stats = site.site_stats;
	const siteUrlWithScheme = site.url_with_scheme;

	const trackEvent = ( eventName: string ) => {
		recordEvent( eventName );
	};
	const hasMonitor = site.monitor_settings.monitor_active;

	return (
		<div
			className={ clsx( 'site-expanded-content', {
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
				<BoostSitePerformance site={ site } trackEvent={ trackEvent } hasError={ hasError } />
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
