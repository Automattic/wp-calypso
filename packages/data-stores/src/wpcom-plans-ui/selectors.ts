import type { State } from './reducer';

export const isDomainUpsellDialogShown = ( state: State ) => !! state.showDomainUpsellDialog;
export const getStorageAddOnForPlan = ( state: State ) => ( plan: string ) => {
	const selectedStorageAddOnsForPlans = state?.selectedStorageAddOnsForPlans;
	return selectedStorageAddOnsForPlans ? selectedStorageAddOnsForPlans[ plan ] : null;
};
