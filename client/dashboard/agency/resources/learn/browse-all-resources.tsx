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
import type { ResourceItem, RecordTracksEvent } from './types';
import type { AgencyResourceStage } from '@automattic/api-core';
import type { View, Field } from '@wordpress/dataviews';

import './style.scss';

const initialView: View = {
	type: 'list',
	fields: [],
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
				getValue: ( { item } ) => item.name,
				enableGlobalSearch: true,
			},
			{
				id: 'description',
				getValue: ( { item } ) => item.description,
				enableGlobalSearch: true,
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
			filterField( 'product', __( 'Product' ), ( item ) => item.product, getProductLabel ),
			filterField( 'audience', __( 'Audience' ), ( item ) => item.audience, getAudienceLabel ),
			filterField(
				'contentType',
				__( 'Content type' ),
				( item ) => item.contentType,
				getContentTypeLabel
			),
			filterField( 'format', __( 'Format' ), ( item ) => item.format, getFormatLabel ),
		];
	}, [ resources ] );

	const { data: filteredData, paginationInfo } = useMemo(
		() => filterSortAndPaginate( stageResources, view, fields ),
		[ stageResources, view, fields ]
	);

	return (
		<>
			<div className="dashboard-resources-learn__filters">
				<DataViews< ResourceItem >
					data={ stageResources }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					paginationInfo={ paginationInfo }
					defaultLayouts={ { list: {} } }
					getItemId={ ( item ) => String( item.id ) }
					search
				>
					<HStack justify="space-between" wrap>
						<HStack justify="flex-start" expanded={ false }>
							<DataViews.Search />
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
						<DataViews.FiltersToggled />
					</Spacer>
				</DataViews>
			</div>
			{ filteredData.length > 0 ? (
				<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap="xl">
					{ filteredData.map( ( item ) => (
						<ResourceCard
							key={ item.id }
							resource={ item }
							onOpenVideoModal={ onOpenVideoModal }
							recordTracksEvent={ recordTracksEvent }
							onResourceClick={ onResourceClick }
							tracksEventName="calypso_a4a_resource_center_browse_cta_click"
						/>
					) ) }
				</Grid>
			) : (
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
