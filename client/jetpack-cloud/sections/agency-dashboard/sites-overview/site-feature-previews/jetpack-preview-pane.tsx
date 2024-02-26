import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo, useState } from 'react';
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
}: SitePreviewPaneProps ) {
	const translate = useTranslate();

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
				<JetpackBoostPreview site={ site } />
			),
			createFeaturePreview(
				'jetpack_backup',
				'Backup',
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackBackupPreview site={ site } />
			),
			createFeaturePreview(
				'jetpack_monitor',
				'Monitor',
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackMonitorPreview site={ site } />
			),
			createFeaturePreview(
				'jetpack_stats',
				'Stats',
				true,
				selectedFeatureId,
				setSelectedFeatureId,
				<JetpackStatsPreview site={ site } />
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
