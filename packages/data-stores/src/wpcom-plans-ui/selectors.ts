import { PlanSlug } from '@automattic/calypso-products';
import type { State } from './reducer';

export const isDomainUpsellDialogShown = ( state: State ) => !! state.showDomainUpsellDialog;

export const getSelectedStorageOptionForPlan = (
	state: State,
	planSlug: PlanSlug,
	siteId?: number | null
) => {
	// @ts-expect-error TS is unhappy if we index an object by a null or an undefined value. We, however,
	// expect siteId to be null or undefined here before site creation ( Ex. during onboarding ).
	return state.selectedStorageOptionForPlan?.[ siteId ]?.[ planSlug ];
};

export const getSelectedStorageOptions = ( state: State, siteId?: number | null ) => {
	// @ts-expect-error TS is unhappy if we index an object by a null or an undefined value. We, however,
	// expect siteId to be null or undefined here before site creation ( Ex. during onboarding ).
	return state.selectedStorageOptionForPlan?.[ siteId ];
};
