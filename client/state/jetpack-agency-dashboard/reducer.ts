import { JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE } from './action-types';
import type { PurchasedProduct } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface LicensePurchasedAction {
	type: typeof JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE;
	payload: PurchasedProduct | null;
}

type AgencyDashboardReducerAction = LicensePurchasedAction;

export default function agencyDashboardReducer(
	state = { purchasedLicense: null },
	action: AgencyDashboardReducerAction | null
) {
	switch ( action?.type ) {
		case JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE:
			return { ...state, purchasedLicense: action.payload };
	}
	return state;
}
