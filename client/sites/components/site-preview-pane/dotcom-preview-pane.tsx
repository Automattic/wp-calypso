import { FEATURE_SITE_STAGING_SITES } from '@automattic/calypso-products';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo } from 'react';
import { isAtomicTransferredSite } from 'calypso/dashboard/utils/site-atomic-transfers';
import { isMigrationInProgress } from 'calypso/data/site-migration';
import ItemView from 'calypso/layout/hosting-dashboard/item-view';
import { useSetTabBreadcrumb } from 'calypso/sites/hooks/breadcrumbs/use-set-tab-breadcrumb';
import { useStagingSite } from 'calypso/sites/staging-site/hooks/use-staging-site';
import SitesProductionBadge from 'calypso/sites-dashboard/components/sites-production-badge';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { canCurrentUserSwitchEnvironment } from 'calypso/state/sites/selectors/can-current-user-switch-environment';
import { StagingSiteStatus } from 'calypso/state/staging-site/constants';
import { getStagingSiteStatus } from 'calypso/state/staging-site/selectors';
import { useBreadcrumbs } from '../../hooks/breadcrumbs/use-breadcrumbs';
import { showSitesPage } from '../sites-dashboard';
import { SiteStatus } from '../sites-dataviews/sites-site-status';
import {
	DEPLOYMENTS,
	FEATURE_TO_ROUTE_MAP,
	LOGS_PHP,
	LOGS_WEB,
	MONITORING,
	OVERVIEW,
	PERFORMANCE,
	PLAN,
	SETTINGS_ADMINISTRATION_DELETE_SITE,
	SETTINGS_ADMINISTRATION_RESET_SITE,
	SETTINGS_ADMINISTRATION_TRANSFER_SITE,
	SETTINGS_DATABASE,
	SETTINGS_PERFORMANCE,
	SETTINGS_SERVER,
	SETTINGS_SFTP_SSH,
	SETTINGS_SITE,
	STAGING_SITE,
} from './constants';
import PreviewPaneHeaderButtons from './preview-pane-header-buttons';
import SiteEnvironmentSwitcher from './site-environment-switcher';
import type {
	FeaturePreviewInterface,
	ItemData,
} from 'calypso/layout/hosting-dashboard/item-view/types';

interface Props {
	site: SiteExcerptData;
	selectedSiteFeature: string;
	selectedSiteFeaturePreview: React.ReactNode;
	closeSitePreviewPane: () => void;
	changeSitePreviewPane: ( siteId: number ) => void;
}

