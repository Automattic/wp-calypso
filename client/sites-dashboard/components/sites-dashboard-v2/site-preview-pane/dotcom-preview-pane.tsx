import { SiteExcerptData } from '@automattic/sites';
import React, { useEffect, useMemo, useState } from 'react';
import ItemPreviewPane, {
	createFeaturePreview,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';
import HostingOverview from 'calypso/hosting-overview/components/hosting-overview';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
	DOTCOM_MONITORING,
	DOTCOM_GITHUB_DEPLOYMENTS,
} from './constants';
import PreviewPaneSample from './preview-pane-sample';

import './style.scss';

type Props = {
	site: SiteExcerptData;
	closeSitePreviewPane: () => void;
};

const DotcomPreviewPane = ( { site, closeSitePreviewPane }: Props ) => {
	const [ selectedSiteFeature, setSelectedSiteFeature ] = useState< string | undefined >(
		'dotcom-overview'
	);

	useEffect( () => {
		if ( selectedSiteFeature === undefined ) {
			setSelectedSiteFeature( DOTCOM_OVERVIEW );
		}
		return () => {
			setSelectedSiteFeature( undefined );
		};
	}, [] );

	// Dotcom tabs: Overview, Monitoring, GitHub Deployments, Hosting Config
	const features = useMemo(
		() => [
			createFeaturePreview(
				DOTCOM_OVERVIEW,
				'Overview',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<HostingOverview />
			),
			createFeaturePreview(
				DOTCOM_MONITORING,
				'Monitoring',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<PreviewPaneSample site={ site } tabName="Monitoring" />
			),
			createFeaturePreview(
				DOTCOM_GITHUB_DEPLOYMENTS,
				'GitHub Deployments',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<PreviewPaneSample site={ site } tabName="GitHub Deployments" />
			),
			createFeaturePreview(
				DOTCOM_HOSTING_CONFIG,
				'Hosting Config',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<PreviewPaneSample site={ site } tabName="Hosting Config" />
			),
		],
		[ selectedSiteFeature, setSelectedSiteFeature, site ]
	);

	const itemData: ItemData = {
		title: site.title,
		subtitle: site.slug,
		icon: site.icon?.img,
	};

	return (
		<ItemPreviewPane
			itemData={ itemData }
			closeItemPreviewPane={ closeSitePreviewPane }
			features={ features }
		/>
	);
};

export default DotcomPreviewPane;
