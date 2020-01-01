/**
 * Return WordPress activePromotions getting from state object
 *
 * @param {object} state - current state object
 * @return {Array} WordPress activePromotions
 */
export const getActivePromotions = state => {
	return state.activePromotions.items;
};

/**
 * Return if promotion is active
 *
 * @param {object} state - current state object
 * @param {string} name - promotion name
 * @return {bool} Is promotion active?
 */
export const hasActivePromotion = ( state, name ) => {
	return getActivePromotions( state ).indexOf( name ) !== -1;
};

/**
 * Return requesting state
 *
 * @param {object} state - current state object
 * @return {boolean} is activePromotions requesting?
 */
export const isRequestingActivePromotions = state => {
	return state.activePromotions.requesting;
};
