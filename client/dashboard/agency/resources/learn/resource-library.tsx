import { formatNumber } from '@automattic/number-formatters';
import {
	Button,
	__experimentalHeading as Heading,
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
import clsx from 'clsx';
import { useMemo } from 'react';
import { Card } from '../../../components/card';
import { DataViews, DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { useResourceFields } from './dataviews/fields';
import { LAYOUT_FIELDS } from './dataviews/views';
import ResourceBadges from './resource-badges';
import ResourceGrid from './resource-grid';
import ResourceLink from './resource-link';
import ResourceModal from './resource-modal';
import ResourceRecommendations from './resource-recommendations';
import StageFilter from './stage-filter';
import { getNeighbors, useResourceSelection } from './use-resource-selection';
import { useRevealMore } from './use-reveal-more';
import type { LayoutType } from './dataviews/views';
import type { FilterResources, ResourceSource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

import './style.scss';

interface ResourceLibraryProps {
	resources: AgencyEnablementResource[];
	view: View;
	onChangeView: ( view: View ) => void;
	onPreviewResource: ( resource: AgencyEnablementResource, source: ResourceSource ) => void;
	onOpenResource: ( resource: AgencyEnablementResource ) => void;
	onLoadMore: () => void;
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
	onLoadMore,
	readIds,
	onSetRead,
	selectedId,
	onSelectedIdChange,
}: ResourceLibraryProps ) {
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

	const selection = useResourceSelection( {
		onSelectedIdChange,
		onPreview: onPreviewResource,
	} );

	const fields = useResourceFields( resources, readIds );

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

	// Starts over whenever search or filters change.
	const { visibleResources, hasMore, revealMore, containerRef } = useRevealMore(
		filteredData,
		JSON.stringify( [ view.search, view.filters ] )
	);

	const isList = view.type === 'table';
	const isMobile = useViewportMatch( 'mobile', '<' );

	const recommended = useMemo(
		() => resources.filter( ( resource ) => resource.is_recommended ),
		[ resources ]
	);

	// The modal moves through the recommendations when opened from them, and
	// otherwise through every match, not only those loaded so far.
	const neighbors = getNeighbors(
		selection.source === 'recommended' ? recommended : filteredData,
		selectedId
	);
	// A shared link can name a resource the saved filters hide; show it anyway,
	// without neighbors to move to.
	const selected =
		neighbors.selected ?? resources.find( ( resource ) => resource.id === selectedId );
	const { previous, next } = neighbors;

	return (
		<>
			{ /* Outside the results, so revealing more doesn't focus a recommended copy of a card. */ }
			<ResourceRecommendations resources={ recommended } onSelectResource={ selection.select } />
			<div ref={ containerRef } className="dashboard-resources-learn__results">
				<div className="dashboard-resources-learn__filters">
					<DataViews< AgencyEnablementResource >
						data={ visibleResources }
						fields={ fields }
						view={ view }
						onChangeView={ onChangeView }
						paginationInfo={ paginationInfo }
						defaultLayouts={ { grid: {}, table: {} } }
						getItemId={ ( item ) => String( item.id ) }
						renderItemLink={ ( { item, ...props } ) => (
							<ResourceLink
								{ ...props }
								className={ clsx( props.className, 'dashboard-resources-learn__item-link' ) }
								data-product={ item.product }
								resource={ item }
								onSelect={ selection.select }
							/>
						) }
						search
					>
						<HStack className="dashboard-resources-learn__toolbar" justify="space-between" wrap>
							<HStack
								className="dashboard-resources-learn__toolbar-main"
								justify="flex-start"
								expanded={ false }
							>
								<div className="dashboard-resources-learn__search">
									<WPDataViews.Search label={ __( 'Search resources' ) } />
								</div>
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
							<div className="dashboard-resources-learn__stage">
								<StageFilter view={ view } onChangeView={ onChangeView } />
							</div>
						</HStack>
						<Spacer marginBottom={ 4 }>
							<WPDataViews.FiltersToggled className="dashboard-resources-learn__filters-toggled" />
						</Spacer>
						{ isList && filteredData.length > 0 && (
							<Card>
								{ isMobile ? (
									<ul className="dashboard-resources-learn__mobile-list">
										{ visibleResources.map( ( resource ) => (
											<li key={ resource.id }>
												<Heading level={ 3 }>
													<ResourceLink resource={ resource } onSelect={ selection.select } />
												</Heading>
												<p>{ resource.description }</p>
												<ResourceBadges resource={ resource } onFilter={ filterResources } />
											</li>
										) ) }
									</ul>
								) : (
									<WPDataViews.Layout />
								) }
							</Card>
						) }
					</DataViews>
				</div>
				{ ! isList && filteredData.length > 0 && (
					<ResourceGrid
						resources={ visibleResources }
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
										'Showing %1$s of %2$s resource',
										'Showing %1$s of %2$s resources',
										filteredData.length
									),
									formatNumber( visibleResources.length ),
									formatNumber( filteredData.length )
								) }
							</Text>
							{ hasMore && (
								<Button
									variant="secondary"
									__next40pxDefaultSize
									onClick={ () => {
										revealMore();
										onLoadMore();
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
						title={
							resources.length
								? __( 'We couldn’t find any resources related to that.' )
								: __( 'No resources yet' )
						}
						description={
							resources.length
								? __(
										'Try adjusting your search or exploring other resources to help your agency grow.'
									)
								: __( 'Check back soon for resources to help your agency grow.' )
						}
					/>
				) }
			</div>
		</>
	);
}
