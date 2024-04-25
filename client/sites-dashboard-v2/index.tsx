import { useSitesListFiltering, useSitesListGrouping } from '@automattic/sites';
import { GroupableSiteLaunchStatuses } from '@automattic/sites/src/use-sites-list-grouping';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	DATAVIEWS_LIST,
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import {
	SitesDashboardQueryParams,
	handleQueryParamChange,
} from 'calypso/sites-dashboard/components/sites-content-controls';
import {
	useShowSiteCreationNotice,
	useShowSiteTransferredNotice,
} from 'calypso/sites-dashboard/components/sites-dashboard';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import DotcomPreviewPane from './site-preview-pane/dotcom-preview-pane';
import SitesDashboardHeader from './sites-dashboard-header';
import DotcomSitesDataViews, { siteStatusGroups } from './sites-dataviews';
import { getSitesPagination } from './sites-dataviews/utils';

// todo: we are using A4A styles until we extract them as common styles in the ItemsDashboard component
import './style.scss';

// Add Dotcom specific styles
import './dotcom-style.scss';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import { updateSitesDashboardUrl } from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard/update-sites-dashboard-url';
import page from '@automattic/calypso-router';
import { Site } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface SitesDashboardProps {
	queryParams: SitesDashboardQueryParams;
	updateQueryParams?: ( params: SitesDashboardQueryParams ) => void;
}

