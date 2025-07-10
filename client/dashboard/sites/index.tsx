import { DataViews, filterSortAndPaginate } from '@automattic/dataviews';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAuth } from '../app/auth';
import { isAutomatticianQuery } from '../app/queries/me-a8c';
import { userPreferencesQuery, userPreferencesMutation } from '../app/queries/me-preferences';
import { sitesQuery } from '../app/queries/sites';
import { sitesRoute } from '../app/router';
import DataViewsCard from '../components/dataviews-card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { getActions } from './actions';
import AddNewSite from './add-new-site';
import { getFields } from './fields';
import { SitesNotices } from './notices';
import { getView, mergeViews, DEFAULT_LAYOUTS } from './views';
import type { ViewPreferences, ViewSearchParams } from './views';
import type { FetchSitesOptions, Site } from '../data/types';
import type { View, Filter } from '@automattic/dataviews';

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
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const router = useRouter();
	const currentSearchParams = sitesRoute.useSearch();
	const viewSearchParams: ViewSearchParams = currentSearchParams.view ?? {};
	const isRestoringAccount = !! currentSearchParams.restored;

	const { user } = useAuth();
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const viewPreferences = useSuspenseQuery( userPreferencesQuery( 'sites-view', {} ) )
		.data as ViewPreferences;
	const { mutate: updateViewPreferences } = useMutation( userPreferencesMutation( 'sites-view' ) );

	const { defaultView, view } = getView( {
		user,
		isAutomattician,
		isRestoringAccount,
		viewPreferences,
		viewSearchParams,
	} );

	const { data: sites, isLoading: isLoadingSites } = useQuery(
		sitesQuery( getFetchSitesOptions( view, isRestoringAccount ) )
	);

	const fields = getFields( { isAutomattician, viewType: view.type } );
	const actions = getActions( router );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites ?? [], view, fields );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const handleViewChange = ( nextView: View ) => {
		if ( nextView.type === 'list' ) {
			return;
		}

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

		updateViewPreferences( updatedViewPreferences as Record< string, unknown > );
	};

	return (
		<>
			{ isModalOpen && (
				<Modal title={ __( 'Add New Site' ) } onRequestClose={ () => setIsModalOpen( false ) }>
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
								{ __( 'Add New Site' ) }
							</Button>
						}
					/>
				}
			>
				<SitesNotices />
				<DataViewsCard>
					<DataViews< Site >
						getItemId={ ( item ) => item.ID.toString() }
						data={ filteredData }
						fields={ fields }
						actions={ actions }
						view={ view }
						isLoading={ isLoadingSites }
						onChangeView={ handleViewChange }
						defaultLayouts={ DEFAULT_LAYOUTS }
						paginationInfo={ paginationInfo }
					/>
				</DataViewsCard>
			</PageLayout>
		</>
	);
}
