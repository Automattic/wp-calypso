import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useMemo } from 'react';
import ItemPreviewPane, {
	createFeaturePreview,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
	DOTCOM_MONITORING,
	DOTCOM_PHP_LOGS,
	DOTCOM_SERVER_LOGS,
	DOTCOM_GITHUB_DEPLOYMENTS,
} from './constants';

import './style.scss';

type Props = {
	site: SiteExcerptData;
	selectedSiteFeature: string;
	setSelectedSiteFeature: ( feature: string ) => void;
	selectedSiteFeaturePreview: React.ReactNode;
	closeSitePreviewPane: () => void;
};

const DotcomPreviewPane = ( {
	site,
	selectedSiteFeature,
	setSelectedSiteFeature,
	selectedSiteFeaturePreview,
	closeSitePreviewPane,
}: Props ) => {
	const { __ } = useI18n();

	const isDotcomSite = !! site.is_wpcom_atomic || !! site.is_wpcom_staging_site;

	// Dotcom tabs: Overview, Monitoring, GitHub Deployments, Hosting Config
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
				DOTCOM_HOSTING_CONFIG,
				__( 'Hosting Config' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_MONITORING,
				__( 'Monitoring' ),
				isDotcomSite,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_PHP_LOGS,
				__( 'PHP Logs' ),
				isDotcomSite,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_SERVER_LOGS,
				__( 'Server Logs' ),
				isDotcomSite,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
			createFeaturePreview(
				DOTCOM_GITHUB_DEPLOYMENTS,
				__( 'GitHub Deployments' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				selectedSiteFeaturePreview
			),
		],
		[ selectedSiteFeature, setSelectedSiteFeature, selectedSiteFeaturePreview, site ]
	);

	const itemData: ItemData = {
		title: site.title,
		subtitle: site.slug,
		url: site.URL,
		blogId: site.ID,
		isDotcomSite: site.is_wpcom_atomic || site.is_wpcom_staging_site,
		adminUrl: site.options?.admin_url || `${ site.URL }/wp-admin`,
	};

	return (
		<ItemPreviewPane
			itemData={ itemData }
			closeItemPreviewPane={ closeSitePreviewPane }
			features={ features }
			itemPreviewPaneHeaderExtraProps={ {
				externalIconSize: 16,
			} }
		/>
	);
};

export default DotcomPreviewPane;
