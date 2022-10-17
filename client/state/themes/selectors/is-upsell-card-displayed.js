import 'calypso/state/themes/init';
import { createSelector } from '@automattic/state-utils';

/**
 * Returns if the Upsell Card is already displayed
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}        The value of the upsellCardDisplayed slice of state
 */
export const isUpsellCardDisplayed = createSelector(
	( state ) => state.themes.upsellCardDisplayed,
	( state ) => state.themes
);
