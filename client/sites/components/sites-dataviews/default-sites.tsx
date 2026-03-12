import { isAutomatticianQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getQueryArgs } from '@wordpress/url';
import { useCallback } from 'react';
import { useBasePersistentView } from 'calypso/dashboard/app/hooks/use-persistent-view';
import { DataViews } from 'calypso/dashboard/components/dataviews';
import { useSiteListQuery, filterSortAndPaginateSites } from 'calypso/dashboard/sites';
import {
	DEFAULT_CONFIG,
	useFields,
	getDefaultView,
	recordViewChanges,
	sanitizeFields,
} from 'calypso/dashboard/sites/dataviews';
import { canManageSite } from 'calypso/dashboard/sites/features';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { useActions } from './actions';
import type { SitePreviewPane } from '../types';
import type { Site } from '@automattic/api-core';
import type { Action, View } from '@wordpress/dataviews';

const listView: Pick< View, 'type' | 'fields' > = { type: 'list', fields: [] };

const navigate = ( { search, replace }: { search: any; replace?: boolean } ) => {
	const params = new URLSearchParams( search );
	const url = `${ window.location.pathname }?${ params }`;
	if ( replace ) {
		page.replace( url );
	} else {
		page.show( url );
	}
};

export default function DefaultSitesDataViews( {
	selectedSiteId,
	sitePreviewPane,
}: {
	selectedSiteId: number;
	sitePreviewPane: SitePreviewPane;
} ) {
	const queryParams = getQueryArgs( window.location.href );
	const isRestoringAccount = queryParams[ 'restored' ] === 'true';

	const siteCount = useSelector( getCurrentUserSiteCount );
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );

	const defaultView = getDefaultView( {
		siteCount: siteCount ?? 0,
		isAutomattician,
		isRestoringAccount,
	} );

	const { view, updateView, resetView } = useBasePersistentView( {
		slug: 'sites',
		defaultView,
		queryParams,
		sanitizeFields,
		navigate,
	} );

	const { sites, isLoadingSites, isPlaceholderData, hasNoData, totalItems } = useSiteListQuery(
		view,
		{
			isDefaultView: ! resetView && ! view.search && view.page === 1,
			isRestoringAccount,
			isAutomattician,
		}
	);

	const fields = useFields( { isAutomattician, viewType: listView.type } );
	const actions = useActions( { viewType: listView.type } );

	const handleViewChange = ( nextView: View ) => {
		recordViewChanges( view, nextView, recordTracksEvent );
		updateView( { ...nextView, type: view.type, fields: view.fields } as View );
	};

	const { data: filteredData, paginationInfo } = filterSortAndPaginateSites(
		sites ?? [],
		view,
		totalItems ?? 0
	);

	const onSelectionChange = useCallback(
		( selectedSiteIds: string[] ) => {
			if ( ! sites || selectedSiteIds.length === 0 ) {
				return;
			}

			const site = sites.find( ( s ) => s.ID === Number( selectedSiteIds[ 0 ] ) );
			if ( ! site || site.is_deleted ) {
				return false;
			}

			if ( canManageSite( site ) ) {
				sitePreviewPane.open( site, 'list_row_click' );
				return;
			}

			window.location.href = site.options?.admin_url || '';
		},
		[ sitePreviewPane, sites ]
	);

	return (
		<DataViews
			getItemId={ ( item ) => item.ID.toString() }
			data={ filteredData }
			fields={ fields.map( ( field ) => ( { ...field, enableHiding: false } ) ) }
			actions={ actions as unknown as Action< Site >[] }
			view={ { ...view, ...listView } as View }
			isLoading={ isLoadingSites || ( isPlaceholderData && hasNoData ) }
			isPlaceholderData={ isPlaceholderData }
			onChangeView={ handleViewChange }
			paginationInfo={ paginationInfo }
			config={ DEFAULT_CONFIG }
			defaultLayouts={ { list: {} } }
			onResetView={ resetView }
			selection={ [ selectedSiteId.toString() ] }
			onChangeSelection={ onSelectionChange }
		/>
	);
}
