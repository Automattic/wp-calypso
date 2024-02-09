import { PlanSlug } from '@automattic/calypso-products';
import type { State } from './reducer';

export const isDomainUpsellDialogShown = ( state: State ) => !! state.showDomainUpsellDialog;
export const getSelectedStorageOptionForPlan = (
	state: State,
	planSlug: PlanSlug,
	siteId: number
) => state.selectedStorageOptionForPlans?.[ siteId ]?.[ planSlug ];
export const getSelectedStorageOptions = ( state: State ) => state.selectedStorageOptionForPlans;
