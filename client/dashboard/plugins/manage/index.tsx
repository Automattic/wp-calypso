import { MarketplaceSearchResult } from '@automattic/api-core';
import {
	marketplacePluginsQuery,
	marketplaceSearchQuery,
	pluginsQuery,
} from '@automattic/api-queries';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { PluginSites } from './components/plugin-sites';
import { PluginSwitcher } from './components/plugin-switcher';
import { useSitesById } from './hooks/use-sites-by-id';
import { mapApiPluginsToDataViewPlugins } from './utils';
import type { PluginListRow } from './types';

const BATCH_SIZE = 20;

const DEFAULT_VIEW: View = {
	type: 'list',
	page: 1,
	perPage: 100,
	sort: { field: 'name', direction: 'asc' },
};
const searchableFields = [
	{
		id: 'name',
		getValue: ( { item }: { item: PluginListRow } ) => item.name,
	},
	{
		id: 'slug',
		getValue: ( { item }: { item: PluginListRow } ) => item.slug,
	},
];

export default function PluginsList() {
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const { data: sitesPlugins } = useQuery( pluginsQuery() );
	const { sitesById } = useSitesById();
	const { pluginId: pluginSlug } = useParams( { strict: false } );
	const fields = useMemo( () => {
		return searchableFields.map( ( searchableField ) => ( {
			...searchableField,
			enableGlobalSearch: true,
		} ) );
	}, [] );
	const { data: plugins, paginationInfo } = useMemo(
		() =>
			filterSortAndPaginate(
				mapApiPluginsToDataViewPlugins( sitesById, sitesPlugins ),
				view,
				fields
			),
		[ fields, sitesById, sitesPlugins, view ]
	);
	const selectedPluginSlug = pluginSlug || plugins[ 0 ]?.slug;
	const { data: marketplacePlugins } = useQuery( marketplacePluginsQuery() );

	// Batch plugin slugs into chunks of BATCH_SIZE to comply with API limit
	const slugBatches = useMemo( () => {
		const pluginSlugs = plugins.map( ( plugin ) => plugin.slug );
		const batches: string[][] = [];
		for ( let i = 0; i < pluginSlugs.length; i += BATCH_SIZE ) {
			batches.push( pluginSlugs.slice( i, i + BATCH_SIZE ) );
		}
		return batches;
	}, [ plugins ] );

	const marketplaceSearchResults = useQueries( {
		queries:
			slugBatches.length > 0
				? slugBatches.map( ( slugs ) =>
						marketplaceSearchQuery( {
							perPage: BATCH_SIZE,
							slugs,
							groupId: 'wporg',
						} )
				  )
				: [],
	} );

	const iconBySlug = useMemo( () => {
		// Only recalculate once all queries have data
		const allQueriesLoaded = marketplaceSearchResults.every( ( result ) => result.isSuccess );
		if ( ! allQueriesLoaded ) {
			return new Map< string, PluginListRow[ 'icon' ] >();
		}

		const marketplacePluginsBySlug = new Map( Object.entries( marketplacePlugins?.results || {} ) );

		const marketplaceSearchBySlug = marketplaceSearchResults
			.flatMap( ( result ) => result.data?.data.results || [] )
			.reduce( ( acc, { fields } ) => {
				acc.set( fields.slug, fields );
				return acc;
			}, new Map< string, MarketplaceSearchResult[ 'fields' ] >() );

		return plugins.reduce( ( acc, { slug } ) => {
			let icon;
			if ( marketplacePluginsBySlug.has( slug ) ) {
				icon = marketplacePluginsBySlug.get( slug )?.icons;
			} else if ( marketplaceSearchBySlug.has( slug ) ) {
				icon = marketplaceSearchBySlug.get( slug )?.plugin?.icons;
			}

			acc.set( slug, icon );

			return acc;
		}, new Map< string, PluginListRow[ 'icon' ] >() );
	}, [ plugins, marketplacePlugins, marketplaceSearchResults ] );

	const pluginsWithIcon = useMemo( () => {
		return plugins.map( ( plugin ) => {
			return {
				...plugin,
				icon: iconBySlug?.get( plugin.slug ),
			};
		} );
	}, [ plugins, iconBySlug ] );

	if ( isSmallViewport ) {
		return (
			<PageLayout
				size="large"
				header={
					<PageHeader
						title={ pluginSlug ? __( 'Plugin details' ) : __( 'Manage plugins' ) }
						description={
							pluginSlug ? null : __( 'Install, activate, and manage plugins across your sites.' )
						}
						prefix={ pluginSlug ? <Breadcrumbs length={ 2 } /> : null }
					/>
				}
				notices={ <OptInWelcome tracksContext="plugins" /> }
			>
				{ pluginSlug ? (
					<PluginSites selectedPluginSlug={ selectedPluginSlug } />
				) : (
					<PluginSwitcher
						pluginsWithIcon={ pluginsWithIcon }
						searchableFields={ searchableFields }
						view={ view }
						onChangeView={ setView }
						paginationInfo={ paginationInfo }
					/>
				) }
			</PageLayout>
		);
	}

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={ __( 'Manage plugins' ) }
					description={ __( 'Install, activate, and manage plugins across your sites.' ) }
				/>
			}
			notices={ <OptInWelcome tracksContext="plugins" /> }
		>
			<Grid columns={ 2 } gap={ 3 } templateColumns="392px 1fr">
				<PluginSwitcher
					pluginsWithIcon={ pluginsWithIcon }
					searchableFields={ searchableFields }
					selectedPluginSlug={ selectedPluginSlug }
					view={ view }
					onChangeView={ setView }
					paginationInfo={ paginationInfo }
				/>

				<PluginSites selectedPluginSlug={ selectedPluginSlug } />
			</Grid>
		</PageLayout>
	);
}
