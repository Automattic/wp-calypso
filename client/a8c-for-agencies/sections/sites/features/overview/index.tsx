import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import SiteDetails from 'calypso/a8c-for-agencies/sections/sites/features/a4a/site-details';
import {
	JETPACK_OVERVIEW_ID,
	JETPACK_ACTIVITY_ID,
	JETPACK_BACKUP_ID,
	JETPACK_SCAN_ID,
	A4A_SITE_DETAILS_ID,
} from 'calypso/a8c-for-agencies/sections/sites/features/features';
import { JetpackOverviewTab } from 'calypso/a8c-for-agencies/sections/sites/features/jetpack/overview-tab';
import { PreviewPaneProps } from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/types';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import { useJetpackAgencyDashboardRecordTrackEvent } from 'calypso/jetpack-cloud/sections/agency-dashboard/hooks';
import { A4A_SITES_DASHBOARD_DEFAULT_FEATURE } from '../../constants';
import SitePreviewPane, { createFeaturePreview } from '../../site-preview-pane';
import { JetpackActivityPreview } from '../jetpack/activity';
import { JetpackBackupPreview } from '../jetpack/backup';
import { JetpackScanPreview } from '../jetpack/scan';

import '../jetpack/style.scss';

export function OverviewFamily( {
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
				JETPACK_OVERVIEW_ID,
				translate( 'Overview' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackOverviewTab site={ site } trackEvent={ trackEvent } hasError={ hasError } />
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
				<JetpackScanPreview site={ site } />
			),
			createFeaturePreview(
				JETPACK_ACTIVITY_ID,
				translate( 'Activity' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<JetpackActivityPreview siteId={ site.blog_id } />
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

	return (
		<SitePreviewPane
			site={ site }
			closeSitePreviewPane={ closeSitePreviewPane }
			features={ features }
			className={ className }
		/>
	);
}
