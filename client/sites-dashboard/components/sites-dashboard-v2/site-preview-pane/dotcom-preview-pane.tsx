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
				<>
					<div className="dotcom-preview-pane-content">
						<h2>
							<b>Overview</b>
							<br />
						</h2>
						Preview Pane
						<br />
						<b>{ site.slug }</b>
					</div>
				</>
			),
			createFeaturePreview(
				DOTCOM_MONITORING,
				'Monitoring',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<>
					<div className="dotcom-preview-pane-content">
						<h2>
							<b>Monitoring</b>
						</h2>
						Preview Pane
						<br />
						<b>{ site.slug }</b>
					</div>
				</>
			),
			createFeaturePreview(
				DOTCOM_GITHUB_DEPLOYMENTS,
				'GitHub Deployments',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<>
					<div className="dotcom-preview-pane-content">
						<h2>
							<b>GitHub Deployments</b>
						</h2>
						Preview Pane
						<br />
						<b>{ site.slug }</b>
					</div>
				</>
			),
			createFeaturePreview(
				DOTCOM_HOSTING_CONFIG,
				'Hosting Config',
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<>
					<div className="dotcom-preview-pane-content">
						<h2>
							<b>Hosting Config</b>
						</h2>
						Preview Pane
						<br />
						<b>{ site.slug }</b>
					</div>
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
