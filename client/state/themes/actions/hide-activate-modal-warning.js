/**
 * Internal dependencies
 */
import { THEME_HIDE_ACTIVATE_MODAL_WARNING } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function hideActivateModalWarning() {
	return {
		type: THEME_HIDE_ACTIVATE_MODAL_WARNING,
	};
}
