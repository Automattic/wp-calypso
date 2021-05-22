/**
 * Internal dependencies
 */
import { THEME_ACCEPT_ACTIVATE_MODAL_WARNING } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function acceptActivateModalWarning( themeId ) {
	return {
		type: THEME_ACCEPT_ACTIVATE_MODAL_WARNING,
		themeId,
	};
}
