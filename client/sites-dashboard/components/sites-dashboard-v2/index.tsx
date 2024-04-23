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
import './style.scss';

type Props = {
	sites: SiteExcerptData[];
	isLoading: boolean;
};

const SitesDashboardV2 = ( { sites, isLoading }: Props ) => {
	// todo: we are getting the sites list from the current SitesDashboard component, we have to get them here

	const { __ } = useI18n();
	const dispatch = useDispatch();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( initialDataViewsState );

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
