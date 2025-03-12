/**
 * Internal dependencies
 */
import { DOWNGRADE_MODAL_OPEN, DOWNGRADE_MODAL_CLOSE } from 'calypso/state/action-types';
import type { PlanSlug } from '@automattic/calypso-products';

/**
 * Opens the downgrade modal with the target plan slug to downgrade to
 * @param {PlanSlug} toPlanSlug - The plan slug to downgrade to
 * @returns {Object} Action object
 */
export function openDowngradeModal( toPlanSlug: PlanSlug ) {
	return {
		type: DOWNGRADE_MODAL_OPEN,
		toPlanSlug,
	};
}

/**
 * Closes the downgrade modal
 * @returns {Object} Action object
 */
export function closeDowngradeModal() {
	return {
		type: DOWNGRADE_MODAL_CLOSE,
	};
}
