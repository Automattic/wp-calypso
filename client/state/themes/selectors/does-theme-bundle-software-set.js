import { isEnabled } from '@automattic/calypso-config';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

export function doesThemeBundleSoftwareSet( state, themeId ) {
	const theme = getTheme( state, 'wpcom', themeId );
	const theme_plugin = theme?.taxonomies?.theme_plugin;
	return isEnabled( 'themes/plugin-bundling' ) && theme_plugin && theme_plugin.length > 0;
}
