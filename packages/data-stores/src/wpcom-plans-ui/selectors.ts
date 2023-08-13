import { PlanSlug } from '@automattic/calypso-products';
import type { State } from './reducer';

export const isDomainUpsellDialogShown = ( state: State ) => !! state.showDomainUpsellDialog;
export const getStorageAddOnForPlan = ( state: State ) => ( planSlug: PlanSlug ) => {
	const selectedStorageAddOnsForPlans = state?.selectedStorageAddOnsForPlans;
	return selectedStorageAddOnsForPlans ? selectedStorageAddOnsForPlans[ planSlug ] : null;
};
