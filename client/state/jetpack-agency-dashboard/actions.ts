import page from 'page';
import { AnyAction } from 'redux';
import {
	AgencyDashboardFilterOption,
	PurchasedProduct,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { addQueryArgs } from 'calypso/lib/url';
import './init';
import { LICENSE_PURCHASED_VIA_AGENCY_DASHBOARD } from './action-types';

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

export function setPurchasedProduct( product?: PurchasedProduct ): AnyAction {
	return { type: LICENSE_PURCHASED_VIA_AGENCY_DASHBOARD, payload: product };
}
