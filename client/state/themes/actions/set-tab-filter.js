import { THEME_TAB_FILTER_SET } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

// Set the tab filter on theme sheet
export function setTabFilter( tabFilter ) {
	return {
		type: THEME_TAB_FILTER_SET,
		tabFilter,
	};
}
