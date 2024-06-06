import { useHasEnTranslation } from '@automattic/i18n-utils';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo, useEffect } from 'react';
import ItemPreviewPane, {
	createFeaturePreview,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';
import DevToolsIcon from 'calypso/dev-tools/components/dev-tools-icon';
import SiteEnvironmentDropdown from 'calypso/sites-dashboard-v2/site-preview-pane/site-environment-dropdown';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
	DOTCOM_MONITORING,
	DOTCOM_LOGS,
	DOTCOM_GITHUB_DEPLOYMENTS,
	DOTCOM_DEVELOPER_TOOLS,
	DOTCOM_STAGING_SITE,
} from './constants';
import PreviewPaneHeaderButtons from './preview-pane-header-buttons';

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

	const features = useMemo(
		() => [
			createFeaturePreview(
				DOTCOM_OVERVIEW,
				__( 'Overview' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_DEVELOPER_TOOLS,
				<span>
					{ hasEnTranslation( 'Hosting Settings' ) ? __( 'Hosting Settings' ) : __( 'Dev Tools' ) }
					<DevToolsIcon />
				</span>,
				isSimpleSite || isPlanExpired,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_GITHUB_DEPLOYMENTS,
				__( 'Deployments' ),
				isAtomicSite && ! isPlanExpired,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_MONITORING,
				__( 'Monitoring' ),
				isAtomicSite && ! isPlanExpired,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_LOGS,
				__( 'Logs' ),
				isAtomicSite && ! isPlanExpired,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_STAGING_SITE,
				__( 'Staging Site' ),
				isAtomicSite && ! isPlanExpired,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_HOSTING_CONFIG,
				hasEnTranslation( 'Server Settings' ) ? __( 'Server Settings' ) : __( 'Server Config' ),
				isAtomicSite && ! isPlanExpired,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
		],
		[
			__,
			selectedSiteFeature,
			setSelectedSiteFeature,
			selectedSiteFeaturePreview,
			isSimpleSite,
			isPlanExpired,
			isAtomicSite,
		]
	);

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
				menuButtons: () => (
					<SiteEnvironmentDropdown onChange={ changeSitePreviewPane } site={ site } />
				),
			} }
		/>
	);
};

export default DotcomPreviewPane;
