import {
	JETPACK_AGENCY_DASHBOARD_FILTER_SET,
	JETPACK_AGENCY_DASHBOARD_FILTER_UPDATE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { Reducer, Action } from 'redux';

type AgencyDashboardFilterActionTypes =
	| typeof JETPACK_AGENCY_DASHBOARD_FILTER_SET
	| typeof JETPACK_AGENCY_DASHBOARD_FILTER_UPDATE;

export type AgencyDashboardFilterOption = 'backup_failed' | 'backup_warning' | 'threats_found';

export interface AgencyDashboardFilter {
	group: AgencyDashboardFilterOption[];
}

interface AgencyDashboardFilterAction extends Action< AgencyDashboardFilterActionTypes > {
	type: AgencyDashboardFilterActionTypes;
	filterOptions?: AgencyDashboardFilterOption[];
}

const filter: Reducer< AgencyDashboardFilter, AgencyDashboardFilterAction > = (
	state: AgencyDashboardFilter = { group: [] },
	{ type, filterOptions }: AgencyDashboardFilterAction
) => {
	switch ( type ) {
		case JETPACK_AGENCY_DASHBOARD_FILTER_SET:
		case JETPACK_AGENCY_DASHBOARD_FILTER_UPDATE:
			return { group: filterOptions ?? [] };
		default:
			return state;
	}
};

export default combineReducers( { filter } );
