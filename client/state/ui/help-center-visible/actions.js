import { HELP_CENTER_VISIBLE } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Change help center visibility.
 *
 * @returns {object} Action object
 */
export const setHelpCenterVisible = ( value ) => {
	return { type: HELP_CENTER_VISIBLE, value };
};
