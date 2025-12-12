import { MarketplaceSearchResult } from '@automattic/api-core';
import {
	marketplacePluginsQuery,
	marketplaceSearchQuery,
	pluginsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { PluginSites } from './components/plugin-sites';
import { PluginSwitcher } from './components/plugin-switcher';
import { useSitesById } from './hooks/use-sites-by-id';
import { mapApiPluginsToDataViewPlugins } from './utils';
import type { PluginListRow } from './types';

const view: View = {
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
	const { data: sitesPlugins } = useQuery( pluginsQuery() );
	const { sitesById } = useSitesById();
	const { pluginId: pluginSlug } = useParams( { strict: false } );
	const fields = useMemo( () => {
		return searchableFields.map( ( searchableField ) => ( {
			...searchableField,
			enableGlobalSearch: true,
		} ) );
	}, [] );
	const { data: plugins } = useMemo(
		() =>
			filterSortAndPaginate(
				mapApiPluginsToDataViewPlugins( sitesById, sitesPlugins ),
				view,
				fields
			),
		[ sitesById, sitesPlugins, fields ]
	);
	const selectedPluginSlug = pluginSlug || plugins[ 0 ]?.slug;
	const { data: marketplacePlugins } = useQuery( marketplacePluginsQuery() );
	const { data: marketplaceSearch } = useQuery(
		marketplaceSearchQuery( {
			perPage: plugins.length,
			slugs: plugins.map( ( plugin ) => plugin.slug ),
		} )
	);

	const iconBySlug = useMemo( () => {
		const marketplacePluginsBySlug = new Map( Object.entries( marketplacePlugins?.results || {} ) );

		const marketplaceSearchBySlug = ( marketplaceSearch?.data.results || [] ).reduce(
			( acc, { fields } ) => {
				acc.set( fields.slug, fields );
				return acc;
			},
			new Map< string, MarketplaceSearchResult[ 'fields' ] >()
		);

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
	}, [ plugins, marketplacePlugins, marketplaceSearch ] );

	const pluginsWithIcon = useMemo( () => {
		return plugins.map( ( plugin ) => {
			return {
				...plugin,
				icon: iconBySlug?.get( plugin.slug ),
			};
		} );
	}, [ plugins, iconBySlug ] );

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
			<Grid columns={ 2 } gap={ 6 } templateColumns="392px 1fr">
				<PluginSwitcher
					pluginsWithIcon={ pluginsWithIcon }
					searchableFields={ searchableFields }
					selectedPluginSlug={ selectedPluginSlug }
					view={ view }
				/>

				<PluginSites selectedPluginSlug={ selectedPluginSlug } />
			</Grid>
		</PageLayout>
	);
}
