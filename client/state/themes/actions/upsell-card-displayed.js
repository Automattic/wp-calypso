import { UPSELL_CARD_DISPLAYED } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

/**
 * Returns an action that indicates that the upsell card is displayed.
 *
 * @param {boolean} displayed - Card is displayed
 * @returns {Object} the action object
 */
export function upsellCardDisplayed( displayed = false ) {
	return {
		type: UPSELL_CARD_DISPLAYED,
		displayed,
	};
}
