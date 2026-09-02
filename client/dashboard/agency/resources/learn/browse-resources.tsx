import {
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalGrid as Grid,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import BrowseResourceCard from './browse-resource-card';
import BrowseResourcePreviewModal from './browse-resource-preview-modal';
import {
	AUDIENCES,
	AUDIENCE_LABELS,
	CONTENT_TYPES,
	PRODUCTS,
	RESOURCES,
	STAGES,
} from './browse-resources-data';
import type { PrototypeResource, Stage } from './browse-resources-types';
import type { View, Field } from '@wordpress/dataviews';

type StageFilter = Stage | 'all';

const initialView: View = {
	type: 'list',
	fields: [],
	search: '',
	filters: [],
	page: 1,
	perPage: 100,
};

const fields: Field< PrototypeResource >[] = [
	{
		id: 'title',
		label: __( 'Title' ),
		getValue: ( { item } ) => item.title,
		enableGlobalSearch: true,
	},
	{
		id: 'description',
		label: __( 'Description' ),
		getValue: ( { item } ) => item.description,
		enableGlobalSearch: true,
	},
	{
		id: 'product',
		label: __( 'Product' ),
		type: 'text',
		getValue: ( { item } ) => item.product,
		elements: PRODUCTS.map( ( value ) => ( { value, label: value } ) ),
		filterBy: { operators: [ 'is' ] },
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'contentType',
		label: __( 'Content type' ),
		type: 'text',
		getValue: ( { item } ) => item.contentType,
		elements: CONTENT_TYPES.map( ( value ) => ( { value, label: value } ) ),
		filterBy: { operators: [ 'is' ] },
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'audience',
		label: __( 'Audience' ),
		type: 'text',
		getValue: ( { item } ) => item.audience,
		elements: AUDIENCES.map( ( value ) => ( { value, label: AUDIENCE_LABELS[ value ] } ) ),
		filterBy: { operators: [ 'is' ] },
		enableSorting: false,
		enableHiding: false,
	},
];

export default function BrowseResources() {
	const [ view, setView ] = useState< View >( initialView );
	const [ stage, setStage ] = useState< StageFilter >( 'all' );
	const [ selectedResource, setSelectedResource ] = useState< PrototypeResource | null >( null );

	const stageData = useMemo(
		() => ( stage === 'all' ? RESOURCES : RESOURCES.filter( ( item ) => item.stage === stage ) ),
		[ stage ]
	);

	const { data: filteredData, paginationInfo } = useMemo(
		() => filterSortAndPaginate( stageData, view, fields ),
		[ stageData, view ]
	);

	// Surface top resources first in every view (stable, so other ordering holds).
	const orderedData = useMemo(
		() =>
			[ ...filteredData ].sort(
				( a, b ) => Number( b.topResource ?? false ) - Number( a.topResource ?? false )
			),
		[ filteredData ]
	);

	return (
		<>
			<Spacer marginBottom={ 2 }>
				<Heading level={ 2 } weight={ 500 } size={ 20 }>
					{ __( 'Resources' ) }
				</Heading>
			</Spacer>

			<Spacer marginBottom={ 4 }>
				<ToggleGroupControl
					value={ stage }
					isBlock
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					onChange={ ( value ) => setStage( ( value as StageFilter ) ?? 'all' ) }
					label={ __( 'Browse by stage' ) }
					hideLabelFromVision
				>
					<ToggleGroupControlOption value="all" label={ __( 'All' ) } />
					{ STAGES.map( ( stageOption ) => (
						<ToggleGroupControlOption
							key={ stageOption }
							value={ stageOption }
							label={ stageOption }
						/>
					) ) }
				</ToggleGroupControl>
			</Spacer>

			<DataViews< PrototypeResource >
				data={ stageData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				paginationInfo={ paginationInfo }
				defaultLayouts={ { list: {} } }
				getItemId={ ( item ) => item.id }
				search
			>
				<HStack justify="start" style={ { paddingBlock: '16px' } }>
					<DataViews.Search />
					<DataViews.FiltersToggle />
				</HStack>
				<Spacer marginBottom={ 4 }>
					<DataViews.FiltersToggled />
				</Spacer>
			</DataViews>

			{ orderedData.length > 0 ? (
				<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap={ 8 }>
					{ orderedData.map( ( item ) => (
						<BrowseResourceCard
							key={ item.id }
							resource={ item }
							onPreview={ setSelectedResource }
						/>
					) ) }
				</Grid>
			) : (
				<Spacer marginTop={ 2 } marginBottom={ 4 }>
					<VStack spacing={ 2 }>
						<Text weight={ 500 }>{ __( 'No resources match your filters.' ) }</Text>
						<Text variant="muted">
							{ __( 'Try adjusting your search, stage, or filters to see more resources.' ) }
						</Text>
					</VStack>
				</Spacer>
			) }

			{ selectedResource && (
				<BrowseResourcePreviewModal
					resource={ selectedResource }
					onClose={ () => setSelectedResource( null ) }
				/>
			) }
		</>
	);
}
