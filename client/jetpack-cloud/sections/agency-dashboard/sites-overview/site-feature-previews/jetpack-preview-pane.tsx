import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo, useState } from 'react';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import SitePreviewPane, { createFeaturePreview } from '../site-preview-pane';
import { SitePreviewPaneProps } from '../site-preview-pane/types';
import { JetpackBackupPreview } from './jetpack-backup';
import { JetpackBoostPreview } from './jetpack-boost';
import { JetpackMonitorPreview } from './jetpack-monitor';
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
				<JetpackBackupPreview site={ site } trackEvent={ trackEvent } hasError={ hasError } />
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
				'jetpack_stats',
				'Stats',
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackStatsPreview site={ site } trackEvent={ trackEvent } />
			),
			createFeaturePreview(
				'jetpack_scan',
				'Scan',
				true,
				selectedFeatureId,
				() => page( '/scan/' + site.url ),
				null
			),
			createFeaturePreview(
				'jetpack_plugins',
				'Plugins',
				true,
				selectedFeatureId,
				() => page( '/plugins/manage/' + site.url ),
				null
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
