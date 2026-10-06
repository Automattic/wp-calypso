import {
	__experimentalSpacer as Spacer,
	__experimentalHStack as HStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { DataViewsEmptyStateLayout } from '../../../components/dataviews';
import Grid from '../../../components/grid';
import {
	getAudienceLabel,
	getContentTypeLabel,
	getFormatLabel,
	getProductLabel,
	getStageLabel,
} from './labels';
import ResourceCard from './resource-card';
import ResourceLink from './resource-link';
import ResourceProductLogo from './resource-product-logo';
import { LAYOUT_FIELDS } from './views';
import type { OpenResource } from './types';
import type { LayoutType } from './views';
import type { AgencyEnablementResource, AgencyResourceStage } from '@automattic/api-core';
import type { View, Field } from '@wordpress/dataviews';

import './style.scss';

type StageFilter = AgencyResourceStage | 'all';

interface BrowseAllResourcesProps {
	resources: AgencyEnablementResource[];
	view: View;
	onChangeView: ( view: View ) => void;
	onOpenResource: OpenResource;
}

export default function BrowseAllResources( {
	resources,
	view,
	onChangeView,
	onOpenResource,
}: BrowseAllResourcesProps ) {
	// The stage toggle drives an ordinary filter, so it's saved with the rest of the view.
	const stage = ( view.filters?.find( ( filter ) => filter.field === 'stage' )?.value ??
		'all' ) as StageFilter;

	const setStage = ( value: StageFilter ) =>
		onChangeView( {
			...view,
			filters: [
				...( view.filters ?? [] ).filter( ( filter ) => filter.field !== 'stage' ),
				...( value === 'all' ? [] : [ { field: 'stage', operator: 'is' as const, value } ] ),
			],
		} );

	const stageOptions: { value: StageFilter; label: string }[] = [
		{ value: 'all', label: __( 'All' ) },
		...( [ 'learn', 'sell', 'manage', 'grow' ] as const ).map( ( value ) => ( {
			value,
			label: getStageLabel( value ),
		} ) ),
	];

	const fields: Field< AgencyEnablementResource >[] = useMemo( () => {
		// Only offer values that occur in the data, per the v2 contract.
		const toElements = (
			getValue: ( resource: AgencyEnablementResource ) => string,
			getLabel: ( value: string ) => string
		) =>
			Array.from( new Set( resources.map( getValue ) ) ).map( ( value ) => ( {
				value,
				label: getLabel( value ),
			} ) );

		const filterField = (
			id: string,
			label: string,
			getValue: ( resource: AgencyEnablementResource ) => string,
			getLabel: ( value: string ) => string
		): Field< AgencyEnablementResource > => ( {
			id,
			label,
			type: 'text',
			getValue: ( { item } ) => getValue( item ),
			elements: toElements( getValue, getLabel ),
			filterBy: { operators: [ 'is', 'isAny' ] },
			enableSorting: false,
			enableHiding: true,
		} );

		return [
			{
				id: 'name',
				label: __( 'Title' ),
				getValue: ( { item } ) => item.name,
				render: ( { item } ) => (
					<span className="dashboard-resources-learn__list-title" data-product={ item.product }>
						<ResourceLink
							resource={ item }
							className="dashboard-resources-learn__list-link"
							onOpen={ onOpenResource }
						/>
					</span>
				),
				enableGlobalSearch: true,
				enableSorting: false,
				enableHiding: false,
			},
			{
				id: 'description',
				label: __( 'Description' ),
				getValue: ( { item } ) => item.description,
				enableGlobalSearch: true,
				enableSorting: false,
			},
			{
				id: 'featured',
				label: __( 'Top resources' ),
				type: 'text',
				getValue: ( { item } ) => ( item.is_featured ? 'featured' : '' ),
				elements: [ { value: 'featured', label: __( 'Top resource' ) } ],
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				enableHiding: true,
			},
			{
				...filterField( 'product', __( 'Product' ), ( item ) => item.product, getProductLabel ),
				render: ( { item } ) => (
					<span className="dashboard-resources-learn__list-brand" data-product={ item.product }>
						<ResourceProductLogo product={ item.product } />
					</span>
				),
			},
			filterField( 'audience', __( 'Audience' ), ( item ) => item.audience, getAudienceLabel ),
			filterField(
				'content_type',
				__( 'Content type' ),
				( item ) => item.content_type,
				getContentTypeLabel
			),
			filterField( 'format', __( 'Format' ), ( item ) => item.format, getFormatLabel ),
			{
				...filterField( 'stage', __( 'Stage' ), ( item ) => item.stage, getStageLabel ),
				// Set by the stage toggle rather than the filters menu.
				filterBy: false,
			},
		];
	}, [ resources, onOpenResource ] );

	// The library isn't paginated, so every match is shown.
	const { data: filteredData, paginationInfo } = useMemo(
		() =>
			filterSortAndPaginate(
				resources,
				{ ...view, page: 1, perPage: Math.max( resources.length, 1 ) },
				fields
			),
		[ resources, view, fields ]
	);

	const isList = view.type === 'table';

	return (
		<>
			<div className="dashboard-resources-learn__filters">
				<DataViews< AgencyEnablementResource >
					data={ filteredData }
					fields={ fields }
					view={ view }
					onChangeView={ onChangeView }
					paginationInfo={ paginationInfo }
					defaultLayouts={ { grid: {}, table: {} } }
					getItemId={ ( item ) => String( item.id ) }
					search
				>
					<HStack justify="space-between" wrap>
						<HStack justify="flex-start" expanded={ false }>
							<DataViews.Search />
							<ToggleGroupControl
								className="dashboard-resources-learn__layout-toggle"
								label={ __( 'Layout' ) }
								value={ view.type }
								hideLabelFromVision
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								onChange={ ( value ) => {
									const type: LayoutType = value === 'table' ? 'table' : 'grid';
									onChangeView( { ...view, type, fields: LAYOUT_FIELDS[ type ] } );
								} }
							>
								<ToggleGroupControlOption value="grid" label={ __( 'Grid' ) } />
								<ToggleGroupControlOption value="table" label={ __( 'List' ) } />
							</ToggleGroupControl>
							<DataViews.FiltersToggle />
						</HStack>
						<ToggleGroupControl
							className="dashboard-resources-learn__stage-filter"
							label={ __( 'Stage' ) }
							value={ stage }
							hideLabelFromVision
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setStage( ( value ?? 'all' ) as StageFilter ) }
						>
							{ stageOptions.map( ( option ) => (
								<ToggleGroupControlOption
									key={ option.value }
									value={ option.value }
									label={ option.label }
								/>
							) ) }
						</ToggleGroupControl>
					</HStack>
					<Spacer marginBottom={ 4 }>
						<DataViews.FiltersToggled className="dashboard-resources-learn__filters-toggled" />
					</Spacer>
					{ isList && filteredData.length > 0 && <DataViews.Layout /> }
				</DataViews>
			</div>
			{ ! isList && filteredData.length > 0 && (
				<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap="xl">
					{ filteredData.map( ( item ) => (
						<ResourceCard key={ item.id } resource={ item } onOpen={ onOpenResource } />
					) ) }
				</Grid>
			) }
			{ filteredData.length === 0 && (
				<DataViewsEmptyStateLayout
					title={ __( "We couldn't find any resources related to that." ) }
					description={ __(
						'Try adjusting your search or exploring other resources to help your agency grow.'
					) }
				/>
			) }
		</>
	);
}
