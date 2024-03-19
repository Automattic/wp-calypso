import { PlanSlug } from '@automattic/calypso-products';
import type { State } from './reducer';

export const isDomainUpsellDialogShown = ( state: State ) => !! state.showDomainUpsellDialog;
export const getSelectedStorageOptionForPlan = (
	state: State,
	planSlug: PlanSlug,
	siteId?: number | null
) => ( siteId ? state.selectedStorageOptionForPlans?.[ siteId ]?.[ planSlug ] : null );
export const getSelectedStorageOptions = ( state: State, siteId?: number | null ) =>
	siteId ? state.selectedStorageOptionForPlans?.[ siteId ] : null;
