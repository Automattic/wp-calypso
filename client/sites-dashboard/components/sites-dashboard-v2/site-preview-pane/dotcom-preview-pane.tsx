import { SiteExcerptData } from '@automattic/sites';
import React, { useEffect, useMemo, useState } from 'react';
import ItemPreviewPane, {
	createFeaturePreview,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
	DOTCOM_MONITORING,
	DOTCOM_GITHUB_DEPLOYMENTS,
} from './constants';

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
				<>
					<h2>
						<b>Overview</b> Preview Pane for
					</h2>{ ' ' }
					<b>{ site.slug }</b>
				</>
			),
			createFeaturePreview(
				DOTCOM_MONITORING,
				'Monitoring',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<>
					<h2>
						<b>Monitoring</b> Preview Pane for
					</h2>{ ' ' }
					<b>{ site.slug }</b>
				</>
			),
			createFeaturePreview(
				DOTCOM_GITHUB_DEPLOYMENTS,
				'GitHub Deployments',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<>
					<h2>
						<b>GitHub Deployments</b> Preview Pane for
					</h2>{ ' ' }
					<b>{ site.slug }</b>
				</>
			),
			createFeaturePreview(
				DOTCOM_HOSTING_CONFIG,
				'Hosting Config',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<>
					<h2>
						<b>Hosting Config</b> Preview Pane for
					</h2>{ ' ' }
					<b>{ site.slug }</b>
				</>
			),
		],
		[ selectedSiteFeature, setSelectedSiteFeature, site ]
	);

	return (
		<ItemPreviewPane
			itemTitle={ site.title }
			itemSubtitle={ site.slug }
			itemIcon={ site.icon?.img }
			closeSitePreviewPane={ closeSitePreviewPane }
			features={ features }
		/>
	);
};

export default DotcomPreviewPane;
