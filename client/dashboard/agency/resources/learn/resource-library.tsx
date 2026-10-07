import {
	Button,
	SelectControl,
	__experimentalSpacer as Spacer,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useEvent, useViewportMatch } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { useResourceFields } from './dataviews/fields';
import { LAYOUT_FIELDS } from './dataviews/views';
import { getStageLabel } from './lib/labels';
import ResourceGrid from './resource-grid';
import ResourceList from './resource-list';
import ResourceModal from './resource-modal';
import type { LayoutType } from './dataviews/views';
import type { FilterResources, SelectResource } from './types';
import type { AgencyEnablementResource, AgencyResourceStage } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

import './style.scss';

const PAGE_SIZE = 24;

type StageFilter = AgencyResourceStage | 'all';

interface ResourceLibraryProps {
	resources: AgencyEnablementResource[];
	view: View;
	onChangeView: ( view: View ) => void;
	onPreviewResource: ( resource: AgencyEnablementResource ) => void;
	onOpenResource: ( resource: AgencyEnablementResource ) => void;
}

export default function ResourceLibrary( {
	resources,
	view,
	onChangeView,
	onPreviewResource,
	onOpenResource,
}: ResourceLibraryProps ) {
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

	// Stable across renders, so memoised cards don't re-render while searching.
	const filterResources: FilterResources = useEvent( ( field, value ) => {
		if ( field === 'stage' ) {
			setStage( value as StageFilter );
			return;
		}

		onChangeView( {
			...view,
			filters: [
				...( view.filters ?? [] ).filter( ( filter ) => filter.field !== field ),
				{ field, operator: 'is', value },
			],
		} );
	} );

	const stageOptions: { value: StageFilter; label: string; description: string }[] = [
		{ value: 'all', label: __( 'All' ), description: __( 'Resources for every stage.' ) },
		{
			value: 'learn',
			label: getStageLabel( 'learn' ),
			description: __( 'Get to know our products.' ),
		},
		{
			value: 'sell',
			label: getStageLabel( 'sell' ),
			description: __( 'Prepare for client conversations.' ),
		},
		{
			value: 'manage',
			label: getStageLabel( 'manage' ),
			description: __( 'Deliver and support client projects.' ),
		},
		{
			value: 'grow',
			label: getStageLabel( 'grow' ),
			description: __( 'Build your agency and partnerships.' ),
		},
	];

	const [ selectedId, setSelectedId ] = useState< number | null >( null );

	const previewResource = ( resource: AgencyEnablementResource ) => {
		setSelectedId( resource.id );
		onPreviewResource( resource );
	};

	// Stable across renders, so memoised cards don't re-render while searching.
	const selectResource: SelectResource = useEvent( ( resource, event ) => {
		// Modified clicks follow the link and open the resource itself.
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			onOpenResource( resource );
			return;
		}

		event.preventDefault();
		previewResource( resource );
	} );

	const fields = useResourceFields( resources, selectResource );

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

	// Reveal results a page at a time, starting over whenever search or filters change.
	const resultsKey = JSON.stringify( [ view.search, view.filters ] );
	const [ shown, setShown ] = useState( { key: resultsKey, count: PAGE_SIZE } );
	const visibleCount = shown.key === resultsKey ? shown.count : PAGE_SIZE;
	const visibleData = useMemo(
		() => filteredData.slice( 0, visibleCount ),
		[ filteredData, visibleCount ]
	);
	const hasMore = visibleCount < filteredData.length;
	const loadMore = () => setShown( { key: resultsKey, count: visibleCount + PAGE_SIZE } );

	// Loads the next page as the end of the results scrolls into view.
	const { ref: loadMoreRef } = useInView( {
		onChange: ( inView ) => inView && hasMore && loadMore(),
	} );

	const isList = view.type === 'table';

	// The modal moves through every match, not only those loaded so far.
	const selectedIndex = filteredData.findIndex( ( resource ) => resource.id === selectedId );
	const selectedResource = filteredData[ selectedIndex ];
	const previousResource = filteredData[ selectedIndex - 1 ];
	const nextResource = filteredData[ selectedIndex + 1 ];
	// The stage toggle doesn't fit beside the toolbar on narrow screens.
	const isSmallViewport = useViewportMatch( 'medium', '<' );

	return (
		<>
			<div className="dashboard-resources-learn__filters">
				<DataViews< AgencyEnablementResource >
					data={ visibleData }
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
							<DataViews.Search label={ __( 'Search resources' ) } />
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
						{ isSmallViewport ? (
							<SelectControl
								label={ __( 'Stage' ) }
								hideLabelFromVision
								size="compact"
								value={ stage }
								options={ stageOptions.map( ( option ) => ( {
									value: option.value,
									label: option.value === 'all' ? __( 'All stages' ) : option.label,
								} ) ) }
								onChange={ ( value ) => setStage( value as StageFilter ) }
								__nextHasNoMarginBottom
							/>
						) : (
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
										// The tooltip shows the aria-label, so it keeps the visible
										// name first for assistive technology.
										aria-label={ sprintf(
											/* translators: 1: Stage name, such as "Learn". 2: What the stage's resources help with. */
											__( '%1$s: %2$s' ),
											option.label,
											option.description
										) }
										showTooltip
									/>
								) ) }
							</ToggleGroupControl>
						) }
					</HStack>
					<Spacer marginBottom={ 4 }>
						<DataViews.FiltersToggled className="dashboard-resources-learn__filters-toggled" />
					</Spacer>
					{ isList && filteredData.length > 0 && <ResourceList /> }
				</DataViews>
			</div>
			{ ! isList && filteredData.length > 0 && (
				<ResourceGrid
					resources={ visibleData }
					onSelectResource={ selectResource }
					onFilterResources={ filterResources }
				/>
			) }
			{ filteredData.length > 0 && (
				<Spacer marginTop={ 8 }>
					<VStack spacing={ 3 } alignment="center">
						<Text variant="muted" role="status">
							{ sprintf(
								/* translators: 1: Number of resources shown. 2: Number of matching resources. */
								_n(
									'Showing %1$d of %2$d resource',
									'Showing %1$d of %2$d resources',
									filteredData.length
								),
								visibleData.length,
								filteredData.length
							) }
						</Text>
						{ hasMore && (
							<>
								<div ref={ loadMoreRef } />
								<Button variant="secondary" __next40pxDefaultSize onClick={ loadMore }>
									{ __( 'Load more' ) }
								</Button>
							</>
						) }
					</VStack>
				</Spacer>
			) }
			{ selectedResource && (
				<ResourceModal
					resource={ selectedResource }
					onClose={ () => setSelectedId( null ) }
					onPrevious={ previousResource && ( () => previewResource( previousResource ) ) }
					onNext={ nextResource && ( () => previewResource( nextResource ) ) }
					onOpen={ onOpenResource }
					onFilter={ ( field, value ) => {
						setSelectedId( null );
						filterResources( field, value );
					} }
				/>
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
