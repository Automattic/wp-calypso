import { useHasEnTranslation } from '@automattic/i18n-utils';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo, useEffect } from 'react';
import ItemPreviewPane from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import HostingFeaturesIcon from 'calypso/hosting-features/components/hosting-features-icon';
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
				id: 'overview',
				label: __( 'Overview' ),
				enabled: true,
				featureIds: [ DOTCOM_OVERVIEW ],
			},
			{
				DOTCOM_HOSTING_FEATURES,
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
				id: 'deployments',
				label: __( 'Deployments' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_GITHUB_DEPLOYMENTS ],
			},
			{
				id: 'monitoring',
				label: __( 'Monitoring' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_MONITORING ],
			},
			{
				id: 'logs',
				label: __( 'Logs' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_LOGS_PHP, DOTCOM_LOGS_WEB ],
			},
			{
				id: 'staging-site',
				label: __( 'Staging Site' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_STAGING_SITE ],
			},
			{
				id: 'server-settings',
				label: hasEnTranslation( 'Server Settings' )
					? __( 'Server Settings' )
					: __( 'Server Config' ),
				enabled: isActiveAtomicSite,
				featureIds: [ DOTCOM_HOSTING_CONFIG ],
			},
		];

		return siteFeatures.map( ( { id, label, enabled, featureIds } ) => {
			const selected = enabled && featureIds.includes( selectedSiteFeature );
			return {
				id,
				tab: {
					label,
					visible: enabled,
					selected,
					onTabClick: () => {
						if ( enabled && ! selected ) {
							setSelectedSiteFeature( featureIds[ 0 ] );
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

	return (
		<ItemPreviewPane
			itemData={ itemData }
			closeItemPreviewPane={ closeSitePreviewPane }
			features={ features }
			itemPreviewPaneHeaderExtraProps={ {
				externalIconSize: 16,
				siteIconFallback: 'first-grapheme',
				headerButtons: PreviewPaneHeaderButtons,
			} }
		/>
	);
};

export default DotcomPreviewPane;
