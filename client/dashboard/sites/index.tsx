import {
	isAutomatticianQuery,
	userPreferenceQuery,
	userPreferenceMutation,
	sitesQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, Modal } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../app/analytics';
import { useAuth } from '../app/auth';
import { sitesRoute } from '../app/router/sites';
import { DataViewsCard } from '../components/dataviews-card';
import { DataViewsEmptyState } from '../components/dataviews-empty-state';
import { GuidedTourContextProvider, GuidedTourStep } from '../components/guided-tour';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { useActions } from './actions';
import AddNewSite from './add-new-site';
import { getFields } from './fields';
import noSitesIllustration from './no-sites-illustration.svg';
import { SitesNotices } from './notices';
import {
	getView,
	mergeViews,
	DEFAULT_LAYOUTS,
	recordViewChanges,
	DEFAULT_PER_PAGE_SIZES,
} from './views';
import type { ViewSearchParams } from './views';
import type { FetchSitesOptions, Site } from '@automattic/api-core';
import type { View, Filter } from '@wordpress/dataviews';

const getFetchSitesOptions = ( view: View, isRestoringAccount: boolean ): FetchSitesOptions => {
	const filters = view.filters ?? [];

	// Include A8C sites unless explicitly excluded from the filter.
	const shouldIncludeA8COwned = ! filters.some(
		( item: Filter ) => item.field === 'is_a8c' && item.value === false
	);

	if ( filters.find( ( item: Filter ) => item.field === 'status' && item.value === 'deleted' ) ) {
		return { site_visibility: 'deleted', include_a8c_owned: shouldIncludeA8COwned };
	}

	return {
		// Some P2 sites are not retrievable unless site_visibility is set to 'all'.
		// See: https://github.com/Automattic/wp-calypso/pull/104220.
		site_visibility: view.search || shouldIncludeA8COwned || isRestoringAccount ? 'all' : 'visible',
		include_a8c_owned: shouldIncludeA8COwned,
	};
};

export default function Sites() {
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const currentSearchParams = sitesRoute.useSearch();
	const viewSearchParams: ViewSearchParams = currentSearchParams.view ?? {};
	const isRestoringAccount = !! currentSearchParams.restored;

	const { user } = useAuth();
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const { data: viewPreferences } = useSuspenseQuery( userPreferenceQuery( 'sites-view' ) );
	const { mutate: updateViewPreferences } = useMutation( userPreferenceMutation( 'sites-view' ) );

	const { defaultView, view } = getView( {
		user,
		isAutomattician,
		isRestoringAccount,
		viewPreferences,
		viewSearchParams,
	} );

	const {
		data: sites,
		isLoading: isLoadingSites,
		isPlaceholderData,
	} = useQuery( {
		...sitesQuery( getFetchSitesOptions( view, isRestoringAccount ) ),
		placeholderData: keepPreviousData,
	} );

	const fields = getFields( { isAutomattician, viewType: view.type } );
	const actions = useActions();

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites ?? [], view, fields );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const handleViewChange = ( nextView: View ) => {
		if ( nextView.type === 'list' ) {
			return;
		}

		recordViewChanges( view, nextView, recordTracksEvent );

		const { updatedViewPreferences, updatedViewSearchParams } = mergeViews( {
			defaultView,
			view,
			viewPreferences,
			nextView,
		} );

		navigate( {
			search: {
				...currentSearchParams,
				view: updatedViewSearchParams,
			},
		} );

		updateViewPreferences( updatedViewPreferences );
	};

	const hasFilterOrSearch = ( view.filters && view.filters.length > 0 ) || view.search;

	const emptyTitle = hasFilterOrSearch ? __( 'No sites found' ) : __( 'No sites' );

	let emptyDescription = __( 'Get started by creating a new site.' );
	if ( view.search ) {
		emptyDescription = sprintf(
			// Translators: %s is the search term used when looking for sites by title or domain name.
			__(
				'Your search for “%s” did not match any sites. Try searching by the site title or domain name.'
			),
			view.search
		);
	} else if ( hasFilterOrSearch ) {
		emptyDescription = __( 'Your search did not match any sites.' );
	}

	return (
		<>
			{ isModalOpen && (
				<Modal title={ __( 'Add new site' ) } onRequestClose={ () => setIsModalOpen( false ) }>
					<AddNewSite context="sites-dashboard" />
				</Modal>
			) }
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Sites' ) }
						actions={
							<Button
								variant="primary"
								onClick={ () => setIsModalOpen( true ) }
								__next40pxDefaultSize
							>
								{ __( 'Add new site' ) }
							</Button>
						}
					/>
				}
				notices={ <SitesNotices /> }
			>
				<DataViewsCard>
					<DataViews< Site >
						getItemId={ ( item ) => item.ID.toString() }
						data={ filteredData }
						fields={ fields }
						actions={ actions }
						view={ view }
						isLoading={ isLoadingSites || ( isPlaceholderData && filteredData.length === 0 ) }
						onChangeView={ handleViewChange }
						defaultLayouts={ DEFAULT_LAYOUTS }
						paginationInfo={ paginationInfo }
						config={ { perPageSizes: DEFAULT_PER_PAGE_SIZES } }
						empty={
							<DataViewsEmptyState
								title={ emptyTitle }
								description={ emptyDescription }
								illustration={
									<img src={ noSitesIllustration } alt="" width={ 408 } height={ 280 } />
								}
								actions={
									<>
										{ view.search && (
											<Button
												__next40pxDefaultSize
												variant="secondary"
												onClick={ () => {
													navigate( {
														search: {
															...currentSearchParams,
															view: Object.fromEntries(
																Object.entries( view ).filter( ( [ key ] ) => key !== 'search' )
															),
														},
													} );
												} }
											>
												{ __( 'Clear search' ) }
											</Button>
										) }
										<Button
											__next40pxDefaultSize
											variant="primary"
											onClick={ () => setIsModalOpen( true ) }
										>
											{ __( 'Add new site' ) }
										</Button>
									</>
								}
							/>
						}
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
					/>
					<GuidedTourStep
						id="hosting-dashboard-tours-sites-appearance-options"
						selector={ `.dataviews__view-actions button[aria-label="${ __( 'View options' ) }"]` }
						placement="bottom"
						inline
					/>
				</GuidedTourContextProvider>
			</PageLayout>
		</>
	);
}
