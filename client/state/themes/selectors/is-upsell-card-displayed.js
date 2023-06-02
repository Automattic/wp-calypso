import 'calypso/state/themes/init';

/**
 * Returns if the Upsell Card is already displayed
 *
 * @param  {Object}  state  Global state tree
 * @returns {boolean}        The value of the upsellCardDisplayed slice of state
 */
export function isUpsellCardDisplayed( state ) {
	return state.themes.upsellCardDisplayed;
}
