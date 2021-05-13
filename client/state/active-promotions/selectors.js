/**
 * Internal dependencies
 */
import 'calypso/state/active-promotions/init';

/**
 * Return WordPress activePromotions getting from state object
 *
 * @param {object} state - current state object
 * @returns {Array} WordPress activePromotions
 */
export function getActivePromotions( state ) {
	return state.activePromotions.items;
}

/**
 * Return if promotion is active
 *
 * @param {object} state - current state object
 * @param {string} name - promotion name
 * @returns {boolean} Is promotion active?
 */
export function hasActivePromotion( state, name ) {
	return getActivePromotions( state ).indexOf( name ) !== -1;
}

/**
 * Return requesting state
 *
 * @param {object} state - current state object
 * @returns {boolean} is activePromotions requesting?
 */
export function isRequestingActivePromotions( state ) {
	return state.activePromotions.requesting;
}