const SitesDashboardV2 = ( {
	queryParams: { listPage = 1, perPage = 96, search, newSiteID, status = 'all' },
	updateQueryParams = handleQueryParamChange,
}: SitesDashboardProps ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const {
		dataViewsState,
		setDataViewsState,
		initialSelectedSiteUrl,
		selectedSiteFeature,
		selectedCategory: category,
		setSelectedCategory: setCategory,
		showOnlyFavorites,
		hideListing,
		setHideListing,
	} = useContext( SitesDashboardContext );

	const { data: liveSites = [], isLoading } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);

	const { data: deletedSites = [] } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only,
		'deleted'
	);

	const allSites = liveSites.concat( deletedSites );

	useShowSiteCreationNotice( allSites, newSiteID );
	useShowSiteTransferredNotice();

	// Create the DataViews state based on initial values
	// const defaultDataViewsState = {
	// 	...initialDataViewsState,
	// 	page,
	// 	perPage,
	// 	search: search ?? '',
	// 	filters:
	// 		status === 'all'
	// 			? []
	// 			: [
	// 					{
	// 						field: 'status',
	// 						operator: 'in',
	// 						value: siteStatusGroups.find( ( item ) => item.slug === status )?.value || 1,
	// 					},
	// 			  ],
	// };
	// const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( defaultDataViewsState );

	useEffect( () => {
		if ( dataViewsState.selectedItem && ! initialSelectedSiteUrl ) {
			setDataViewsState( { ...dataViewsState, type: DATAVIEWS_TABLE, selectedItem: undefined } );
			setHideListing( false );
			return;
		}

		if (
			dataViewsState.selectedItem &&
			dataViewsState.selectedItem.url === initialSelectedSiteUrl
		) {
			return;
		}

		console.log( initialSelectedSiteUrl );

		// 	if ( ! isLoading && allSites && initialSelectedSiteUrl ) {
		// 		const site = liveSites.sites.find( ( site: Site ) => site.url === initialSelectedSiteUrl );
		//
		// 		setDataViewsState( ( prevState: DataViewsState ) => ( {
		// 			...prevState,
		// 			selectedItem: site,
		// 			type: DATAVIEWS_LIST,
		// 		} ) );
		// 	}
		// 	// Omitting sitesViewState to prevent infinite loop
		// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ allSites, isLoading, initialSelectedSiteUrl, setDataViewsState, setHideListing ] );

	useEffect( () => {
		// If there isn't a selected site and we are showing only the preview pane we should wait for the selected site to load from the endpoint
		if ( hideListing && ! dataViewsState.selectedItem ) {
			return;
		}

		if ( dataViewsState.selectedItem ) {
			dispatch( setSelectedSiteId( dataViewsState.selectedItem.blog_id ) );
		}

		const updatedUrl = updateSitesDashboardUrl( {
			category: category,
			setCategory: setCategory,
			filters: dataViewsState.filters,
			selectedSite: dataViewsState.selectedItem,
			selectedSiteFeature: selectedSiteFeature,
			search: dataViewsState.search,
			currentPage: dataViewsState.page,
			sort: dataViewsState.sort,
			showOnlyFavorites,
		} );
		if ( page.current !== updatedUrl && updatedUrl !== undefined ) {
			page.show( updatedUrl );
		}
	}, [
		dataViewsState.selectedItem,
		selectedSiteFeature,
		category,
		setCategory,
		dispatch,
		dataViewsState.filters,
		dataViewsState.search,
		dataViewsState.page,
		showOnlyFavorites,
		dataViewsState.sort,
		hideListing,
	] );

	// Get the status group slug.
	const statusSlug = useMemo( () => {
		const statusFilter = dataViewsState.filters.find( ( filter ) => filter.field === 'status' );
		const statusNumber = statusFilter?.value || 1;
		return ( siteStatusGroups.find( ( status ) => status.value === statusNumber )?.slug ||
			'all' ) as GroupableSiteLaunchStatuses;
	}, [ dataViewsState.filters ] );

	// Filter sites list by status group.
	const { currentStatusGroup } = useSitesListGrouping( allSites, {
		status: statusSlug,
		showHidden: true,
	} );

	// Filter sites list by search query.
	const filteredSites = useSitesListFiltering( currentStatusGroup, {
		search: dataViewsState.search,
	} );

	// todo: Perform sorting actions

	const paginatedSites = filteredSites.slice( ( page - 1 ) * perPage, listPage * perPage );

	// Site is selected:
	useEffect( () => {
		if ( dataViewsState.selectedItem ) {
			// Set the selected site ID globally at Dotcom
			dispatch( setSelectedSiteId( dataViewsState.selectedItem.ID ) );
		} else {
			// Reset the selected site ID globally at Dotcom
			dispatch( setSelectedSiteId( null ) );
		}
	}, [ dataViewsState.selectedItem ] );

	// Update URL with search param on change
	// useEffect( () => {
	// 	const queryParams = {
	// 		search: dataViewsState.search?.trim(),
	// 		status: statusSlug === 'all' ? undefined : statusSlug,
	// 	};
	//
	// 	// There is a chance that the URL is not up to date when it mounts, so bump the
	// 	// updateQueryParams call to the back of the stack to avoid it getting the incorrect URL and
	// 	// then redirecting back to the previous path.
	// 	window.setTimeout( () => updateQueryParams( queryParams ) );
	// }, [ dataViewsState.search, statusSlug, updateQueryParams ] );

	// Update URL with page param on change.
	// useEffect( () => {
	// 	const queryParams = { page: dataViewsState.page };
	// 	window.setTimeout( () => updateQueryParams( queryParams ) );
	// }, [ dataViewsState.page, updateQueryParams ] );

	// Manage the closing of the preview pane
	const closeSitePreviewPane = useCallback( () => {
		if ( dataViewsState.selectedItem ) {
			setDataViewsState( { ...dataViewsState, type: DATAVIEWS_TABLE, selectedItem: undefined } );
			//setHideListing( false );
		}
	}, [ dataViewsState, setDataViewsState ] );

	// todo: temporary mock data
	//const hideListing = false;
	const isNarrowView = false;

	return (
		<Layout
			className={ classNames(
				'sites-dashboard',
				'sites-dashboard__layout',
				! dataViewsState.selectedItem && 'preview-hidden'
			) }
			wide
			title={ dataViewsState.selectedItem ? null : translate( 'Sites' ) }
		>
			<DocumentHead title={ __( 'Sites' ) } />

			{ ! hideListing && (
				<LayoutColumn className="sites-overview" wide>
					<LayoutTop withNavigation={ false }>
						<LayoutHeader>
							{ ! isNarrowView && <Title>{ translate( 'Sites' ) }</Title> }
							<Actions>
								<SitesDashboardHeader />
							</Actions>
						</LayoutHeader>
					</LayoutTop>

					<DocumentHead title={ __( 'Sites' ) } />
					<DotcomSitesDataViews
						sites={ paginatedSites }
						isLoading={ isLoading }
						paginationInfo={ getSitesPagination( filteredSites, perPage ) }
						dataViewsState={ dataViewsState }
						setDataViewsState={ setDataViewsState }
					/>
				</LayoutColumn>
			) }

			{ dataViewsState.selectedItem && (
				<LayoutColumn className="site-preview-pane" wide>
					<DotcomPreviewPane
						site={ dataViewsState.selectedItem }
						closeSitePreviewPane={ closeSitePreviewPane }
					/>
				</LayoutColumn>
			) }
		</Layout>
	);
};

export default SitesDashboardV2;
