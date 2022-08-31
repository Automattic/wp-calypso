import { isEnabled } from '@automattic/calypso-config';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

export function getThemeSoftwareSets( state, themeId ) {
	if ( ! isEnabled( 'themes/plugin-bundling' ) ) {
		return [];
	}
	const theme = getTheme( state, 'wpcom', themeId );
	const theme_software_set = theme?.taxonomies?.theme_software_set;
	return theme_software_set || [];
}
