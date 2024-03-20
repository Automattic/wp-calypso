import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import SitePreviewPane, { createFeaturePreview } from '../site-preview-pane';
import { SitePreviewPaneProps } from '../site-preview-pane/types';
import { JetpackActivityPreview } from './jetpack-activity';
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
}: SitePreviewPaneProps ) {
	const translate = useTranslate();
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], ! isSmallScreen );

	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );

	useEffect( () => {
		if ( site ) {
			dispatch( setSelectedSiteId( site.blog_id ) );
		}
	}, [ site ] );

	const trackEvent = ( eventName: string ) => {
		recordEvent( eventName );
	};

	const [ selectedFeatureId, setSelectedFeatureId ] = useState( 'jetpack_boost' );

	// Jetpack features: Boost, Backup, Monitor, Stats
	const features = useMemo(
		() => [
			createFeaturePreview(
				'jetpack_boost',
				'Boost',
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackBoostPreview site={ site } trackEvent={ trackEvent } hasError={ hasError } />
			),
			createFeaturePreview(
				'jetpack_backup',
				'Backup',
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackBackupPreview />
			),
			createFeaturePreview(
				'jetpack_scan',
				'Scan',
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackScanPreview sideId={ site.blog_id } />
			),
			createFeaturePreview(
				'jetpack_monitor',
				'Monitor',
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackMonitorPreview site={ site } trackEvent={ trackEvent } hasError={ hasError } />
			),
			createFeaturePreview(
				'jetpack_plugins',
				translate( 'Plugins' ),
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackPluginsPreview
					link={ '/plugins/manage/' + site.url }
					linkLabel={ translate( 'Manage Plugins' ) }
					featureText={ translate( 'Manage all plugins installed on %(siteUrl)s', {
						args: { siteUrl: site.url },
					} ) }
				/>
			),
			createFeaturePreview(
				'jetpack_stats',
				'Stats',
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackStatsPreview site={ site } trackEvent={ trackEvent } />
			),
			createFeaturePreview(
				'jetpack_activity',
				translate( 'Activity' ),
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackActivityPreview isLoading={ ! selectedSiteId } />
			),
		],
		[ site, selectedFeatureId, translate ]
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
