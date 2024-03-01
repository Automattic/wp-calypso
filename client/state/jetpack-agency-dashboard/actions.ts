import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { AnyAction } from 'redux';
import {
	AgencyDashboardFilterOption,
	PurchasedProductsInfo,
	DashboardSortInterface,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { addQueryArgs } from 'calypso/lib/url';
import './init';
import {
	JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE,
	JETPACK_AGENCY_DASHBOARD_SELECT_LICENSE,
	JETPACK_AGENCY_DASHBOARD_UNSELECT_LICENSE,
	JETPACK_AGENCY_DASHBOARD_RESET_SITE,
	JETPACK_AGENCY_DASHBOARD_SITE_MONITOR_STATUS_CHANGE,
	JETPACK_AGENCY_DASHBOARD_SELECT_SITE_LICENSE,
	JETPACK_AGENCY_DASHBOARD_UNSELECT_SITE_LICENSE,
	JETPACK_AGENCY_DASHBOARD_RESET_SITE_LICENSES,
} from './action-types';

const isStreamlinedPurchasesEnabled = isEnabled( 'jetpack/streamline-license-purchases' );

const filterStateToQuery = ( filterOptions: AgencyDashboardFilterOption[] ) => {
	if ( ! filterOptions.length ) {
		return {};
	}
	return { issue_types: filterOptions.join( ',' ) };
};

export const updateDashboardURLQueryArgs = ( {
	filter,
	sort,
	search,
	activePage,
	perPage,
	selectedSiteUrl,
	selectedPreviewTab,
}: {
	filter?: AgencyDashboardFilterOption[];
	sort?: DashboardSortInterface;
	search?: string;
	activePage?: number;
	perPage?: number;
	selectedSiteUrl?: string;
	selectedPreviewTab?: number;
} ) => {
	const params = new URLSearchParams( window.location.search );

	const searchQuery = search !== undefined ? search : params.get( 's' );
	const filterOptions = filter
		? filter
		: ( params.getAll( 'issue_types' ) as AgencyDashboardFilterOption[] );
	const sortField = sort ? sort.field : params.get( 'sort_field' );
	const sortDirection = sort ? sort.direction : params.get( 'sort_direction' );
	const newActivePage = activePage ?? params.get( 'active_page' );
	const newPerPage = perPage ?? params.get( 'per_page' );
	const newSelectedSiteUrl = selectedSiteUrl;
	const newSelectedPreviewTab = selectedPreviewTab;

	// We omit pagination and tab information from the URL when we're on the first page or the first tab to streamline the URL.
	page.replace(
		addQueryArgs(
			{
				...( searchQuery && { s: searchQuery } ),
				...filterStateToQuery( filterOptions ),
				...( sortField && { sort_field: sortField } ),
				...( sortDirection && { sort_direction: sortDirection } ),
				...( newActivePage && newActivePage !== 1 && { active_page: newActivePage } ),
				...( newPerPage && newActivePage !== 1 && { per_page: newPerPage } ),
				...( newSelectedSiteUrl && { selected_site_url: newSelectedSiteUrl } ),
				...( newSelectedSiteUrl &&
					newSelectedPreviewTab &&
					newSelectedPreviewTab !== 1 && { selected_site_preview_tab: newSelectedPreviewTab } ),
			},
			window.location.pathname
		)
	);
};

export const setFilter = ( filter: AgencyDashboardFilterOption[] ) => () => {
	updateDashboardURLQueryArgs( { filter } );
};

export const updateFilter = ( filter: AgencyDashboardFilterOption[] ) => () => {
	updateDashboardURLQueryArgs( { filter } );
};

export const updateSort = ( sort: DashboardSortInterface ) => () => {
	updateDashboardURLQueryArgs( { sort } );
};

export function setPurchasedLicense( productsInfo?: PurchasedProductsInfo ): AnyAction {
	return { type: JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE, payload: productsInfo };
}

export function selectLicense( siteId: number, license: string ): AnyAction {
	return {
		type: isStreamlinedPurchasesEnabled
			? JETPACK_AGENCY_DASHBOARD_SELECT_SITE_LICENSE
			: JETPACK_AGENCY_DASHBOARD_SELECT_LICENSE,
		siteId: siteId,
		license: license,
	};
}

export function unselectLicense( siteId: number, license: string ): AnyAction {
	return {
		type: isStreamlinedPurchasesEnabled
			? JETPACK_AGENCY_DASHBOARD_UNSELECT_SITE_LICENSE
			: JETPACK_AGENCY_DASHBOARD_UNSELECT_LICENSE,
		siteId: siteId,
		license: license,
	};
}

export function resetSite(): AnyAction {
	return {
		type: isStreamlinedPurchasesEnabled
			? JETPACK_AGENCY_DASHBOARD_RESET_SITE_LICENSES
			: JETPACK_AGENCY_DASHBOARD_RESET_SITE,
	};
}

export function setSiteMonitorStatus( siteId: number, status: 'loading' | 'completed' ): AnyAction {
	return {
		type: JETPACK_AGENCY_DASHBOARD_SITE_MONITOR_STATUS_CHANGE,
		siteId,
		status,
	};
}
