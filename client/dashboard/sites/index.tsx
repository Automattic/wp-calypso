import {
	isAutomatticianQuery,
	userPreferenceQuery,
	userPreferenceMutation,
	sitesQuery,
	siteBySlugQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import {
	useQuery,
	useQueryClient,
	useSuspenseQuery,
	useMutation,
	keepPreviousData,
} from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import deepmerge from 'deepmerge';
import { useState, useEffect } from 'react';
import { Experiment } from 'calypso/lib/explat';
import { useAnalytics } from '../app/analytics';
import { useAuth } from '../app/auth';
import { sitesRoute } from '../app/router/sites';
import { DataViewsEmptyState } from '../components/dataviews-empty-state';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import AddNewSite from './add-new-site';
import {
	SitesDataViews,
	useActions,
	getFields,
	getView,
	mergeViews,
	recordViewChanges,
} from './dataviews';
import noSitesIllustration from './no-sites-illustration.svg';
import { SitesNotices } from './notices';
import type { ViewSearchParams } from './dataviews/views';
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
	const queryClient = useQueryClient();
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

	useEffect( () => {
		if ( sites ) {
			sites.forEach( ( site ) => {
				const updater = ( oldData?: Site ) => ( oldData ? deepmerge( oldData, site ) : site );
				queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, updater );
				queryClient.setQueryData( siteByIdQuery( site.ID ).queryKey, updater );
			} );
		}
	}, [ sites, queryClient ] );

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
				<SitesDataViews
					view={ view }
					sites={ sites ?? [] }
					fields={ fields }
					actions={ actions }
					isLoading={ isLoadingSites || ( isPlaceholderData && sites.length === 0 ) }
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
					handleViewChange={ handleViewChange }
				/>
			</PageLayout>
			{ /* ExPlat's Evergreen A/A Test Experiment:
			 *
			 * This continually starts a new experiment every week that doesn't render anything and
			 * shouldn't send any extra requests, just to help us ensure our experimentation system is
			 * working smoothly.
			 *
			 * This particular spot isn't special, it just needs somewhere to live.
			 *
			 * We use iso-week and iso-week-year in order to consistently change the experiment name every week.
			 * Assumes users have a somewhat working clock but shouldn't be a problem if they don't.
			 */ }
			<Experiment
				name={ ( () => {
					const now = new Date();
					const year = getISOWeekYear( now );
					const week = String( getISOWeek( now ) ).padStart( 2, '0' );
					return `explat_test_aa_weekly_calypso_${ year }_week_${ week }`;
				} )() }
				defaultExperience={ null }
				treatmentExperience={ null }
				loadingExperience={ null }
			/>
		</>
	);
}
