import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useMemo, useState } from 'react';
import ItemPreviewPane, {
	createFeaturePreview,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';
import HostingOverview from 'calypso/hosting-overview/components/hosting-overview';
import { GitHubDeployments } from 'calypso/my-sites/github-deployments/deployments';
import Hosting from 'calypso/my-sites/hosting/main';
import SiteMonitoringPhpLogs from 'calypso/site-monitoring/components/php-logs';
import SiteMonitoringServerLogs from 'calypso/site-monitoring/components/server-logs';
import SiteMonitoringOverview from 'calypso/site-monitoring/components/site-monitoring-overview';
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
	closeSitePreviewPane: () => void;
};

const DotcomPreviewPane = ( { site, closeSitePreviewPane }: Props ) => {
	const { __ } = useI18n();

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
				__( 'Overview' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<HostingOverview />
			),
			createFeaturePreview(
				DOTCOM_HOSTING_CONFIG,
				__( 'Hosting Config' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<Hosting />
			),
			createFeaturePreview(
				DOTCOM_MONITORING,
				__( 'Monitoring' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<SiteMonitoringOverview />
			),
			createFeaturePreview(
				DOTCOM_PHP_LOGS,
				__( 'PHP Logs' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<SiteMonitoringPhpLogs />
			),
			createFeaturePreview(
				DOTCOM_SERVER_LOGS,
				__( 'Server Logs' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<SiteMonitoringServerLogs />
			),
			createFeaturePreview(
				DOTCOM_GITHUB_DEPLOYMENTS,
				__( 'GitHub Deployments' ),
				true,
				selectedSiteFeature,
				setSelectedSiteFeature,
				<GitHubDeployments />
			),
		],
		[ selectedSiteFeature, setSelectedSiteFeature, site ]
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
