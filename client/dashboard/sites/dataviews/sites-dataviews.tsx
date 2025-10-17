import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { DataViewsCard } from '../../components/dataviews-card';
import { GuidedTourContextProvider, GuidedTourStep } from '../../components/guided-tour';
import { DEFAULT_LAYOUTS, DEFAULT_PER_PAGE_SIZES } from './views';
import type { Site, SitesView } from '@automattic/api-core';
import type { Action, Field, View } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

export const SitesDataViews = ( {
	view,
	sites,
	fields,
	actions,
	isLoading,
	empty,
	handleViewChange,
}: {
	view: SitesView;
	sites: Site[];
	fields: Field< Site >[];
	actions: Action< Site >[];
	isLoading: boolean;
	empty: ReactNode;
	handleViewChange: ( view: View ) => void;
} ) => {
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	return (
		<>
			<DataViewsCard>
				<DataViews< Site >
					getItemId={ ( item ) => item.ID.toString() }
					data={ filteredData }
					fields={ fields }
					actions={ actions }
					view={ view }
					isLoading={ isLoading }
					onChangeView={ handleViewChange }
					defaultLayouts={ DEFAULT_LAYOUTS }
					paginationInfo={ paginationInfo }
					config={ { perPageSizes: DEFAULT_PER_PAGE_SIZES } }
					empty={ empty }
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
