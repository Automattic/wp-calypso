/**
 * Return WordPress activePromotions getting from state object
 *
 * @param {Object} state - current state object
 * @return {Array} WordPress activePromotions
 */
export const getActivePromotions = state => {
	return state.activePromotions.items;
};

/**
 * Return if promotion is active
 *
 * @param {Object} state - current state object
 * @param {string} name - promotion name
 * @return {bool} Is promotion active?
 */
export const hasActivePromotion = ( state, name ) => {
	return getActivePromotions( state ).indexOf( name ) !== -1;
};

/**
 * Return requesting state
 *
 * @param {Object} state - current state object
 * @return {Boolean} is activePromotions requesting?
 */
export const isRequestingActivePromotions = state => {
	return state.activePromotions.requesting;
};
