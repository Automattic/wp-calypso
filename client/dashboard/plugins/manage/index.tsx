import { MarketplaceSearchResult } from '@automattic/api-core';
import {
	marketplacePluginsQuery,
	marketplaceSearchQuery,
	pluginsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __experimentalGrid as Grid, Icon } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { plugins as pluginIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { PluginSites } from './components/plugin-sites';
import { PluginSwitcher } from './components/plugin-switcher';
import { useSitesById } from './hooks/use-sites-by-id';
import { mapApiPluginsToDataViewPlugins } from './utils';
import type { PluginListRow } from './types';
import type { Field, View } from '@wordpress/dataviews';

const ICON_SIZE = 40;

const FALLBACK_ICON_SIZE = 30;

const getFields = () => {
	const fields: Field< PluginListRow >[] = [
		{
			id: 'icon',
			label: __( 'Icon' ),
			render: ( { item } ) => {
				const icon = item.icon ? (
					<img src={ item.icon } alt={ item.name } width={ ICON_SIZE } height={ ICON_SIZE } />
				) : (
					<Icon icon={ pluginIcon } size={ FALLBACK_ICON_SIZE } className="plugin-icon-fallback" />
				);

				return (
					<div className={ clsx( 'plugin-icon-wrapper', { 'is-fallback': ! item.icon } ) }>
						{ icon }
					</div>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'title',
			label: __( 'Title' ),
			getValue: ( { item } ) => item.name,
			render: ( { item } ) => (
				/* @ts-expect-error: Can only set one of `children` or `props.dangerouslySetInnerHTML`. */
				<Text
					className="plugin-switcher-item-name"
					dangerouslySetInnerHTML={ { __html: item.name } }
					title={ item.name }
				/>
			),
			enableGlobalSearch: true,
			enableHiding: false,
		},
		{
			id: 'available_sites',
			label: __( 'Available sites' ),
			render: ( { item } ) => {
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
					<Text variant="muted">
						{ updatesText ? `${ sitesText }, ${ updatesText }` : sitesText }
					</Text>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	return fields;
};

export default function PluginsList() {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const { data: sitesPlugins } = useQuery( pluginsQuery() );
	const { sitesById } = useSitesById();
	const { pluginId: pluginSlug } = useParams( { strict: false } );

	const [ view, setView ] = useState< View >( {
		type: 'list',
		fields: [ 'available_sites' ],
		titleField: 'title',
		mediaField: 'icon',
		page: 1,
		perPage: 10,
		sort: { field: 'title', direction: 'asc' },
	} );

	const fields = useMemo( () => getFields(), [] );

	const { data: plugins, paginationInfo } = useMemo(
		() =>
			filterSortAndPaginate(
				mapApiPluginsToDataViewPlugins( sitesById, sitesPlugins ),
				view,
				fields
			),
		[ sitesById, sitesPlugins, view, fields ]
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

	const onChangeView = ( newView: View ) => {
		setView( newView );
	};

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
						view={ view }
						fields={ fields }
						paginationInfo={ paginationInfo }
						onChangeView={ onChangeView }
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
			<Grid columns={ 2 } gap={ 6 } templateColumns="392px 1fr">
				<PluginSwitcher
					pluginsWithIcon={ pluginsWithIcon }
					selectedPluginSlug={ selectedPluginSlug }
					view={ view }
					fields={ fields }
					paginationInfo={ paginationInfo }
					onChangeView={ onChangeView }
				/>

				<PluginSites selectedPluginSlug={ selectedPluginSlug } />
			</Grid>
		</PageLayout>
	);
}
