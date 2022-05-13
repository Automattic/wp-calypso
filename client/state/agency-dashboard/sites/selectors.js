import 'calypso/state/agency-dashboard/init';

export function hasFetchedSites( state ) {
	return state.agencyDashboard.sites.hasFetched;
}

export function isFetchingSites( state ) {
	return state.agencyDashboard.sites.isFetching;
}

export function getCurrentSites( state ) {
	return state.agencyDashboard.sites.current;
}

export function getSitesRequestError( state ) {
	return state.agencyDashboard.sites.error;
}
