import { LICENSE_PURCHASED_VIA_AGENCY_DASHBOARD } from './action-types';
import type { PurchasedProduct } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface LicensePurchasedAction {
	type: typeof LICENSE_PURCHASED_VIA_AGENCY_DASHBOARD;
	payload: PurchasedProduct | null;
}

type AgencyDashboardReducerAction = LicensePurchasedAction;

export default function agencyDashboardReducer(
	state = { purchasedLicense: null },
	action: AgencyDashboardReducerAction | null
) {
	switch ( action?.type ) {
		case LICENSE_PURCHASED_VIA_AGENCY_DASHBOARD:
			return { ...state, purchasedLicense: action.payload };
	}
	return state;
}
