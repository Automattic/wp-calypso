import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';
import { isCurrentUserCurrentPlanOwner } from './is-current-user-current-plan-owner';

/**
 * Check if a given plan is currently purchasable
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @param {number} planName - The name of the plan being considered
 * @returns {boolean} true if purchasable, false if not
 */
export default function isPlanAvailableForPurchase(
	state: AppState,
	siteId: number,
	planName: string
): boolean {
	const isPaid = isCurrentPlanPaid( state, siteId );
	const canPurchase = ! isPaid || isCurrentUserCurrentPlanOwner( state, siteId );
	const availableForPurchase = canUpgradeToPlan( state, siteId, planName ) && canPurchase;
	return availableForPurchase;
}
