import { isEnabled } from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import ItemPreviewPane, {
	createFeaturePreview,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';
import SiteDetails from 'calypso/a8c-for-agencies/sections/sites/features/a4a/site-details';
import {
	JETPACK_ACTIVITY_ID,
	JETPACK_BACKUP_ID,
	JETPACK_BOOST_ID,
	JETPACK_MONITOR_ID,
	JETPACK_PLUGINS_ID,
	JETPACK_SCAN_ID,
	JETPACK_STATS_ID,
	A4A_SITE_DETAILS_ID,
	HOSTING_OVERVIEW_ID,
} from 'calypso/a8c-for-agencies/sections/sites/features/features';
import { PreviewPaneProps } from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/types';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import { useJetpackAgencyDashboardRecordTrackEvent } from 'calypso/jetpack-cloud/sections/agency-dashboard/hooks';
import { A4A_SITES_DASHBOARD_DEFAULT_FEATURE } from '../../constants';
import { useFetchTestConnections } from '../../hooks/use-fetch-test-connection';
import useFormattedSites from '../../hooks/use-formatted-sites';
import HostingOverviewPreview from '../hosting/overview';
import { JetpackActivityPreview } from '../jetpack/activity';
import { JetpackBackupPreview } from '../jetpack/backup';
import { JetpackBoostPreview } from '../jetpack/jetpack-boost';
import { JetpackMonitorPreview } from '../jetpack/jetpack-monitor';
import { JetpackPluginsPreview } from '../jetpack/jetpack-plugins';
import { JetpackStatsPreview } from '../jetpack/jetpack-stats';
import { JetpackScanPreview } from '../jetpack/scan';
import SiteErrorPreview from './site-error-preview';

import '../jetpack/style.scss';
import '../../site-preview-pane/a4a-style.scss';

export function OverviewPreviewPane( {
	site,
	closeSitePreviewPane,
	className,
	isSmallScreen = false,
	hasError = false,
	onRefetchSite,
}: PreviewPaneProps ) {
	const translate = useTranslate();
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], ! isSmallScreen );

	const connectionStatus = useFetchTestConnections( true, [ site ] );
	const formattedSite = useFormattedSites( [ site ], connectionStatus );

	const trackEvent = useCallback(
		( eventName: string ) => {
			recordEvent( eventName );
		},
		[ recordEvent ]
	);

	// Show error pane if there is an error
	const showErrorPane = formattedSite?.[ 0 ].site.error ?? false;

	const { selectedSiteFeature, setSelectedSiteFeature } = useContext( SitesDashboardContext );

	useEffect( () => {
		if ( selectedSiteFeature === undefined ) {
			setSelectedSiteFeature( A4A_SITES_DASHBOARD_DEFAULT_FEATURE );
		}
		return () => {
			setSelectedSiteFeature( undefined );
		};
	}, [] );

	const errorFeatures = useMemo(
		() => [
			createFeaturePreview(
				'error',
				null,
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<SiteErrorPreview
					site={ site }
					trackEvent={ trackEvent }
					onRefetchSite={ onRefetchSite }
					closeSitePreviewPane={ closeSitePreviewPane }
				/>
			),
		],
		[
			closeSitePreviewPane,
			onRefetchSite,
			selectedSiteFeature,
			setSelectedSiteFeature,
			site,
			trackEvent,
		]
	);

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
			createFeaturePreview(
				HOSTING_OVERVIEW_ID,
				translate( 'Hosting' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<HostingOverviewPreview site={ site } />
			),
			...( isEnabled( 'a4a/site-details-pane' )
				? [
						createFeaturePreview(
							A4A_SITE_DETAILS_ID,
							translate( 'Details' ),
							true,
							selectedSiteFeature,
							setSelectedSiteFeature,
							<SiteDetails site={ site } />
						),
				  ]
				: [] ),
		],
		[ selectedSiteFeature, setSelectedSiteFeature, site, trackEvent, hasError, translate ]
	);

	const itemData: ItemData = {
		title: site.blogname,
		subtitle: site.url,
		url: site.url_with_scheme,
		blogId: site.blog_id,
		isDotcomSite: site.is_atomic,
		hideEnvDataInHeader: true,
	};

	return (
		<ItemPreviewPane
			hideNavIfSingleTab
			itemData={ itemData }
			closeItemPreviewPane={ closeSitePreviewPane }
			features={ showErrorPane ? errorFeatures : features }
			className={ clsx( className, {
				'site-error-preview': showErrorPane,
			} ) }
			addTourDetails={ { id: 'sites-walkthrough-site-preview-tabs', tourId: 'sitesWalkthrough' } }
		/>
	);
}
