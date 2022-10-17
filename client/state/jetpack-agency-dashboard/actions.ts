import page from 'page';
import { AnyAction } from 'redux';
import {
	AgencyDashboardFilterOption,
	PurchasedProductsInfo,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { addQueryArgs } from 'calypso/lib/url';
import './init';
import { JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE } from './action-types';

const filterStateToQuery = ( filterOptions: AgencyDashboardFilterOption[] ) => {
	if ( ! filterOptions.length ) {
		return {};
	}
	return { issue_types: filterOptions.join( ',' ) };
};

function navigateToFilter( filterOptions: AgencyDashboardFilterOption[] ) {
	const params = new URLSearchParams( window.location.search );
	const search = params.get( 's' ) ? `?s=${ params.get( 's' ) }` : '';
	page( addQueryArgs( filterStateToQuery( filterOptions ), window.location.pathname + search ) );
}

export const setFilter = ( filterOptions: AgencyDashboardFilterOption[] ) => () => {
	navigateToFilter( filterOptions );
};

export const updateFilter = ( filterOptions: AgencyDashboardFilterOption[] ) => () => {
	navigateToFilter( filterOptions );
};

export function setPurchasedLicense( productsInfo?: PurchasedProductsInfo ): AnyAction {
	return { type: JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE, payload: productsInfo };
}
