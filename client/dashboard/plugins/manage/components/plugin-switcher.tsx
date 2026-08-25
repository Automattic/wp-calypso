import { useNavigate } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { throttle } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate, Field, View } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pluginRoute } from '../../../app/router/plugins';
import { Card, CardBody } from '../../../components/card';
import { Text } from '../../../components/text';
import { PluginListRow } from '../types';
import { PluginIcon } from './plugin-icon';
import { PluginUpdatesFilter } from './plugin-updates-filter';

import './plugin-switcher.scss';

export const PluginSwitcher = ( {
	pluginsWithIcon,
	searchableFields,
	selectedPluginSlug = '',
	view,
	onChangeView,
}: {
	pluginsWithIcon: PluginListRow[];
	searchableFields: Field< PluginListRow >[];
	selectedPluginSlug?: string;
	view: View;
	onChangeView: Dispatch< SetStateAction< View > >;
} ) => {
	const navigate = useNavigate();
	const scrollRef = useRef< HTMLDivElement >( null );
	const [ itemsPerPage ] = useState( view.perPage );

	const updatesField = useMemo(
		() => ( {
			id: 'hasUpdates',
			label: __( 'Updates' ),
			type: 'boolean' as const,
			elements: [
				{ value: true, label: __( 'Has updates' ) },
				{ value: false, label: __( 'No updates' ) },
			],
			getValue: ( { item }: { item: PluginListRow } ) => item.sitesWithPluginUpdate.length > 0,
		} ),
		[]
	);

	const fields: Field< PluginListRow >[] = useMemo(
		() => [
			...searchableFields.map( ( searchableField ) => ( {
				...searchableField,
				enableGlobalSearch: true,
			} ) ),
			{
				id: 'icon',
				label: __( 'Plugin icon' ),
				render: ( { item }: { item: PluginListRow } ) => <PluginIcon item={ item } />,
				enableSorting: false,
			},
			{
				id: 'sites',
				label: __( 'Sites' ),
				getValue: ( { item }: { item: PluginListRow } ) => item.sitesCount,
				render: ( { item }: { item: PluginListRow } ) => {
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
						<Text truncate numberOfLines={ 1 }>
							{ updatesText ? `${ sitesText }, ${ updatesText }` : sitesText }
						</Text>
					);
				},
				enableSorting: false,
			},
			updatesField,
		],
		[ searchableFields, updatesField ]
	);

	const { data, paginationInfo } = useMemo(
		() => filterSortAndPaginate( pluginsWithIcon, view, fields ),
		[ pluginsWithIcon, view, fields ]
	);

	// Load next page when scrolling near bottom
	const handleLoadMore = useCallback( () => {
		if ( paginationInfo.totalPages > 1 ) {
			onChangeView( ( currentView ) => ( {
				...currentView,
				// @ts-expect-error: perPage can't be undefined
				perPage: currentView.perPage + itemsPerPage, // Accumulate items
			} ) );
		}
	}, [ paginationInfo, onChangeView, itemsPerPage ] );

	// Set up scroll listener
	useEffect( () => {
		const menuElement = scrollRef.current;

		if ( ! menuElement ) {
			return;
		}

		const handleScroll = throttle( () => {
			const scrollTop = menuElement.scrollTop;
			const scrollHeight = menuElement.scrollHeight;
			const clientHeight = menuElement.clientHeight;
			// Load more when within 100px of bottom
			if ( scrollTop + clientHeight >= scrollHeight - 100 ) {
				handleLoadMore();
			}
		}, 100 );

		// Initial check in case content is shorter than container
		handleScroll();

		menuElement.addEventListener( 'scroll', handleScroll );
		return () => menuElement.removeEventListener( 'scroll', handleScroll );
	}, [ handleLoadMore ] );

	return (
		<Card className="plugin-switcher-card">
			<CardBody className="plugin-switcher-card-body" ref={ scrollRef }>
				<DataViews< PluginListRow >
					data={ data }
					fields={ fields }
					view={ view }
					onChangeView={ onChangeView }
					paginationInfo={ paginationInfo }
					defaultLayouts={ { list: {} } }
					getItemId={ ( item ) => item.slug }
					selection={ selectedPluginSlug ? [ selectedPluginSlug ] : [] }
					onChangeSelection={ ( slugs ) => {
						if ( slugs[ 0 ] ) {
							navigate( { to: pluginRoute.to, params: { pluginId: slugs[ 0 ] } } );
						}
					} }
					empty={
						<Text variant="muted" className="plugin-switcher-no-results">
							{ __( 'No plugins found.' ) }
						</Text>
					}
				>
					<HStack className="plugin-switcher-header" justify="flex-start" spacing={ 1 }>
						<DataViews.Search label={ __( 'Search' ) } />
						<PluginUpdatesFilter
							siteCount={
								pluginsWithIcon.filter( ( plugin ) => plugin.sitesWithPluginUpdate.length > 0 )
									.length
							}
							updatesField={ updatesField }
							view={ view }
							onChangeView={ onChangeView }
						/>
					</HStack>
					<DataViews.Layout />
				</DataViews>
			</CardBody>
		</Card>
	);
};
