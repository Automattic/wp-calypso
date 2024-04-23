import { useSitesListFiltering } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import {
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
import { useDispatch, useSelector } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSection } from 'calypso/state/ui/selectors';
import DotcomPreviewPane from './site-preview-pane/dotcom-preview-pane';
import SitesDashboardHeader from './sites-dashboard-header';
import DotcomSitesDataViews from './sites-dataviews';

// todo: we are using A4A styles until we extract them as common styles in the ItemsDashboard component
import './style.scss';

interface SitesDashboardProps {
	queryParams: SitesDashboardQueryParams;
	onQueryParamChange: ( params: SitesDashboardQueryParams ) => void;
}

const SitesDashboardV2 = ( {
	queryParams: { page = 1, perPage = 96, search, newSiteID },
	onQueryParamChange = handleQueryParamChange,
}: SitesDashboardProps ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const section = useSelector( getSection );

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
	initialDataViewsState.page = page;
	initialDataViewsState.perPage = perPage;
	initialDataViewsState.search = search ?? '';
	initialDataViewsState.hiddenFields = [ 'status' ];
	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( initialDataViewsState );

	// Filter sites list state
	const filteredSites = useSitesListFiltering( allSites, { search: dataViewsState.search } );

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

	const setQueryParams = useCallback(
		( queryParams: SitesDashboardQueryParams ) => {
			// There is a chance that the URL is not up to date when it mounts, so delay
			// the onQueryParamChange call to avoid it getting the incorrect URL and then
			// redirecting back to the previous path.
			if ( window.location.pathname.startsWith( `/${ section?.group }` ) ) {
				onQueryParamChange( queryParams );
			} else {
				window.setTimeout( () => onQueryParamChange( queryParams ) );
			}
		},
		[ onQueryParamChange, section?.group ]
	);

	// Update URL with search param on change
	useEffect( () => {
		const queryParams = { search: dataViewsState.search?.trim() };

		setQueryParams( queryParams );
	}, [ dataViewsState.search, setQueryParams ] );

	useEffect( () => {
		const queryParams = {
			page: dataViewsState.page === 1 ? undefined : dataViewsState.page,
			// todo: get rid of magic number for default perPage value 96
			perPage: dataViewsState.perPage === 96 ? undefined : dataViewsState.perPage,
		};
		setQueryParams( queryParams );
	}, [ dataViewsState.page, dataViewsState.perPage, setQueryParams ] );

	// Search, filtering, pagination and sorting sites:
	useEffect( () => {
		// todo: Perform search, filter, pagination and sorting actions
	}, [
		dataViewsState.search,
		dataViewsState.filters,
		dataViewsState.sort,
		dataViewsState.page,
		dataViewsState.perPage,
	] );

	// Manage the closing of the preview pane
	const closeSitePreviewPane = useCallback( () => {
		if ( dataViewsState.selectedItem ) {
			setDataViewsState( { ...dataViewsState, type: DATAVIEWS_TABLE, selectedItem: undefined } );
			//setHideListing( false );
		}
	}, [ dataViewsState, setDataViewsState ] );

	// todo: temporary mock data
	const hideListing = false;
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
						sites={ filteredSites }
						isLoading={ isLoading }
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
