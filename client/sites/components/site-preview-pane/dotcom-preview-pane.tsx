import { isEnabled } from '@automattic/calypso-config';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo } from 'react';
import { isMigrationInProgress } from 'calypso/data/site-migration';
import ItemView from 'calypso/layout/hosting-dashboard/item-view';
import { useSetTabBreadcrumb } from 'calypso/sites/hooks/breadcrumbs/use-set-tab-breadcrumb';
import HostingFeaturesIcon from 'calypso/sites/hosting/components/hosting-features-icon';
import { useStagingSite } from 'calypso/sites/staging-site/hooks/use-staging-site';
import SitesProductionBadge from 'calypso/sites-dashboard/components/sites-production-badge';
import { useSelector } from 'calypso/state';
import { canCurrentUserSwitchEnvironment } from 'calypso/state/sites/selectors/can-current-user-switch-environment';
import { StagingSiteStatus } from 'calypso/state/staging-site/constants';
import { getStagingSiteStatus } from 'calypso/state/staging-site/selectors';
import { useBreadcrumbs } from '../../hooks/breadcrumbs/use-breadcrumbs';
import { showSitesPage } from '../sites-dashboard';
import { SiteStatus } from '../sites-dataviews/sites-site-status';
import {
	DEPLOYMENTS,
	FEATURE_TO_ROUTE_MAP,
	HOSTING_FEATURES,
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
	const { __ } = useI18n();

	const isAtomicSite = !! site.is_wpcom_atomic || !! site.is_wpcom_staging_site;
	const isSimpleSite = ! site.jetpack && ! site.is_wpcom_atomic;
	const isPlanExpired = !! site.plan?.expired;
	const isInProgress = isMigrationInProgress( site );
	const stagingSitesRedesign = isEnabled( 'hosting/staging-sites-redesign' );
	const isHostingFeaturesCalloutEnabled = isEnabled( 'hosting/hosting-features-callout' );

	const features: FeaturePreviewInterface[] = useMemo( () => {
		const isActiveAtomicSite = isAtomicSite && ! isPlanExpired;
		const isHostingFeaturesEnabled = isActiveAtomicSite || isHostingFeaturesCalloutEnabled;
		const siteFeatures = [
			{
				label: __( 'Overview' ),
				enabled: true,
				featureIds: [ OVERVIEW ],
			},
			{
				label: (
					<span>
						{ __( 'Hosting Features' ) }
						<HostingFeaturesIcon />
					</span>
				),
				enabled: ( isSimpleSite || isPlanExpired ) && ! isHostingFeaturesCalloutEnabled,
				featureIds: [ HOSTING_FEATURES ],
			},
			{
				label: __( 'Deployments' ),
				enabled: isHostingFeaturesEnabled,
				featureIds: [ DEPLOYMENTS ],
			},
			{
				label: __( 'Monitoring' ),
				enabled: isHostingFeaturesEnabled,
				featureIds: [ MONITORING ],
			},
			{
				label: __( 'Performance' ),
				enabled: isHostingFeaturesEnabled,
				featureIds: [ PERFORMANCE ],
			},
			{
				label: __( 'Logs' ),
				enabled: isHostingFeaturesEnabled,
				featureIds: [ LOGS_PHP, LOGS_WEB ],
			},
			{
				label: __( 'Staging Site' ),
				// We don't have the callout for the staging site tab since we'll retire the tab.
				enabled: isActiveAtomicSite,
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
			const defaultRoute = `/${ FEATURE_TO_ROUTE_MAP[ defaultFeatureId ].replace(
				':site',
				site.slug
			) }`;

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
						}
					},
				},
				enabled,
				preview: enabled ? selectedSiteFeaturePreview : null,
			};
		} );
	}, [
		isAtomicSite,
		isPlanExpired,
		__,
		isSimpleSite,
		site,
		selectedSiteFeature,
		selectedSiteFeaturePreview,
		isHostingFeaturesCalloutEnabled,
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
		canCurrentUserSwitchEnvironment( state, site )
	);

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
		isProduction && ( hasNoStagingSites || ! isStagingStatusFinished );

	return (
		<ItemView
			itemData={ itemData }
			closeItemView={ closeSitePreviewPane }
			features={ features }
			className={
				siteWithStagingIds.is_wpcom_staging_site && ! stagingSitesRedesign ? 'is-staging-site' : ''
			}
			enforceTabsView
			itemViewHeaderExtraProps={ {
				externalIconSize: 16,
				siteIconFallback: isInProgress ? 'migration' : 'first-grapheme',
				headerButtons: PreviewPaneHeaderButtons,
				subtitleExtra: () => {
					if ( isInProgress ) {
						return <SiteStatus site={ site } />;
					}

					if ( stagingSitesRedesign && shouldShowProductionBadge ) {
						return <SitesProductionBadge>{ __( 'Production' ) }</SitesProductionBadge>;
					}

					if ( hasEnvironmentPermission && isStagingStatusFinished ) {
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
