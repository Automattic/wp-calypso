import { isAutomatticianQuery, siteBySlugQuery, siteByIdQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import deepmerge from 'deepmerge';
import { useEffect } from 'react';
import { useAnalytics } from '../app/analytics';
import { useAuth } from '../app/auth';
import { usePersistentView } from '../app/dataviews';
import { useHelpCenter } from '../app/help-center';
import { sitesRoute } from '../app/router/sites';
import { DataViewsEmptyState } from '../components/dataviews-empty-state';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { useSiteListQuery } from '../sites';
import {
	SitesDataViews,
	useActions,
	useFields,
	getDefaultView,
	recordViewChanges,
} from '../sites/dataviews';
import noSitesIllustration from '../sites/no-sites-illustration.svg';
import { SitesNotices } from '../sites/notices';
import type { Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export default function CIABSites() {
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const queryClient = useQueryClient();
	const currentSearchParams = sitesRoute.useSearch();
	const isRestoringAccount = !! currentSearchParams.restored;

	const { user } = useAuth();
	const { setShowHelpCenter } = useHelpCenter();
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );

	const defaultView = getDefaultView( {
		user,
		isAutomattician,
		isRestoringAccount,
	} );

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'sites-ciab',
		defaultView,
		queryParams: currentSearchParams,
	} );

	const { sites, isLoadingSites, isPlaceholderData, totalItems } = useSiteListQuery(
		view,
		isRestoringAccount
	);

	const fields = useFields( { isAutomattician, viewType: view.type } );
	const actions = useActions();

	const handleAddNewStore = () => {
		setShowHelpCenter( false );
		recordTracksEvent( 'calypso_dashboard_sites_add_new_site_click', {
			action: 'big-sky',
		} );
	};

	const handleViewChange = ( nextView: View ) => {
		if ( nextView.type === 'list' ) {
			return;
		}

		recordViewChanges( view, nextView, recordTracksEvent );

		updateView( nextView );
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
		if ( sites && ! isEnabled( 'dashboard/v2/es-site-list' ) ) {
			sites.forEach( ( site ) => {
				const updater = ( oldData?: Site ) => ( oldData ? deepmerge( oldData, site ) : site );
				queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, updater );
				queryClient.setQueryData( siteByIdQuery( site.ID ).queryKey, updater );
			} );
		}
	}, [ sites, queryClient ] );

	const addNewStoreUrl = addQueryArgs( '/setup/ai-site-builder-spec', {
		source: 'ciab-sites-dashboard',
		ref: 'new-site-popover',
	} );

	return (
		<>
			<PageLayout
				header={
					<PageHeader
						actions={
							<Button
								variant="primary"
								href={ addNewStoreUrl }
								onClick={ handleAddNewStore }
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
					totalItems={ totalItems ?? 0 }
					fields={ fields }
					actions={ actions }
					isLoading={ isLoadingSites || ( isPlaceholderData && sites?.length === 0 ) }
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
										href={ addNewStoreUrl }
										onClick={ handleAddNewStore }
									>
										{ __( 'Add new store' ) }
									</Button>
								</>
							}
						/>
					}
					onChangeView={ handleViewChange }
					onResetView={ resetView }
				/>
			</PageLayout>
		</>
	);
}
