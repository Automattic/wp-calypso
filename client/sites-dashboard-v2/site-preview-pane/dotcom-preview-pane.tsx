import { FEATURE_SFTP, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo, useEffect } from 'react';
import ItemPreviewPane, {
	createFeaturePreview,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';
import DevToolsIcon from 'calypso/dev-tools-promo/components/dev-tools-icon';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
	DOTCOM_MONITORING,
	DOTCOM_PHP_LOGS,
	DOTCOM_SERVER_LOGS,
	DOTCOM_GITHUB_DEPLOYMENTS,
	DOTCOM_DEVELOPER_TOOLS_PROMO,
} from './constants';
import PreviewPaneHeaderButtons from './preview-pane-header-buttons';

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

	const isAtomicSite = !! site.is_wpcom_atomic || !! site.is_wpcom_staging_site;
	const isJetpackSite = site.jetpack;
	const isPlanExpired = !! site.plan?.expired;
	const siteId = site?.ID ?? null;
	const { hasAtomicFeature, hasSftpFeature } = useSelector( ( state ) => ( {
		hasAtomicFeature: siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC ),
		hasSftpFeature: siteHasFeature( state, siteId, FEATURE_SFTP ),
	} ) );

	// Check for site features to determine if the promo should be shown in case the site has yet to transfer to Atomic.
	const shouldShowDevToolsPromo =
		! isJetpackSite &&
		( isPlanExpired || ! hasAtomicFeature || ( ! hasSftpFeature && ! site.is_wpcom_staging_site ) );

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
				DOTCOM_DEVELOPER_TOOLS_PROMO,
				<span>
					{ __( 'Dev Tools' ) } <DevToolsIcon />
				</span>,
				shouldShowDevToolsPromo,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_HOSTING_CONFIG,
				__( 'Hosting Config' ),
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
				DOTCOM_PHP_LOGS,
				__( 'PHP Logs' ),
				isAtomicSite && ! isPlanExpired,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_SERVER_LOGS,
				__( 'Server Logs' ),
				isAtomicSite && ! isPlanExpired,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_GITHUB_DEPLOYMENTS,
				__( 'GitHub Deployments' ),
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
			isJetpackSite,
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
