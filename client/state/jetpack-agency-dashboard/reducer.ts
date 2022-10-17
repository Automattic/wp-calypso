import { JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE } from './action-types';
import type { PurchasedProductsInfo } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface LicensePurchasedAction {
	type: typeof JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE;
	payload: PurchasedProductsInfo | null;
}

type AgencyDashboardReducerAction = LicensePurchasedAction;

export default function agencyDashboardReducer(
	state = { purchasedLicenseInfo: null },
	action: AgencyDashboardReducerAction | null
) {
	switch ( action?.type ) {
		case JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE:
			return { ...state, purchasedLicenseInfo: action.payload };
	}
	return state;
}
