import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import DocumentHead from 'calypso/components/data/document-head';
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

	// todo: temporary mock data
	const hideListing = false;
	const isNarrowView = false;
	const selectedSite = dataViewsState.selectedItem;

	return (
		<Layout
			className={ classNames(
				'sites-dashboard',
				'sites-dashboard__layout',
				! dataViewsState.selectedItem && 'preview-hidden'
			) }
			wide
			//sidebarNavigation={ <MobileSidebarNavigation /> }
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
					The Preview Pane for <b>{ selectedSite.URL }</b>
				</LayoutColumn>
			) }
		</Layout>
	);
};

export default SitesDashboardV2;
