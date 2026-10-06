import {
	__experimentalSpacer as Spacer,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
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
import type { ResourceItem, RecordTracksEvent } from './types';
import type { AgencyResourceStage } from '@automattic/api-core';
import type { View, Field } from '@wordpress/dataviews';

import './style.scss';

const TRACKS_EVENT_NAME = 'calypso_a4a_resource_center_browse_cta_click';

// The grid renders its own cards, so DataViews only lays out the list.
const LAYOUT_FIELDS = {
	grid: [],
	table: [ 'product', 'contentType', 'stage' ],
};

type LayoutType = keyof typeof LAYOUT_FIELDS;

const initialView: View = {
	type: 'grid',
	titleField: 'name',
	descriptionField: 'description',
	fields: LAYOUT_FIELDS.grid,
	search: '',
	filters: [],
	page: 1,
	perPage: 100,
};

type StageFilter = AgencyResourceStage | 'all';

interface BrowseAllResourcesProps {
	resources: ResourceItem[];
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	recordTracksEvent: RecordTracksEvent;
	onResourceClick?: ( resource: ResourceItem ) => void;
}

export default function BrowseAllResources( {
	resources,
	onOpenVideoModal,
	recordTracksEvent,
	onResourceClick,
}: BrowseAllResourcesProps ) {
	const [ view, setView ] = useState< View >( initialView );
	const [ stage, setStage ] = useState< StageFilter >( 'all' );

	const stageResources = useMemo(
		() =>
			stage === 'all' ? resources : resources.filter( ( resource ) => resource.stage === stage ),
		[ resources, stage ]
	);

	const stageOptions: { value: StageFilter; label: string }[] = [
		{ value: 'all', label: __( 'All' ) },
		...( [ 'learn', 'sell', 'manage', 'grow' ] as const ).map( ( value ) => ( {
			value,
			label: getStageLabel( value ),
		} ) ),
	];

	const fields: Field< ResourceItem >[] = useMemo( () => {
		// Only offer values that occur in the data, per the v2 contract.
		const toElements = (
			getValue: ( resource: ResourceItem ) => string,
			getLabel: ( value: string ) => string
		) =>
			Array.from( new Set( resources.map( getValue ) ) ).map( ( value ) => ( {
				value,
				label: getLabel( value ),
			} ) );

		const filterField = (
			id: string,
			label: string,
			getValue: ( resource: ResourceItem ) => string,
			getLabel: ( value: string ) => string
		): Field< ResourceItem > => ( {
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
							onOpenVideoModal={ onOpenVideoModal }
							recordTracksEvent={ recordTracksEvent }
							onResourceClick={ onResourceClick }
							tracksEventName={ TRACKS_EVENT_NAME }
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
				getValue: ( { item } ) => ( item.isFeatured ? 'featured' : '' ),
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
				'contentType',
				__( 'Content type' ),
				( item ) => item.contentType,
				getContentTypeLabel
			),
			filterField( 'format', __( 'Format' ), ( item ) => item.format, getFormatLabel ),
			{
				...filterField( 'stage', __( 'Stage' ), ( item ) => item.stage, getStageLabel ),
				// Filtered by the stage toggle instead.
				filterBy: false,
			},
		];
	}, [ resources, onOpenVideoModal, recordTracksEvent, onResourceClick ] );

	const { data: filteredData, paginationInfo } = useMemo(
		() => filterSortAndPaginate( stageResources, view, fields ),
		[ stageResources, view, fields ]
	);

	const isList = view.type === 'table';

	return (
		<>
			<div className="dashboard-resources-learn__filters">
				<DataViews< ResourceItem >
					data={ filteredData }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					paginationInfo={ paginationInfo }
					defaultLayouts={ { grid: {}, table: {} } }
					getItemId={ ( item ) => String( item.id ) }
					search
				>
					<HStack justify="space-between" wrap>
						<HStack justify="flex-start" expanded={ false }>
							<DataViews.Search />
							<ToggleGroupControl
								label={ __( 'Layout' ) }
								value={ view.type }
								hideLabelFromVision
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								onChange={ ( value ) => {
									const type = ( value ?? 'grid' ) as LayoutType;
									setView( { ...view, type, fields: LAYOUT_FIELDS[ type ] } as View );
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
						<ResourceCard
							key={ item.id }
							resource={ item }
							onOpenVideoModal={ onOpenVideoModal }
							recordTracksEvent={ recordTracksEvent }
							onResourceClick={ onResourceClick }
							tracksEventName={ TRACKS_EVENT_NAME }
						/>
					) ) }
				</Grid>
			) }
			{ filteredData.length === 0 && (
				<VStack spacing={ 1 }>
					<Text weight={ 500 }>{ __( "We couldn't find any resources related to that." ) }</Text>
					<Text variant="muted">
						{ __(
							'Try adjusting your search or exploring other resources to help your agency grow.'
						) }
					</Text>
				</VStack>
			) }
		</>
	);
}
