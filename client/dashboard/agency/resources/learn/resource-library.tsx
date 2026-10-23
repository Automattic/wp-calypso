import { formatNumber } from '@automattic/number-formatters';
import {
	Button,
	__experimentalSpacer as Spacer,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useEvent } from '@wordpress/compose';
import { DataViews as WPDataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { Card } from '../../../components/card';
import { DataViews, DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { useResourceFields } from './dataviews/fields';
import { DEFAULT_LAYOUTS } from './dataviews/views';
import ResourceGrid from './resource-grid';
import ResourceLink from './resource-link';
import StageFilter from './stage-filter';
import { useRevealMore } from './use-reveal-more';
import type { FilterResources } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

import './style.scss';

interface ResourceLibraryProps {
	resources: AgencyEnablementResource[];
	view: View;
	onChangeView: ( view: View ) => void;
	onOpenResource: ( resource: AgencyEnablementResource ) => void;
	onLoadMore: () => void;
}

export default function ResourceLibrary( {
	resources,
	view,
	onChangeView,
	onOpenResource,
	onLoadMore,
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

	const fields = useResourceFields( resources );

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

	return (
		<div ref={ containerRef } className="dashboard-resources-learn__results">
			<div className="dashboard-resources-learn__filters">
				<DataViews< AgencyEnablementResource >
					data={ visibleResources }
					fields={ fields }
					view={ view }
					onChangeView={ onChangeView }
					paginationInfo={ paginationInfo }
					defaultLayouts={ DEFAULT_LAYOUTS }
					getItemId={ ( item ) => String( item.id ) }
					renderItemLink={ ( { item, ...props } ) => (
						<ResourceLink
							{ ...props }
							style={ { textDecoration: 'none' } }
							resource={ item }
							onOpen={ onOpenResource }
						/>
					) }
					search
				>
					<HStack justify="space-between" wrap>
						<HStack justify="flex-start" expanded={ false }>
							<WPDataViews.Search label={ __( 'Search resources' ) } />
							<WPDataViews.LayoutSwitcher />
							<WPDataViews.FiltersToggle />
						</HStack>
						<StageFilter view={ view } onChangeView={ onChangeView } />
					</HStack>
					<Spacer marginBottom={ 4 }>
						<WPDataViews.FiltersToggled className="dashboard-resources-learn__filters-toggled" />
					</Spacer>
					{ isList && filteredData.length > 0 && (
						<Card>
							<WPDataViews.Layout />
						</Card>
					) }
				</DataViews>
			</div>
			{ ! isList && filteredData.length > 0 && (
				<ResourceGrid
					resources={ visibleResources }
					onOpenResource={ onOpenResource }
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
	);
}
