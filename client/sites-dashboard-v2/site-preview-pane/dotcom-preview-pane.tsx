import { useHasEnTranslation } from '@automattic/i18n-utils';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo, useEffect } from 'react';
import ItemPreviewPane from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import HostingFeaturesIcon from 'calypso/hosting-features/components/hosting-features-icon';
import { useStagingSite } from 'calypso/my-sites/hosting/staging-site-card/use-staging-site';
import SiteEnvironmentSwitcher from 'calypso/sites-dashboard-v2/site-preview-pane/site-environment-switcher';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
	DOTCOM_MONITORING,
	DOTCOM_LOGS_PHP,
	DOTCOM_LOGS_WEB,
	DOTCOM_GITHUB_DEPLOYMENTS,
	DOTCOM_HOSTING_FEATURES,
	DOTCOM_STAGING_SITE,
} from './constants';
import PreviewPaneHeaderButtons from './preview-pane-header-buttons';
import type {
	ItemData,
	FeaturePreviewInterface,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';

type Props = {
	site: SiteExcerptData;
	selectedSiteFeature: string;
	setSelectedSiteFeature: ( feature: string ) => void;
	selectedSiteFeaturePreview: React.ReactNode;
	closeSitePreviewPane: () => void;
	changeSitePreviewPane: ( siteId: number ) => void;
};

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
	const isSimpleSite = ! site.jetpack;
	const isPlanExpired = !! site.plan?.expired;

	const features: FeaturePreviewInterface[] = useMemo( () => {
		const isActiveAtomicSite = isAtomicSite && ! isPlanExpired;
		const siteFeatures = [
			{
				label: __( 'Overview' ),
				enabled: true,
				featureIds: [ DOTCOM_OVERVIEW ],
			},
			{
				label: (
					<span>
						{ hasEnTranslation( 'Hosting Features' )
							? __( 'Hosting Features' )
							: __( 'Dev Tools' ) }
						<HostingFeaturesIcon />
					</span>
				),
				enabled: isSimpleSite || isPlanExpired,
				featureIds: [ DOTCOM_HOSTING_FEATURES ],
			},
			{
				label: __( 'Deployments' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_GITHUB_DEPLOYMENTS ],
			},
			{
				label: __( 'Monitoring' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_MONITORING ],
			},
			{
				label: __( 'Logs' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_LOGS_PHP, DOTCOM_LOGS_WEB ],
			},
			{
				label: __( 'Staging Site' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_STAGING_SITE ],
			},
			{
				label: hasEnTranslation( 'Server Settings' )
					? __( 'Server Settings' )
					: __( 'Server Config' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_HOSTING_CONFIG ],
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

	if ( site.options ) {
		site.options.wpcom_staging_blog_ids =
			stagingSites?.map( ( stagingSite ) => stagingSite.id ) ?? [];
	}

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
				subtitleExtra: () => (
					<SiteEnvironmentSwitcher onChange={ changeSitePreviewPane } site={ site } />
				),
			} }
		/>
	);
};

export default DotcomPreviewPane;
