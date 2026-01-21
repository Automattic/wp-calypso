import { __ } from '@wordpress/i18n';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import { GuidedTourContextProvider, GuidedTourStep } from '../../components/guided-tour';
import { DEFAULT_LAYOUTS, DEFAULT_CONFIG } from './views';
import type { Action, Field, View } from '@wordpress/dataviews';
import type { ComponentProps, ReactNode } from 'react';

export function SitesDataViews< SiteType >( {
	view,
	sites,
	fields,
	actions,
	isLoading,
	isPlaceholderData,
	empty,
	paginationInfo,
	renderItemLink,
	getItemId,
	onChangeView,
	onResetView,
}: {
	view: View;
	sites: SiteType[];
	fields: Field< SiteType >[];
	actions?: Action< SiteType >[];
	isLoading: boolean;
	isPlaceholderData?: boolean;
	empty: ReactNode;
	paginationInfo: ComponentProps< typeof DataViews< SiteType > >[ 'paginationInfo' ];
	renderItemLink: ComponentProps< typeof DataViews< SiteType > >[ 'renderItemLink' ];
	getItemId: ComponentProps< typeof DataViews< SiteType > >[ 'getItemId' ];
	onChangeView: ( view: View ) => void;
	onResetView?: () => void;
} ) {
	return (
		<>
			<DataViewsCard>
				{ /* @ts-ignore - TS doesn't seem able to resolve which branch of the DataViewsProps type to go down, either the branch were the row type has an `id`, or the branch where it does not. */ }
				<DataViews< SiteType >
					getItemId={ getItemId }
					data={ sites }
					fields={ fields }
					actions={ actions }
					view={ view }
					isLoading={ isLoading }
					isPlaceholderData={ isPlaceholderData }
					onChangeView={ onChangeView }
					onResetView={ onResetView }
					defaultLayouts={ DEFAULT_LAYOUTS }
					paginationInfo={ paginationInfo }
					config={ DEFAULT_CONFIG }
					empty={ empty }
					renderItemLink={ renderItemLink }
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
}
