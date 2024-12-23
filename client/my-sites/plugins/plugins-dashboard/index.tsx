import pagejs from '@automattic/calypso-router';
import { Button, Count } from '@automattic/components';
import { DESKTOP_BREAKPOINT, WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPlugins from 'calypso/components/data/query-plugins';
import Layout from 'calypso/layout/multi-sites-dashboard';
import LayoutColumn from 'calypso/layout/multi-sites-dashboard/column';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
	LayoutHeaderSubtitle as Subtitle,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import UrlSearch from 'calypso/lib/url-search';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { useSelector } from 'calypso/state';
import {
	getPlugins,
	isRequestingForSites,
	isRequestingForAllSites,
	requestPluginsError,
	getPluginsWithUpdateStatuses,
} from 'calypso/state/plugins/installed/selectors';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import PluginsListDataViews from '../plugins-list/plugins-list-dataviews';
import type { View } from '@wordpress/dataviews';

import './style.scss';

interface PluginsDashboardProps {
	pluginSlug: string;
	doSearch: ( query: string ) => void; // prop coming from UrlSearch
	fullPlugin: object;
	showPlaceholder: boolean;
	isMarketplaceProduct: boolean;
	isWpcom: boolean;
	queryParams: {
		page: number;
		perPage: number;
		search: string;
	};
}

const siteSortingKeys = [
	{ dataView: 'site-title', sortKey: 'alphabetically' },
	{ dataView: 'last-publish', sortKey: 'updatedAt' },
	{ dataView: 'last-interacted', sortKey: 'lastInteractedWith' },
	{ dataView: 'plan', sortKey: 'plan' },
	{ dataView: 'status', sortKey: 'status' },
];

const DEFAULT_PER_PAGE = 50;
const DEFAULT_SITE_TYPE = 'non-p2';

const desktopFields = [ 'site', 'plan', 'status', 'last-publish', 'stats' ];
const mobileFields = [ 'site' ];
const listViewFields = [ 'site-title' ];

const getFieldsByBreakpoint = ( selectedSite: boolean, isDesktop: boolean ) => {
	if ( selectedSite ) {
		return listViewFields;
	}
	return isDesktop ? desktopFields : mobileFields;
};

export function showPluginsDashboardPage( route: string ) {
	const currentParams = new URL( window.location.href ).searchParams;
	const newUrl = new URL( route, window.location.origin );

	const supportedParams = [ 'page', 'per-page', 'search', 'status', 'siteType' ];
	supportedParams.forEach( ( param ) => {
		if ( currentParams.has( param ) ) {
			const value = currentParams.get( param );
			if ( value ) {
				newUrl.searchParams.set( param, value );
			}
		}
	} );

	pagejs.show( newUrl.toString().replace( window.location.origin, '' ) );
}

const PluginsDashboard = ( { pluginSlug, doSearch }: PluginsDashboardProps ) => {
	const sites = useSelector( ( state ) => getSelectedOrAllSitesWithPlugins( state ) );
	const siteIds = siteObjectsToSiteIds( sites ) ?? [];
	const currentPlugins = useSelector( ( state ) => getPlugins( state, siteIds, 'all' ) );
	console.log( currentPlugins );
	const isLoading = useSelector( ( state ) => isRequestingForAllSites( state ) );

	const bulkActionDialog = ( actionName, selectedPlugins ) => {
		// 	const { plugins, allSites, showPluginActionDialog } = this.props;
		// 	if ( ! this.props.newBulkPluginManagement ) {
		// 		selectedPlugins = selectedPlugins ? [ selectedPlugins ] : plugins.filter( this.isSelected );
		// 	}
		// 	const isJetpackIncluded = selectedPlugins.some( ( { slug } ) => slug === 'jetpack' );
		// 	const ALL_ACTION_CALLBACKS = {
		// 		[ PluginActions.ACTIVATE ]: this.activateSelected,
		// 		[ PluginActions.DEACTIVATE ]: isJetpackIncluded
		// 			? this.deactivateAndDisconnectSelected
		// 			: this.deactivateSelected,
		// 		[ PluginActions.REMOVE ]: isJetpackIncluded
		// 			? ( accepted ) => this.removeSelectedWithJetpack( accepted, selectedPlugins )
		// 			: ( accepted ) => this.removeSelected( accepted, selectedPlugins ),
		// 		[ PluginActions.UPDATE ]: this.updateSelected,
		// 		[ PluginActions.ENABLE_AUTOUPDATES ]: this.setAutoupdateSelected,
		// 		[ PluginActions.DISABLE_AUTOUPDATES ]: this.unsetAutoupdateSelected,
		// 	};
		// 	if ( actionName === PluginActions.UPDATE ) {
		// 		//filter out sites that don't have an update available
		// 		selectedPlugins = selectedPlugins.map( ( plugin ) => {
		// 			const filteredSites = Object.fromEntries(
		// 				Object.entries( plugin.sites ).filter( ( [ , site ] ) => site.update?.new_version )
		// 			);
		// 			return { ...plugin, sites: filteredSites };
		// 		} );
		// 	}
		// 	if ( this.props.newBulkPluginManagement ) {
		// 		this.setState( {
		// 			selectedPlugins,
		// 		} );
		// 	}
		// 	const selectedActionCallback = ALL_ACTION_CALLBACKS[ actionName ];
		// 	showPluginActionDialog( actionName, selectedPlugins, allSites, selectedActionCallback );
	};
	const dashboardTitle = pluginSlug ? `Manage ${ pluginSlug } in all sites` : 'Manage Plugins';
	return (
		<Layout
			className={ clsx(
				'sites-dashboard',
				'sites-dashboard__layout',
				! pluginSlug && 'preview-hidden'
			) }
			wide
			title={ dashboardTitle }
			disableGuidedTour
		>
			<DocumentHead title={ dashboardTitle } />
			<QueryPlugins />

			<LayoutColumn className="sites-overview" wide>
				<LayoutTop withNavigation={ false }>
					<LayoutHeader>
						<Title>{ translate( 'Manage Plugins' ) }</Title>
						<Subtitle>{ translate( 'Manage plugins installed on all sites' ) }</Subtitle>
						<Actions>
							<Button href="/plugins">{ translate( 'Browse plugins' ) }</Button>
							{ /* <SitesDashboardHeader isPreviewPaneOpen={ !! selectedSite } /> */ }
						</Actions>
					</LayoutHeader>
				</LayoutTop>

				<DocumentHead title={ dashboardTitle } />

				<PluginsListDataViews
					currentPlugins={ currentPlugins }
					initialSearch={ undefined }
					isLoading={ isLoading }
					onSearch={ doSearch }
					bulkActionDialog={ bulkActionDialog }
				/>
			</LayoutColumn>

			{ pluginSlug && (
				<LayoutColumn className="site-preview-pane" wide>
					<LayoutTop withNavigation={ false }>
						<LayoutHeader>
							<Title>
								{ translate( `Manage %(pluginSlug)s in all sites`, { args: { pluginSlug } } ) }
							</Title>
							<Actions>
								<Button href="/plugins/manage/sites">{ translate( 'Close' ) }</Button>
							</Actions>
						</LayoutHeader>
					</LayoutTop>
				</LayoutColumn>
			) }
		</Layout>
	);
};

export default UrlSearch( PluginsDashboard );
