import { SiteExcerptData } from '@automattic/sites';
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
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import DotcomPreviewPane from './site-preview-pane/dotcom-preview-pane';
import SitesDashboardHeader from './sites-dashboard-header';
import DotcomSitesDataViews from './sites-dataviews';

// todo use this A4A styles until we extract them as common styles in the ItemsDashboard component
import 'calypso/a8c-for-agencies/sections/sites/sites-dashboard/style.scss';

type Props = {
	sites: SiteExcerptData[];
	isLoading: boolean;
};

const SitesDashboardV2 = ( { sites, isLoading }: Props ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	/*
		const dispatch = useDispatch();
	useEffect( () => {
		dispatch( setSelectedSiteId( selectedSiteId || null ) );
	}, [ dispatch, selectedSiteId ] );
	 */

	/*
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
	 */
	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( initialDataViewsState );

	useEffect( () => {
		if ( dataViewsState.selectedItem ) {
			dispatch( setSelectedSiteId( dataViewsState.selectedItem.ID ) );
		}
	}, [ dataViewsState.selectedItem ] );

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
						sites={ sites }
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
