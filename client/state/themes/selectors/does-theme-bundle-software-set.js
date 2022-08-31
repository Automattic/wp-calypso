import { isEnabled } from '@automattic/calypso-config';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

export function doesThemeBundleSoftwareSet( state, themeId ) {
	const theme = getTheme( state, 'wpcom', themeId );
	const theme_software_set = theme?.taxonomies?.theme_software_set;
	return (
		isEnabled( 'themes/plugin-bundling' ) && theme_software_set && theme_software_set.length > 0
	);
}
