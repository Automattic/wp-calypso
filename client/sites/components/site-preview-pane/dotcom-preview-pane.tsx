import { useHasEnTranslation } from '@automattic/i18n-utils';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo } from 'react';
import { getMigrationStatus } from 'calypso/data/site-migration';
import ItemView from 'calypso/layout/hosting-dashboard/item-view';
import { useSetTabBreadcrumb } from 'calypso/sites/hooks/breadcrumbs/use-set-tab-breadcrumb';
import HostingFeaturesIcon from 'calypso/sites/hosting/components/hosting-features-icon';
import { useStagingSite } from 'calypso/sites/staging-site/hooks/use-staging-site';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
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
	const hasEnTranslation = useHasEnTranslation();

	const isAtomicSite = !! site.is_wpcom_atomic || !! site.is_wpcom_staging_site;
	const isSimpleSite = ! site.jetpack && ! site.is_wpcom_atomic;
	const isPlanExpired = !! site.plan?.expired;
	const isMigrationPending = getMigrationStatus( site ) === 'pending';

	const features: FeaturePreviewInterface[] = useMemo( () => {
		const isActiveAtomicSite = isAtomicSite && ! isPlanExpired;
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
				enabled: isSimpleSite || isPlanExpired,
				featureIds: [ HOSTING_FEATURES ],
			},
			{
				label: __( 'Deployments' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DEPLOYMENTS ],
			},
			{
				label: __( 'Monitoring' ),
				enabled: isActiveAtomicSite,
				featureIds: [ MONITORING ],
			},
			{
				label: __( 'Performance' ),
				enabled: isActiveAtomicSite,
				featureIds: [ PERFORMANCE ],
			},
			{
				label: __( 'Logs' ),
				enabled: isActiveAtomicSite,
				featureIds: [ LOGS_PHP, LOGS_WEB ],
			},
			{
				label: __( 'Staging Site' ),
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
						if ( enabled && ! selected ) {
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
		hasEnTranslation,
		isSimpleSite,
		site,
		selectedSiteFeature,
		selectedSiteFeaturePreview,
	] );

	const itemData: ItemData = {
		title: isMigrationPending ? __( 'Incoming Migration' ) : site.title,
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

	if ( site.options && site.is_wpcom_atomic ) {
		site.options.wpcom_staging_blog_ids =
			stagingSites?.map( ( stagingSite ) => stagingSite.id ) ?? [];
	}

	const stagingStatus = useSelector( ( state ) => getStagingSiteStatus( state, site.ID ) );
	const isStagingStatusFinished =
		stagingStatus === StagingSiteStatus.COMPLETE ||
		stagingStatus === StagingSiteStatus.NONE ||
		stagingStatus === StagingSiteStatus.UNSET;

	const hasStagingSitePermission = stagingSites?.some(
		( stagingSite ) => stagingSite.user_has_permission
	);

	const hasManageOptionsPermission = useSelector( ( state ) => {
		if ( site.is_wpcom_staging_site ) {
			return canCurrentUser( state, site.options?.wpcom_production_blog_id, 'manage_options' );
		}

		return canCurrentUser( state, site.ID, 'manage_options' );
	} );

	const { breadcrumbs, shouldShowBreadcrumbs } = useBreadcrumbs();
	useSetTabBreadcrumb( {
		site,
		features,
		selectedFeatureId: selectedSiteFeature,
	} );

	return (
		<ItemView
			itemData={ itemData }
			closeItemView={ closeSitePreviewPane }
			features={ features }
			className={ site.is_wpcom_staging_site ? 'is-staging-site' : '' }
			enforceTabsView
			itemViewHeaderExtraProps={ {
				externalIconSize: 16,
				siteIconFallback: isMigrationPending ? 'migration' : 'first-grapheme',
				headerButtons: PreviewPaneHeaderButtons,
				subtitleExtra: () => {
					if ( isMigrationPending ) {
						return <SiteStatus site={ site } />;
					}

					if (
						( hasStagingSitePermission &&
							! site.is_wpcom_staging_site &&
							isStagingStatusFinished ) ||
						( hasManageOptionsPermission && site.is_wpcom_staging_site )
					) {
						return <SiteEnvironmentSwitcher onChange={ changeSitePreviewPane } site={ site } />;
					}
				},
			} }
			breadcrumbs={ breadcrumbs }
			shouldShowBreadcrumbs={ shouldShowBreadcrumbs }
		/>
	);
};

export default DotcomPreviewPane;
