import { THEME_START_ACTIVATION_SYNC } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function themeStartActivationSync( siteId: number, themeId: string ) {
	return {
		type: THEME_START_ACTIVATION_SYNC,
		siteId,
		themeId,
	};
}
