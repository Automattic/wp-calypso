import {
	JETPACK_AGENCY_DASHBOARD_FILTER_SET,
	JETPACK_AGENCY_DASHBOARD_FILTER_UPDATE,
} from 'calypso/state/action-types';
import { AgencyDashboardFilterOption } from './reducer';

export function setFilter( filterOptions: AgencyDashboardFilterOption[] ) {
	return {
		type: JETPACK_AGENCY_DASHBOARD_FILTER_SET,
		filterOptions,
	};
}

export function updateFilter( filterOptions: AgencyDashboardFilterOption[] ) {
	return {
		type: JETPACK_AGENCY_DASHBOARD_FILTER_UPDATE,
		filterOptions,
	};
}
