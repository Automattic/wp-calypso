import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import SitePreviewPane from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-preview-pane';
import { SitePreviewPaneProps } from '../site-preview-pane/types';
import { JetpackBackupPreview } from './jetpack-backup';
import { JetpackBoostPreview } from './jetpack-boost';
import { JetpackMonitorPreview } from './jetpack-monitor';
import { JetpackStatsPreview } from './jetpack-stats';

export function JetpackPreviewPane( { site, closeSitePreviewPane }: SitePreviewPaneProps ) {
	const translate = useTranslate();

	const [ selectedFeatureId, setSelectedFeatureId ] = useState( 'jetpack_boost' );

	// Jetpack features: Boost, Backup, Monitor, Stats
	const features = useMemo(
		() => [
			{
				id: 'jetpack_boost',
				tab: {
					label: 'Boost',
					selected: selectedFeatureId === 'jetpack_boost',
					onTabClick: () => setSelectedFeatureId( 'jetpack_boost' ),
				},
				preview: <JetpackBoostPreview site={ site } />,
			},
			{
				id: 'jetpack_backup',
				tab: {
					label: 'Backup',
					selected: selectedFeatureId === 'jetpack_backup',
					onTabClick: () => setSelectedFeatureId( 'jetpack_backup' ),
				},
				preview: <JetpackBackupPreview site={ site } />,
			},
			{
				id: 'jetpack_monitor',
				tab: {
					label: 'Monitor',
					selected: selectedFeatureId === 'jetpack_monitor',
					onTabClick: () => setSelectedFeatureId( 'jetpack_monitor' ),
				},
				preview: <JetpackMonitorPreview site={ site } />,
			},
			{
				id: 'jetpack_stats',
				tab: {
					label: 'Stats',
					selected: selectedFeatureId === 'jetpack_stats',
					onTabClick: () => setSelectedFeatureId( 'jetpack_stats' ),
				},
				preview: <JetpackStatsPreview site={ site } />,
			},
		],
		[ site, selectedFeatureId, translate ]
	);

	return (
		<SitePreviewPane
			site={ site }
			closeSitePreviewPane={ closeSitePreviewPane }
			features={ features }
		/>
	);
}
