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
import ItemView, { createFeaturePreview } from 'calypso/layout/multi-sites-dashboard/item-view';
import { ItemData } from 'calypso/layout/multi-sites-dashboard/item-view/types';
import { PreviewPaneProps } from '../../site-preview-pane/types';
import { JetpackActivityPreview } from './activity';
import { JetpackBackupPreview } from './backup';
import { JetpackBoostPreview } from './jetpack-boost';
import { JetpackMonitorPreview } from './jetpack-monitor';
import { JetpackPluginsPreview } from './jetpack-plugins';
import { JetpackStatsPreview } from './jetpack-stats';
import { JetpackScanPreview } from './scan';

import './style.scss';
import '../../site-preview-pane/a4a-style.scss';

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
			setSelectedSiteFeature( JETPACK_BOOST_ID );
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
				<JetpackBackupPreview site={ site } />
			),
			createFeaturePreview(
				JETPACK_SCAN_ID,
				'Scan',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackScanPreview site={ site } />
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
						"Note: We are currently working to make this section function from the Automattic for Agencies dashboard. In the meantime, you'll be taken to WP-Admin."
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
				<JetpackActivityPreview site={ site } />
			),
		],
		[ selectedSiteFeature, setSelectedSiteFeature, site, trackEvent, hasError, translate ]
	);

	const itemData: ItemData = {
		title: site.blogname,
		subtitle: site.url,
		url: site.url_with_scheme,
		blogId: site.blog_id,
		isDotcomSite: site.is_atomic,
	};

	return (
		<ItemView
			itemData={ itemData }
			closeItemView={ closeSitePreviewPane }
			features={ features }
			className={ className }
		/>
	);
}
