import {
	SelectControl,
	__experimentalSpacer as Spacer,
	__experimentalHStack as HStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useEvent, useViewportMatch } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { DataViewsEmptyStateLayout } from '../../../components/dataviews';
import { useResourceFields } from './dataviews/fields';
import { LAYOUT_FIELDS } from './dataviews/views';
import { getStageLabel } from './lib/labels';
import ResourceGrid from './resource-grid';
import ResourceList from './resource-list';
import type { LayoutType } from './dataviews/views';
import type { FilterResources, OpenResource } from './types';
import type { AgencyEnablementResource, AgencyResourceStage } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

import './style.scss';

type StageFilter = AgencyResourceStage | 'all';

interface ResourceLibraryProps {
	resources: AgencyEnablementResource[];
	view: View;
	onChangeView: ( view: View ) => void;
	onOpenResource: OpenResource;
}

export default function ResourceLibrary( {
	resources,
	view,
	onChangeView,
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

	const fields = useResourceFields( resources, onOpenResource );

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
	// The stage toggle doesn't fit beside the toolbar on narrow screens.
	const isSmallViewport = useViewportMatch( 'medium', '<' );

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
					resources={ filteredData }
					onOpenResource={ onOpenResource }
					onFilterResources={ filterResources }
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
