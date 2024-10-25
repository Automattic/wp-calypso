import config from '@automattic/calypso-config';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo, useEffect } from 'react';
import ItemPreviewPane from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import { useStagingSite } from 'calypso/hosting/staging-site/hooks/use-staging-site';
import { useSelector } from 'calypso/state';
import { StagingSiteStatus } from 'calypso/state/staging-site/constants';
import { getStagingSiteStatus } from 'calypso/state/staging-site/selectors';
import {
	SITE_OVERVIEW,
	SITE_PERFORMANCE,
	SITE_MARKETING_TOOLS,
	SITE_MARKETING_BUSINESS_TOOLS,
	SITE_TOOLS_STAGING_SITE,
	SITE_TOOLS_DEPLOYMENTS,
	SITE_TOOLS_MONITORING,
	SITE_TOOLS_LOGS,
	SITE_TOOLS_SFTP_SSH,
	SITE_TOOLS_DATABASE,
	SITE_MARKETING_CONNECTIONS,
	SITE_MARKETING_TRAFFIC,
	SITE_MARKETING_SHARING_BUTTONS,
	SITE_SETTINGS_SITE,
	SITE_SETTINGS_ADMINISTRATION,
	SITE_SETTINGS_AGENCY,
	SITE_SETTINGS_WEB_SERVER,
	SITE_SETTINGS_CACHES,
} from './constants';
import PreviewPaneHeaderButtons from './preview-pane-header-buttons';
import SiteEnvironmentSwitcher from './site-environment-switcher';
import type {
	ItemData,
	FeaturePreviewInterface,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';

interface Props {
	site: SiteExcerptData;
	selectedSiteFeature: string;
	setSelectedSiteFeature: ( feature: string ) => void;
	selectedSiteFeaturePreview: React.ReactNode;
	closeSitePreviewPane: () => void;
	changeSitePreviewPane: ( siteId: number ) => void;
}

const OVERLAY_MODAL_SELECTORS = [
	'body.modal-open',
	'#wpnc-panel.wpnt-open',
	'div.help-center__container:not(.is-minimized)',
];

const DotcomPreviewPane = ( {
	site,
	selectedSiteFeature,
	setSelectedSiteFeature,
	selectedSiteFeaturePreview,
	closeSitePreviewPane,
	changeSitePreviewPane,
}: Props ) => {
	const { __ } = useI18n();
	const hasEnTranslation = useHasEnTranslation();

	const isAtomicSite = !! site.is_wpcom_atomic || !! site.is_wpcom_staging_site;
	const isSimpleSite = ! site.jetpack && ! site.is_wpcom_atomic;
	const isPlanExpired = !! site.plan?.expired;

	const features: FeaturePreviewInterface[] = useMemo( () => {
		const isActiveAtomicSite = isAtomicSite && ! isPlanExpired;
		const siteFeatures = [
			{
				label: __( 'Overview' ),
				enabled: true,
				featureIds: [ SITE_OVERVIEW ],
			},

			{
				label: __( 'Performance' ),
				enabled: isActiveAtomicSite && config.isEnabled( 'performance-profiler/logged-in' ),
				featureIds: [ SITE_PERFORMANCE ],
			},
			{
				label: __( 'Marketing' ),
				enabled: true,
				featureIds: [
					SITE_MARKETING_TOOLS,
					SITE_MARKETING_BUSINESS_TOOLS,
					SITE_MARKETING_CONNECTIONS,
					SITE_MARKETING_TRAFFIC,
					SITE_MARKETING_SHARING_BUTTONS,
				],
			},
			{
				label: __( 'Advanced Tools' ),
				enabled: true,
				featureIds: [
					SITE_TOOLS_STAGING_SITE,
					SITE_TOOLS_DEPLOYMENTS,
					SITE_TOOLS_MONITORING,
					SITE_TOOLS_LOGS,
					SITE_TOOLS_SFTP_SSH,
					SITE_TOOLS_DATABASE,
				],
			},
			{
				label: __( 'Settings' ),
				enabled: true,
				featureIds: [
					SITE_SETTINGS_SITE,
					SITE_SETTINGS_ADMINISTRATION,
					SITE_SETTINGS_AGENCY,
					SITE_SETTINGS_WEB_SERVER,
					SITE_SETTINGS_CACHES,
				],
			},
		];

		return siteFeatures.map( ( { label, enabled, featureIds } ) => {
			const selected = enabled && featureIds.includes( selectedSiteFeature );
			const defaultFeatureId = featureIds[ 0 ];
			return {
				id: defaultFeatureId,
				tab: {
					label,
					visible: enabled,
					selected,
					onTabClick: () => {
						if ( enabled && ! selected ) {
							setSelectedSiteFeature( defaultFeatureId );
						}
					},
				},
				enabled,
				preview: enabled ? selectedSiteFeaturePreview : null,
			};
		} );
	}, [
		__,
		selectedSiteFeature,
		setSelectedSiteFeature,
		selectedSiteFeaturePreview,
		isSimpleSite,
		isPlanExpired,
		isAtomicSite,
	] );

	const itemData: ItemData = {
		title: site.title,
		subtitle: site.slug,
		url: site.URL,
		blogId: site.ID,
		isDotcomSite: site.is_wpcom_atomic || site.is_wpcom_staging_site,
		adminUrl: site.options?.admin_url || `${ site.URL }/wp-admin`,
		withIcon: true,
	};

	useEffect( () => {
		const handleKeydown = ( e: KeyboardEvent ) => {
			if ( e.key !== 'Escape' ) {
				return;
			}

			if ( document.querySelector( OVERLAY_MODAL_SELECTORS.join( ',' ) ) ) {
				return;
			}

			closeSitePreviewPane();
		};

		document.addEventListener( 'keydown', handleKeydown, true );
		return () => {
			document.removeEventListener( 'keydown', handleKeydown, true );
		};
	}, [ closeSitePreviewPane ] );

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

	return (
		<ItemPreviewPane
			itemData={ itemData }
			closeItemPreviewPane={ closeSitePreviewPane }
			features={ features }
			className={ site.is_wpcom_staging_site ? 'is-staging-site' : '' }
			itemPreviewPaneHeaderExtraProps={ {
				externalIconSize: 16,
				siteIconFallback: 'first-grapheme',
				headerButtons: PreviewPaneHeaderButtons,
				subtitleExtra: () =>
					( site.is_wpcom_staging_site || isStagingStatusFinished ) && (
						<SiteEnvironmentSwitcher onChange={ changeSitePreviewPane } site={ site } />
					),
			} }
		/>
	);
};

export default DotcomPreviewPane;
