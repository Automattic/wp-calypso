import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import { GuidedTourContextProvider, GuidedTourStep } from '../../components/guided-tour';
import { SiteLink } from '../site-fields';
import { DEFAULT_LAYOUTS, DEFAULT_CONFIG } from './views';
import type { Site } from '@automattic/api-core';
import type { Action, Field, View } from '@wordpress/dataviews';
import type { ComponentProps, ReactNode } from 'react';

export function SitesDataViews( {
	view,
	sites,
	fields,
	actions,
	isLoading,
	isPlaceholderData,
	empty,
	paginationInfo,
	onChangeView,
	onResetView,
}: {
	view: View;
	sites: Site[];
	fields: Field< Site >[];
	actions?: Action< Site >[];
	isLoading: boolean;
	isPlaceholderData?: boolean;
	empty: ReactNode;
	paginationInfo: ComponentProps< typeof DataViews< Site > >[ 'paginationInfo' ];
	onChangeView: ( view: View ) => void;
	onResetView?: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<>
			<DataViewsCard>
				<DataViews< Site >
					getItemId={ ( item ) => item.ID.toString() }
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
					renderItemLink={ ( { item, ...props } ) => (
						<SiteLink
							{ ...props }
							site={ item }
							onClick={ () => recordTracksEvent( 'calypso_dashboard_sites_item_click' ) }
						/>
					) }
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
