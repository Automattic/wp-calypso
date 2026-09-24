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
import { getContentTypeLabel, getProductLabel } from './labels';
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
		{ value: 'learn', label: __( 'Learn' ) },
		{ value: 'sell', label: __( 'Sell' ) },
		{ value: 'manage', label: __( 'Manage' ) },
		{ value: 'grow', label: __( 'Grow' ) },
	];

	// Build filter options dynamically from available resources.
	const filterOptions = useMemo( () => {
		const products = new Set< string >();
		const contentTypes = new Set< string >();

		resources.forEach( ( resource ) => {
			products.add( resource.product );
			contentTypes.add( resource.contentType );
		} );

		return {
			products: Array.from( products ).map( ( value ) => ( {
				value,
				label: getProductLabel( value ),
			} ) ),
			contentTypes: Array.from( contentTypes ).map( ( value ) => ( {
				value,
				label: getContentTypeLabel( value ),
			} ) ),
		};
	}, [ resources ] );

	const fields: Field< ResourceItem >[] = useMemo(
		() => [
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
				id: 'product',
				label: __( 'Product' ),
				type: 'text',
				getValue: ( { item } ) => item.product,
				elements: filterOptions.products,
				filterBy: {
					operators: [ 'is' ],
				},
				enableSorting: false,
				enableHiding: true,
			},
			{
				id: 'contentType',
				label: __( 'Resource type' ),
				type: 'text',
				getValue: ( { item } ) => item.contentType,
				elements: filterOptions.contentTypes,
				filterBy: {
					operators: [ 'is' ],
				},
				enableSorting: false,
				enableHiding: true,
			},
		],
		[ filterOptions ]
	);

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
					<HStack justify="space-between" wrap className="dashboard-resources-learn__toolbar">
						<HStack justify="flex-start" expanded={ false }>
							<DataViews.Search />
							<DataViews.FiltersToggle />
						</HStack>
						<ToggleGroupControl
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
							showLogo
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
