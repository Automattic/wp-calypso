import { MarketplaceSearchResult } from '@automattic/api-core';
import {
	marketplacePluginsQuery,
	marketplaceSearchQuery,
	pluginsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __experimentalGrid as Grid, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plugins as pluginIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { useMemo } from 'react';
import { pluginsManageRoute } from '../../app/router/plugins';
import { DataViewsCard } from '../../components/dataviews';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SwitcherContent from '../../components/switcher/switcher-content';
import { Text } from '../../components/text';
import { PluginTabs } from '../plugin';
import { usePlugin } from '../plugin/use-plugin';
import { useSitesById } from './hooks/use-sites-by-id';
import { mapApiPluginsToDataViewPlugins } from './utils';
import type { PluginListRow } from './types';

import './style.scss';

const ICON_SIZE = 32;
const FALLBACK_ICON_SIZE = 24;
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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Bind this to the switcher
	const searchParams = pluginsManageRoute.useSearch();
	const { pluginId: pluginSlug } = useParams( { strict: false } );
	const plugins = useMemo(
		() => mapApiPluginsToDataViewPlugins( sitesById, sitesPlugins ),
		[ sitesById, sitesPlugins ]
	);
	const {
		isLoading: isLoadingPlugin,
		plugin,
		pluginBySiteId,
		sitesWithThisPlugin,
		sitesWithoutThisPlugin,
	} = usePlugin( pluginSlug || plugins[ 0 ]?.slug );
	// console.debug( 'plugins', plugins );
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

	// console.debug( 'pluginsWithIcon', pluginsWithIcon );
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
			<Grid columns={ 2 } templateColumns="40% 1fr">
				<DataViewsCard>
					<SwitcherContent
						items={ pluginsWithIcon }
						getItemUrl={ ( item ) => `/plugins/manage/${ item.slug }` }
						renderItemMedia={ ( { item } ) => {
							const icon = item.icon ? (
								<img src={ item.icon } alt={ item.name } width={ ICON_SIZE } height={ ICON_SIZE } />
							) : (
								<Icon
									icon={ pluginIcon }
									size={ FALLBACK_ICON_SIZE }
									className="plugin-icon-fallback"
								/>
							);

							return (
								<div className={ clsx( 'plugin-icon-wrapper', { 'is-fallback': ! item.icon } ) }>
									{ icon }
								</div>
							);
						} }
						renderItemTitle={ ( { item } ) => {
							return <Text>{ item.name }</Text>;
						} }
						searchableFields={ searchableFields }
						onClose={ () => {} }
					/>
				</DataViewsCard>

				<DataViewsCard>
					<PluginTabs
						pluginSlug={ pluginSlug }
						isLoading={ isLoadingPlugin }
						plugin={ plugin }
						pluginName={ plugin?.name }
						pluginBySiteId={ pluginBySiteId }
						sitesWithThisPlugin={ sitesWithThisPlugin }
						sitesWithoutThisPlugin={ sitesWithoutThisPlugin }
					/>
				</DataViewsCard>
			</Grid>
		</PageLayout>
	);
}
