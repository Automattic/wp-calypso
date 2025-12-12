import { MarketplaceSearchResult } from '@automattic/api-core';
import {
	marketplacePluginsQuery,
	marketplaceSearchQuery,
	pluginsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import {
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { plugins as pluginIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { useMemo } from 'react';
import { pluginRoute } from '../../app/router/plugins';
import { Card, CardBody } from '../../components/card';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import SwitcherContent from '../../components/switcher/switcher-content';
import { Text } from '../../components/text';
import { TextBlur } from '../../components/text-blur';
import { PluginTabs } from '../plugin';
import { usePlugin } from '../plugin/use-plugin';
import { useSitesById } from './hooks/use-sites-by-id';
import { mapApiPluginsToDataViewPlugins } from './utils';
import type { PluginListRow } from './types';
import './style.scss';

const ICON_SIZE = 40;
const FALLBACK_ICON_SIZE = 30;
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
	const {
		icon,
		isLoading: isLoadingPlugin,
		plugin,
		pluginBySiteId,
		sitesWithThisPlugin,
		sitesWithoutThisPlugin,
	} = usePlugin( selectedPluginSlug );
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

	const decoration = useMemo( () => {
		if ( icon ) {
			return <img className="plugin-icon" src={ icon } alt={ plugin?.name } />;
		} else if ( isLoadingPlugin ) {
			return <div className="plugin-icon-placeholder" aria-hidden="true" />;
		}
	}, [ icon, isLoadingPlugin, plugin?.name ] );

	const title = useMemo( () => {
		if ( ! isLoadingPlugin && ! plugin ) {
			return __( 'Plugin not found' );
		}

		return plugin ? (
			// @ts-expect-error: Can only set one of `children` or `props.dangerouslySetInnerHTML`.
			<Text dangerouslySetInnerHTML={ { __html: plugin.name } } />
		) : (
			<TextBlur>{ pluginSlug }</TextBlur>
		);
	}, [ isLoadingPlugin, plugin, pluginSlug ] );

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
				<Card>
					<CardBody className="plugin-switcher-card-body">
						<SwitcherContent
							itemClassName={ ( item ) =>
								clsx( 'plugin-switcher-item', { 'is-selected': selectedPluginSlug === item.slug } )
							}
							searchClassName="plugin-switcher-search"
							initialView={ view }
							items={ pluginsWithIcon }
							resetScroll={ false }
							getItemUrl={ ( item ) => pluginRoute.to.replace( '$pluginId', item.slug ) }
							renderItemMedia={ ( { item } ) => {
								const icon = item.icon ? (
									<img
										src={ item.icon }
										alt={ item.name }
										width={ ICON_SIZE }
										height={ ICON_SIZE }
									/>
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
								const sitesText = sprintf(
									// translators: %(siteCount)d is the number of sites the plugin is installed on.
									_n( '%(siteCount)d site', '%(siteCount)d sites', item.sitesCount ),
									{ siteCount: item.sitesCount }
								);

								const updatesText = item.sitesWithPluginUpdate.length
									? sprintf(
											// translators: %(updateCount)d is the number of updates available.
											_n(
												'%(updateCount)d update available',
												'%(updateCount)d updates available',
												item.sitesWithPluginUpdate.length
											),
											{ updateCount: item.sitesWithPluginUpdate.length }
									  )
									: '';

								return (
									<VStack spacing={ 0 }>
										{ /* @ts-expect-error: Can only set one of `children` or `props.dangerouslySetInnerHTML`. */ }
										<Text
											className="plugin-switcher-item-name"
											dangerouslySetInnerHTML={ { __html: item.name } }
											title={ item.name }
										/>
										<Text variant="muted">
											{ updatesText ? `${ sitesText }, ${ updatesText }` : sitesText }
										</Text>
									</VStack>
								);
							} }
							searchableFields={ searchableFields }
							onClose={ () => {} }
							width="auto"
						/>
					</CardBody>
				</Card>

				<Card>
					<CardBody className="plugin-sites-card-body">
						<SectionHeader
							className="plugin-sites-card-header"
							decoration={ decoration }
							level={ 2 }
							title={ title }
						/>

						<PluginTabs
							pluginSlug={ pluginSlug }
							isLoading={ isLoadingPlugin }
							plugin={ plugin }
							pluginName={ plugin?.name }
							pluginBySiteId={ pluginBySiteId }
							sitesWithThisPlugin={ sitesWithThisPlugin }
							sitesWithoutThisPlugin={ sitesWithoutThisPlugin }
						/>
					</CardBody>
				</Card>
			</Grid>
		</PageLayout>
	);
}
