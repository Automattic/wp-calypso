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
import { DataViews as WPDataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DataViews, DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { useResourceFields } from './dataviews/fields';
import { LAYOUT_FIELDS } from './dataviews/views';
import { getStageLabel } from './lib/labels';
import ResourceGrid from './resource-grid';
import ResourceModal from './resource-modal';
import { getNeighbors, useResourceSelection } from './use-resource-selection';
import type { LayoutType } from './dataviews/views';
import type { FilterResources } from './types';
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
	readIds: number[];
	onSetRead: ( resource: AgencyEnablementResource, isRead: boolean ) => void;
	selectedId: number | null;
	onSelectedIdChange: ( id: number | null ) => void;
}

export default function ResourceLibrary( {
	resources,
	view,
	onChangeView,
	onPreviewResource,
	onOpenResource,
	readIds,
	onSetRead,
	selectedId,
	onSelectedIdChange,
}: ResourceLibraryProps ) {
	const setStage = ( value: StageFilter ) =>
		onChangeView( {
			...view,
			filters: [
				...( view.filters ?? [] ).filter( ( filter ) => filter.field !== 'stage' ),
				...( value === 'all' ? [] : [ { field: 'stage', operator: 'is' as const, value } ] ),
			],
		} );

	// Stable across renders, so memoized cards don't re-render while searching.
	const filterResources: FilterResources = useEvent( ( field, value ) =>
		onChangeView( {
			...view,
			filters: [
				...( view.filters ?? [] ).filter( ( filter ) => filter.field !== field ),
				{ field, operator: 'is', value },
			],
		} )
	);

	const stageOptions: { value: StageFilter; label: string; ariaLabel: string }[] = [
		{
			value: 'all',
			label: __( 'All' ),
			/* translators: Stage filter tooltip. Keep "All" matching the stage's button label. */
			ariaLabel: __( 'All: Resources for every stage.' ),
		},
		{
			value: 'learn',
			label: getStageLabel( 'learn' ),
			/* translators: Stage filter tooltip. Keep "Learn" matching the stage's button label. */
			ariaLabel: __( 'Learn: Get to know our products.' ),
		},
		{
			value: 'sell',
			label: getStageLabel( 'sell' ),
			/* translators: Stage filter tooltip. Keep "Sell" matching the stage's button label. */
			ariaLabel: __( 'Sell: Prepare for client conversations.' ),
		},
		{
			value: 'manage',
			label: getStageLabel( 'manage' ),
			/* translators: Stage filter tooltip. Keep "Manage" matching the stage's button label. */
			ariaLabel: __( 'Manage: Deliver and support client projects.' ),
		},
		{
			value: 'grow',
			label: getStageLabel( 'grow' ),
			/* translators: Stage filter tooltip. Keep "Grow" matching the stage's button label. */
			ariaLabel: __( 'Grow: Build your agency and partnerships.' ),
		},
	];
	const toStage = ( value: unknown ) =>
		stageOptions.find( ( option ) => option.value === value )?.value ?? 'all';

	// The stage toggle drives an ordinary filter, so it's saved with the rest of the view.
	const stage = toStage( view.filters?.find( ( filter ) => filter.field === 'stage' )?.value );

	const selection = useResourceSelection( {
		onSelectedIdChange,
		onPreview: onPreviewResource,
	} );

	const fields = useResourceFields( resources, selection.select, readIds );

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

	// Load more moves focus to the first resource it reveals, rather than leaving
	// it on the button, or losing it when the button goes.
	const focusAfterLoad = useRef< number | null >( null );
	useEffect( () => {
		if ( focusAfterLoad.current !== null ) {
			document
				.querySelector< HTMLElement >( `[data-resource-id="${ focusAfterLoad.current }"]` )
				?.focus();
			focusAfterLoad.current = null;
		}
	}, [ visibleData ] );

	const isList = view.type === 'table';

	// The modal moves through every match, not only those loaded so far.
	const neighbors = getNeighbors( filteredData, selectedId );
	// A shared link can name a resource the saved filters hide; show it anyway,
	// without neighbors to move to.
	const selected =
		neighbors.selected ?? resources.find( ( resource ) => resource.id === selectedId );
	const { previous, next } = neighbors;
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
							<WPDataViews.Search label={ __( 'Search resources' ) } />
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
							<WPDataViews.FiltersToggle />
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
								onChange={ ( value ) => setStage( toStage( value ) ) }
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
								onChange={ ( value ) => setStage( toStage( value ) ) }
							>
								{ stageOptions.map( ( option ) => (
									<ToggleGroupControlOption
										key={ option.value }
										value={ option.value }
										label={ option.label }
										// The tooltip shows the aria-label, so it leads with the visible
										// name for assistive technology.
										aria-label={ option.ariaLabel }
										showTooltip
									/>
								) ) }
							</ToggleGroupControl>
						) }
					</HStack>
					<Spacer marginBottom={ 4 }>
						<WPDataViews.FiltersToggled className="dashboard-resources-learn__filters-toggled" />
					</Spacer>
					{ isList && filteredData.length > 0 && <WPDataViews.Layout /> }
				</DataViews>
			</div>
			{ ! isList && filteredData.length > 0 && (
				<ResourceGrid
					resources={ visibleData }
					onSelectResource={ selection.select }
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
							<Button
								variant="secondary"
								__next40pxDefaultSize
								onClick={ () => {
									focusAfterLoad.current = filteredData[ visibleCount ].id;
									setShown( { key: resultsKey, count: visibleCount + PAGE_SIZE } );
								} }
							>
								{ __( 'Load more' ) }
							</Button>
						) }
					</VStack>
				</Spacer>
			) }
			{ selected && (
				<ResourceModal
					resource={ selected }
					origin={ selection.origin }
					onClose={ selection.clear }
					onPrevious={ previous && ( () => selection.preview( previous ) ) }
					onNext={ next && ( () => selection.preview( next ) ) }
					onOpen={ onOpenResource }
					isRead={ readIds.includes( selected.id ) }
					onToggleRead={ () => onSetRead( selected, ! readIds.includes( selected.id ) ) }
					onFilter={ ( field, value ) => {
						selection.clear();
						filterResources( field, value );
					} }
				/>
			) }
			{ filteredData.length === 0 && (
				<DataViewsEmptyStateLayout
					title={ __( 'We couldn’t find any resources related to that.' ) }
					description={ __(
						'Try adjusting your search or exploring other resources to help your agency grow.'
					) }
				/>
			) }
		</>
	);
}