const DotcomPreviewPane = ( {
	site,
	selectedSiteFeature,
	selectedSiteFeaturePreview,
	closeSitePreviewPane,
	changeSitePreviewPane,
}: Props ) => {
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const isInProgress = isMigrationInProgress( site );
	const isA4ADevSite = !! site?.is_a4a_dev_site;

	const hasStagingSitesFeature = useSelector( ( state ) =>
		siteHasFeature( state, site.ID, FEATURE_SITE_STAGING_SITES )
	);

	const features: FeaturePreviewInterface[] = useMemo( () => {
		const siteFeatures = [
			{
				label: __( 'Overview' ),
				enabled: true,
				featureIds: [ OVERVIEW ],
			},
			{
				label: __( 'Deployments' ),
				enabled: true,
				featureIds: [ DEPLOYMENTS ],
			},
			{
				label: __( 'Monitoring' ),
				enabled: true,
				featureIds: [ MONITORING ],
			},
			{
				label: __( 'Performance' ),
				enabled: true,
				featureIds: [ PERFORMANCE ],
			},
			{
				label: __( 'Logs' ),
				enabled: true,
				featureIds: [ LOGS_PHP, LOGS_WEB ],
			},
			{
				label: __( 'Staging Site' ),
				// We don't have the callout for the staging site tab since we'll retire the tab.
				enabled: hasStagingSitesFeature && ! isA4ADevSite,
				featureIds: [ STAGING_SITE ],
			},
			{
				label: __( 'Settings' ),
				enabled: true,
				featureIds: [
					SETTINGS_SITE,
					SETTINGS_ADMINISTRATION_RESET_SITE,
					SETTINGS_ADMINISTRATION_TRANSFER_SITE,
					SETTINGS_ADMINISTRATION_DELETE_SITE,
					SETTINGS_SERVER,
					SETTINGS_SFTP_SSH,
					SETTINGS_DATABASE,
					SETTINGS_PERFORMANCE,
				],
			},
			{
				enabled: true,
				visible: false,
				featureIds: [ PLAN ],
			},
		];

		return siteFeatures.map( ( { label, enabled, visible, featureIds } ) => {
			const selected = enabled && featureIds.includes( selectedSiteFeature );
			const defaultFeatureId = featureIds[ 0 ] as string;
			const featureRoute = `/${ FEATURE_TO_ROUTE_MAP[ defaultFeatureId ] }`;
			const defaultRoute = featureRoute.replace( ':site', site.slug );

			return {
				id: defaultFeatureId,
				tab: {
					label,
					href: defaultRoute,
					visible: enabled && visible !== false,
					selected,
					onTabClick: () => {
						if ( enabled ) {
							showSitesPage( defaultRoute );

							// Additional event to align analysis across dashboards.
							// See: https://wp.me/pgz0xU-qp
							dispatch(
								recordTracksEvent( 'calypso_dashboard_menu_item_click', {
									to: featureRoute,
								} )
							);
						}
					},
				},
				enabled,
				preview: enabled ? selectedSiteFeaturePreview : null,
			};
		} );
	}, [
		dispatch,
		__,
		site,
		selectedSiteFeature,
		selectedSiteFeaturePreview,
		hasStagingSitesFeature,
		isA4ADevSite,
	] );

	const itemData: ItemData = {
		title: isInProgress ? __( 'Incoming Migration' ) : site.title,
		subtitle: site.slug,
		url: site.URL,
		blogId: site.ID,
		isDotcomSite: site.is_wpcom_atomic || site.is_wpcom_staging_site,
		adminUrl: site.options?.admin_url || `${ site.URL }/wp-admin`,
		withIcon: true,
	};

	const { data: stagingSites } = useStagingSite( site.ID, {
		enabled: ! site.is_wpcom_staging_site && site.is_wpcom_atomic,
	} );

	const siteWithStagingIds = useMemo( () => {
		if ( ! site.options || ! site.is_wpcom_atomic ) {
			return site;
		}

		const stagingBlogIds = stagingSites?.map( ( stagingSite ) => stagingSite.id ) ?? [];

		return {
			...site,
			options: {
				...site.options,
				wpcom_staging_blog_ids: stagingBlogIds,
			},
		};
	}, [ site, stagingSites ] );

	const stagingStatus = useSelector( ( state ) => getStagingSiteStatus( state, site.ID ) );
	const isStagingStatusFinished =
		stagingStatus === StagingSiteStatus.COMPLETE ||
		stagingStatus === StagingSiteStatus.NONE ||
		stagingStatus === StagingSiteStatus.UNSET;

	const hasEnvironmentPermission = useSelector( ( state ) =>
		canCurrentUserSwitchEnvironment( state, siteWithStagingIds )
	);

	// Check if site supports environment switching (atomic readiness check)
	const supportsEnvironmentSwitching =
		siteWithStagingIds.is_wpcom_staging_site ||
		isAtomicTransferredSite( {
			is_wpcom_atomic: siteWithStagingIds.is_wpcom_atomic,
			capabilities: siteWithStagingIds.capabilities,
		} );

	const { breadcrumbs, shouldShowBreadcrumbs } = useBreadcrumbs();
	useSetTabBreadcrumb( {
		site,
		features,
		selectedFeatureId: selectedSiteFeature,
	} );

	const isProduction =
		siteWithStagingIds.is_wpcom_atomic && ! siteWithStagingIds.is_wpcom_staging_site;
	const hasNoStagingSites = ! siteWithStagingIds.options?.wpcom_staging_blog_ids?.length;

	const shouldShowProductionBadge =
		isProduction &&
		( hasNoStagingSites || ! isStagingStatusFinished ) &&
		hasStagingSitesFeature &&
		! isA4ADevSite;

	return (
		<ItemView
			itemData={ itemData }
			closeItemView={ closeSitePreviewPane }
			features={ features }
			enforceTabsView
			itemViewHeaderExtraProps={ {
				externalIconSize: 16,
				siteIconFallback: isInProgress ? 'migration' : 'first-grapheme',
				headerButtons: PreviewPaneHeaderButtons,
				subtitleExtra: () => {
					if ( isInProgress ) {
						return <SiteStatus site={ site } />;
					}

					if ( shouldShowProductionBadge ) {
						return <SitesProductionBadge>{ __( 'Production' ) }</SitesProductionBadge>;
					}

					if (
						supportsEnvironmentSwitching &&
						hasEnvironmentPermission &&
						isStagingStatusFinished
					) {
						return (
							<SiteEnvironmentSwitcher
								onChange={ changeSitePreviewPane }
								site={ siteWithStagingIds }
							/>
						);
					}
				},
			} }
			breadcrumbs={ breadcrumbs }
			shouldShowBreadcrumbs={ shouldShowBreadcrumbs }
		/>
	);
};

export default DotcomPreviewPane;
