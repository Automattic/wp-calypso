import { sitesQuery, pluginsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	RadioControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { DataViews, Field, View, filterSortAndPaginate, type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { DataViewsCard } from '../../../components/dataviews-card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import type { Site, PluginItem, PluginsResponse } from '@automattic/api-core';

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

function getUniquePlugins( response?: PluginsResponse ): Array< { slug: string; name: string } > {
	if ( ! response?.sites ) {
		return [];
	}
	const map = new Map< string, string >();
	Object.values( response.sites ).forEach( ( plugins: PluginItem[] ) => {
		plugins.forEach( ( p ) => {
			if ( ! p.slug ) {
				return;
			}
			const name = p.name || p.slug;
			if ( ! map.has( p.slug ) ) {
				map.set( p.slug, name );
			}
		} );
	} );
	return Array.from( map.entries() ).map( ( [ slug, name ] ) => ( { slug, name } ) );
}

export default function NewSchedule() {
	const sitesQueryResult = useQuery( sitesQuery() );
	const sites = sitesQueryResult.data as Site[] | undefined;
	const { data: sitesPlugins } = useQuery( pluginsQuery() );

	const pluginOptions = useMemo( () => getUniquePlugins( sitesPlugins ), [ sitesPlugins ] );

	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );
	const [ selectedPluginSlugs, setSelectedPluginSlugs ] = useState< string[] >( [] );

	// Sites DataViews setup
	const siteFields: Field< Site >[] = useMemo(
		() => [
			{
				id: 'title',
				label: __( 'Site' ),
				enableGlobalSearch: true,
				render: ( { item } ) => item.name || item.URL || String( item.ID ),
				getValue: ( { item } ) => item.name || item.URL || String( item.ID ),
			},
		],
		[]
	);
	const [ sitesView, setSitesView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		sort: { field: 'title', direction: 'asc' },
		fields: [],
		titleField: 'title',
	} );
	const { data: filteredSites, paginationInfo: sitesPagination } = useMemo( () => {
		return filterSortAndPaginate( ( sites ?? [] ) as Site[], sitesView, siteFields );
	}, [ sites, sitesView, siteFields ] );

	// Provide a bulk-capable action to enable selection UI
	const siteActions: Array< Action< Site > > = [
		{
			id: 'noop',
			label: __( 'Select' ),
			callback: () => {},
			supportsBulk: true,
			isPrimary: false,
		},
	];

	// Plugins DataViews setup
	type PluginRow = { id: string; name: string };
	const pluginRows: PluginRow[] = useMemo(
		() => pluginOptions.map( ( p ) => ( { id: p.slug, name: p.name } ) ),
		[ pluginOptions ]
	);
	const pluginFields: Field< PluginRow >[] = useMemo(
		() => [
			{
				id: 'name',
				label: __( 'Plugin' ),
				enableGlobalSearch: true,
				render: ( { item } ) => item.name,
				getValue: ( { item } ) => item.name,
			},
		],
		[]
	);
	const [ pluginsView, setPluginsView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		sort: { field: 'name', direction: 'asc' },
		fields: [],
		titleField: 'name',
	} );
	const { data: filteredPlugins, paginationInfo: pluginsPagination } = useMemo( () => {
		return filterSortAndPaginate( pluginRows, pluginsView, pluginFields );
	}, [ pluginRows, pluginsView, pluginFields ] );
	const [ frequency, setFrequency ] = useState< 'daily' | 'weekly' >( 'daily' );
	const [ weekday, setWeekday ] = useState< Weekday >( 'Monday' );
	const [ time, setTime ] = useState( '04:00' );

	const isTimeValid = /^([01]\d|2[0-3]):[0-5]\d$/.test( time );
	const isValid =
		selectedSiteIds.length > 0 &&
		selectedPluginSlugs.length > 0 &&
		isTimeValid &&
		( frequency === 'daily' || ( frequency === 'weekly' && !! weekday ) );

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'New schedule' ) } /> }>
			<Card>
				<CardHeader>
					<strong>{ __( 'Select sites' ) }</strong>
				</CardHeader>
				<CardBody>
					<DataViewsCard>
						<DataViews
							data={ filteredSites }
							fields={ siteFields }
							view={ sitesView }
							onChangeView={ setSitesView }
							selection={ selectedSiteIds }
							onChangeSelection={ ( ids ) => setSelectedSiteIds( ids as string[] ) }
							getItemId={ ( item: Site ) => String( item.ID ) }
							actions={ siteActions }
							defaultLayouts={ { table: {} } }
							paginationInfo={ sitesPagination }
						/>
					</DataViewsCard>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<strong>{ __( 'Select plugins' ) }</strong>
				</CardHeader>
				<CardBody>
					<DataViewsCard>
						<DataViews
							data={ filteredPlugins }
							fields={ pluginFields }
							view={ pluginsView }
							onChangeView={ setPluginsView }
							selection={ selectedPluginSlugs }
							onChangeSelection={ ( ids ) => setSelectedPluginSlugs( ids as string[] ) }
							getItemId={ ( item: { id: string } ) => item.id }
							actions={ [
								{ id: 'noop', label: __( 'Select' ), callback: () => {}, supportsBulk: true },
							] }
							defaultLayouts={ { table: {} } }
							paginationInfo={ pluginsPagination }
						/>
					</DataViewsCard>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<strong>{ __( 'Select frequency' ) }</strong>
				</CardHeader>
				<CardBody>
					<fieldset>
						<legend className="screen-reader-text">{ __( 'Schedule frequency' ) }</legend>
						<RadioControl
							label={ __( 'Frequency' ) }
							selected={ frequency }
							onChange={ ( val: string ) => setFrequency( val === 'weekly' ? 'weekly' : 'daily' ) }
							options={ [
								{ label: __( 'Daily' ), value: 'daily' },
								{ label: __( 'Weekly' ), value: 'weekly' },
							] }
						/>
						{ frequency === 'weekly' && (
							<SelectControl
								label={ __( 'Weekday' ) }
								value={ weekday }
								onChange={ ( val: string ) => setWeekday( val as Weekday ) }
								options={ [
									{ label: __( 'Monday' ), value: 'Monday' },
									{ label: __( 'Tuesday' ), value: 'Tuesday' },
									{ label: __( 'Wednesday' ), value: 'Wednesday' },
									{ label: __( 'Thursday' ), value: 'Thursday' },
									{ label: __( 'Friday' ), value: 'Friday' },
									{ label: __( 'Saturday' ), value: 'Saturday' },
									{ label: __( 'Sunday' ), value: 'Sunday' },
								] }
							/>
						) }
						<TextControl
							label={ __( 'Time (HH:MM)' ) }
							value={ time }
							onChange={ ( val: string ) => setTime( val ) }
							help={ isTimeValid ? undefined : __( 'Enter a valid 24h time, e.g. 04:00' ) }
						/>
					</fieldset>
				</CardBody>
			</Card>

			<div style={ { marginTop: 16 } }>
				<Button variant="primary" disabled={ ! isValid } __next40pxDefaultSize>
					{ __( 'Create schedule' ) }
				</Button>
			</div>
		</PageLayout>
	);
}
