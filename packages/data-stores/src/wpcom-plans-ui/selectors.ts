import { PlanSlug } from '@automattic/calypso-products';
import type { State } from './reducer';

export const isDomainUpsellDialogShown = ( state: State ) => !! state.showDomainUpsellDialog;
export const getSelectedStorageOptionsForPlan = ( state: State, planSlug: PlanSlug ) =>
	state.selectedStorageOptionForPlans?.[ planSlug ];
