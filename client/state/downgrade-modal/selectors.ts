/**
 * External dependencies
 */
import type { PlanSlug } from '@automattic/calypso-products';
/**
 * Internal dependencies
 */
import type { IAppState } from 'calypso/state/types';

interface DowngradeModalState {
	ui: {
		isOpen?: boolean;
		toPlanSlug?: PlanSlug;
	};
}

/**
 * Returns whether the downgrade modal is open
 * @param {IAppState} state - Global state tree
 * @returns {boolean} Whether the downgrade modal is open
 */
export function isDowngradeModalOpen( state: IAppState ): boolean {
	return Boolean(
		( state as unknown as { downgradeModal?: DowngradeModalState } ).downgradeModal?.ui.isOpen
	);
}

/**
 * Returns the plan slug to downgrade to
 * @param {IAppState} state - Global state tree
 * @returns {PlanSlug|null} The plan slug
 */
export function getDowngradeModalToPlanSlug( state: IAppState ): PlanSlug | null {
	return (
		( state as unknown as { downgradeModal?: DowngradeModalState } ).downgradeModal?.ui
			.toPlanSlug || null
	);
}
