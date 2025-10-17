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
import deepmerge from 'deepmerge';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../app/analytics';
import { useAuth } from '../app/auth';
import { sitesRoute } from '../app/router/sites';
import { DataViewsEmptyState } from '../components/dataviews-empty-state';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import AddNewSite from '../sites/add-new-site';
import {
	SitesDataViews,
	useActions,
	getFields,
	getView,
	mergeViews,
	recordViewChanges,
} from '../sites/dataviews';
import noSitesIllustration from '../sites/no-sites-illustration.svg';
import { SitesNotices } from '../sites/notices';
import type { ViewSearchParams } from '../sites/dataviews/views';
import type { FetchSitesOptions, Site } from '@automattic/api-core';
import type { View, Filter } from '@wordpress/dataviews';

const getFetchSitesOptions = ( view: View, isRestoringAccount: boolean ): FetchSitesOptions => {
	const filters = view.filters ?? [];

	if ( filters.find( ( item: Filter ) => item.field === 'status' && item.value === 'deleted' ) ) {
		return { site_visibility: 'deleted', include_a8c_owned: false };
	}

	return {
		site_filters: [ 'commerce-garden' ],
		// Some P2 sites are not retrievable unless site_visibility is set to 'all'.
		// See: https://github.com/Automattic/wp-calypso/pull/104220.
		site_visibility: view.search || isRestoringAccount ? 'all' : 'visible',
		include_a8c_owned: false,
	};
};

export default function CIABSites() {
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const queryClient = useQueryClient();
	const currentSearchParams = sitesRoute.useSearch();
	const viewSearchParams: ViewSearchParams = currentSearchParams.view ?? {};
	const isRestoringAccount = !! currentSearchParams.restored;

	const { user } = useAuth();
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const { data: viewPreferences } = useSuspenseQuery( userPreferenceQuery( 'ciab-sites-view' ) );
	const { mutate: updateViewPreferences } = useMutation(
		userPreferenceMutation( 'ciab-sites-view' )
	);

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

	const emptyTitle = hasFilterOrSearch ? __( 'No stores found' ) : __( 'No stores' );

	let emptyDescription = __( 'Get started by creating a new store.' );
	if ( view.search ) {
		emptyDescription = sprintf(
			// Translators: %s is the search term used when looking for stores by title or domain name.
			__(
				'Your search for “%s” did not match any stores. Try searching by the store title or domain name.'
			),
			view.search
		);
	} else if ( hasFilterOrSearch ) {
		emptyDescription = __( 'Your search did not match any stores.' );
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
				<Modal title={ __( 'Add new store' ) } onRequestClose={ () => setIsModalOpen( false ) }>
					<AddNewSite context="ciab-sites-dashboard" />
				</Modal>
			) }
			<PageLayout
				header={
					<PageHeader
						actions={
							<Button
								variant="primary"
								onClick={ () => setIsModalOpen( true ) }
								__next40pxDefaultSize
							>
								{ __( 'Add new store' ) }
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
										{ __( 'Add new store' ) }
									</Button>
								</>
							}
						/>
					}
					handleViewChange={ handleViewChange }
				/>
			</PageLayout>
		</>
	);
}
