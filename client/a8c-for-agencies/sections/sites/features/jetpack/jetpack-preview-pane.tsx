import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import {
	JETPACK_ACTIVITY_ID,
	JETPACK_BACKUP_ID,
	JETPACK_BOOST_ID,
	JETPACK_MONITOR_ID,
	JETPACK_PLUGINS_ID,
	JETPACK_SCAN_ID,
	JETPACK_STATS_ID,
} from 'calypso/a8c-for-agencies/sections/sites/features/features';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import { useJetpackAgencyDashboardRecordTrackEvent } from 'calypso/jetpack-cloud/sections/agency-dashboard/hooks';
import { A4A_SITES_DASHBOARD_DEFAULT_FEATURE } from '../../constants';
import SitePreviewPane, { createFeaturePreview } from '../../site-preview-pane';
import { PreviewPaneProps } from '../../site-preview-pane/types';
import { JetpackActivityPreview } from './activity';
import { JetpackBackupPreview } from './jetpack-backup';
import { JetpackBoostPreview } from './jetpack-boost';
import { JetpackMonitorPreview } from './jetpack-monitor';
import { JetpackPluginsPreview } from './jetpack-plugins';
import { JetpackScanPreview } from './jetpack-scan';
import { JetpackStatsPreview } from './jetpack-stats';

export function JetpackPreviewPane( {
	site,
	closeSitePreviewPane,
	className,
	isSmallScreen = false,
	hasError = false,
}: PreviewPaneProps ) {
	const translate = useTranslate();
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], ! isSmallScreen );

	const trackEvent = useCallback(
		( eventName: string ) => {
			recordEvent( eventName );
		},
		[ recordEvent ]
	);

	const { selectedSiteFeature, setSelectedSiteFeature } = useContext( SitesDashboardContext );

	useEffect( () => {
		if ( selectedSiteFeature === undefined ) {
			setSelectedSiteFeature( A4A_SITES_DASHBOARD_DEFAULT_FEATURE );
		}
		return () => {
			setSelectedSiteFeature( undefined );
		};
	}, [] );

	// Jetpack features: Boost, Backup, Monitor, Stats
	const features = useMemo(
		() => [
			createFeaturePreview(
				JETPACK_BOOST_ID,
				'Boost',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackBoostPreview site={ site } trackEvent={ trackEvent } hasError={ hasError } />
			),
			createFeaturePreview(
				JETPACK_BACKUP_ID,
				'Backup',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackBackupPreview siteId={ site.blog_id } />
			),
			createFeaturePreview(
				JETPACK_SCAN_ID,
				'Scan',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackScanPreview siteId={ site.blog_id } />
			),
			createFeaturePreview(
				JETPACK_MONITOR_ID,
				'Monitor',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackMonitorPreview site={ site } trackEvent={ trackEvent } hasError={ hasError } />
			),
			createFeaturePreview(
				JETPACK_PLUGINS_ID,
				translate( 'Plugins' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackPluginsPreview
					link={ site.url_with_scheme + '/wp-admin/plugins.php' }
					linkLabel={ translate( 'Manage Plugins in wp-admin' ) }
					featureText={ translate( 'Manage all plugins installed on %(siteUrl)s', {
						args: { siteUrl: site.url },
					} ) }
					captionText={ translate(
						"Note: We are currently working to make this section function from the Automattic for Agencies dashboard. in the meantime, you'll be taken to WP-Admin."
					) }
				/>
			),
			createFeaturePreview(
				JETPACK_STATS_ID,
				'Stats',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackStatsPreview site={ site } trackEvent={ trackEvent } />
			),
			createFeaturePreview(
				JETPACK_ACTIVITY_ID,
				translate( 'Activity' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackActivityPreview siteId={ site.blog_id } />
			),
		],
		[ selectedSiteFeature, setSelectedSiteFeature, site, trackEvent, hasError, translate ]
	);

	return (
		<SitePreviewPane
			site={ site }
			closeSitePreviewPane={ closeSitePreviewPane }
			features={ features }
			className={ className }
		/>
	);
}
