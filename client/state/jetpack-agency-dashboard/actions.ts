import page from 'page';
import { AgencyDashboardFilterOption } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { addQueryArgs } from 'calypso/lib/url';

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
