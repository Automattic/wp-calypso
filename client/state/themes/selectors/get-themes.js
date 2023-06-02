import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

export function getThemes( state, siteId, themeIds ) {
	return themeIds.map( ( themeId ) => getTheme( state, siteId, themeId ) );
}
