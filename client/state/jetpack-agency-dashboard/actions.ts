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
}: {
	filter?: AgencyDashboardFilterOption[];
	sort?: DashboardSortInterface;
	search?: string;
} ) => {
	const params = new URLSearchParams( window.location.search );

	const searchQuery = search !== undefined ? search : params.get( 's' );
	const filterOptions = filter
		? filter
		: ( params.getAll( 'issue_types' ) as AgencyDashboardFilterOption[] );
	const sortField = sort ? sort.field : params.get( 'sort_field' );
	const sortDirection = sort ? sort.direction : params.get( 'sort_direction' );
	const currentTour = params.get( 'tour' );

	page.replace(
		addQueryArgs(
			{
				...( searchQuery && { s: searchQuery } ),
				...filterStateToQuery( filterOptions ),
				...( sortField && { sort_field: sortField } ),
				...( sortDirection && { sort_direction: sortDirection } ),
				...( currentTour && { tour: currentTour } ),
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

export const updateSort = ( sort?: DashboardSortInterface ) => () => {
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
