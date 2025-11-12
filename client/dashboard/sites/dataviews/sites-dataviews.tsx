import { isEnabled } from '@automattic/calypso-config';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { DataViews } from '../../app/dataviews';
import { DataViewsCard } from '../../components/dataviews-card';
import { GuidedTourContextProvider, GuidedTourStep } from '../../components/guided-tour';
import { SiteLink } from '../site-fields';
import { DEFAULT_LAYOUTS, DEFAULT_CONFIG } from './views';
import type { Site } from '@automattic/api-core';
import type { Action, Field, View } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

/**
 * Meant to stand in for the dataview's filterSortAndPaginate function when
 * the filtering has already been done on the backend by elasticsearch.
 */
function esFilterSortAndPaginate( sites: Site[], view: View, totalItems: number ) {
	return {
		data: sites,
		paginationInfo: {
			totalItems,
			totalPages: view.perPage ? Math.ceil( totalItems / view.perPage ) : 1,
		},
	};
}

export const SitesDataViews = ( {
	view,
	sites,
	totalItems,
	fields,
	actions,
	isLoading,
	empty,
	onChangeView,
	onResetView,
}: {
	view: View;
	sites: Site[];
	totalItems: number;
	fields: Field< Site >[];
	actions: Action< Site >[];
	isLoading: boolean;
	empty: ReactNode;
	onChangeView: ( view: View ) => void;
	onResetView?: () => void;
} ) => {
	const { data: filteredData, paginationInfo } = isEnabled( 'dashboard/v2/es-site-list' )
		? esFilterSortAndPaginate( sites, view, totalItems )
		: filterSortAndPaginate( sites, view, fields );

	return (
		<>
			<DataViewsCard>
				<DataViews< Site >
					getItemId={ ( item ) => item.ID.toString() + item.URL }
					data={ filteredData }
					fields={ fields }
					actions={ actions }
					view={ view }
					isLoading={ isLoading }
					onChangeView={ onChangeView }
					onResetView={ onResetView }
					defaultLayouts={ DEFAULT_LAYOUTS }
					paginationInfo={ paginationInfo }
					config={ DEFAULT_CONFIG }
					empty={ empty }
					renderItemLink={ ( { item, ...props } ) => <SiteLink { ...props } site={ item } /> }
				/>
			</DataViewsCard>
			<GuidedTourContextProvider
				tourId="hosting-dashboard-tours-sites"
				isSkippable
				guidedTours={ [
					{
						id: 'hosting-dashboard-tours-sites-switch-layouts',
						title: __( 'Switch layouts' ),
						description: __(
							'Choose between a visual grid view and a more compact table view of your sites.'
						),
					},
					{
						id: 'hosting-dashboard-tours-sites-appearance-options',
						title: __( 'Appearance options' ),
						description: __(
							'Choose which site properties you see as well as sorting, density, and the number of sites displayed on each page.'
						),
					},
				] }
			>
				<GuidedTourStep
					id="hosting-dashboard-tours-sites-switch-layouts"
					selector={ `.dataviews__view-actions button[aria-label="${ __( 'Layout' ) }"]` }
					placement="bottom"
					inline
					// The footer in DataViews uses a z-index of 2, so we need to apply the same value to ensure our element does not appear behind it.
					popoverStyle={ { zIndex: 2 } }
				/>
				<GuidedTourStep
					id="hosting-dashboard-tours-sites-appearance-options"
					selector={ `.dataviews__view-actions button[aria-label="${ __( 'View options' ) }"]` }
					placement="bottom"
					inline
					popoverStyle={ { zIndex: 2 } }
				/>
			</GuidedTourContextProvider>
		</>
	);
};
