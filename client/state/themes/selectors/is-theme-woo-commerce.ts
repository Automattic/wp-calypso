import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { IAppState } from 'calypso/state/types';
import { ThemeSoftwareSet } from 'calypso/types';
import 'calypso/state/themes/init';

/**
 * Returns whether a theme is a WooCommerce theme.
 */
export function isThemeWooCommerce( state: IAppState, themeId: string ) {
	const theme = getTheme( state, 'wpcom', themeId );
	const themeSoftwareSetTaxonomy: ThemeSoftwareSet[] | undefined =
		theme?.taxonomies?.theme_software_set;
	return (
		themeSoftwareSetTaxonomy?.some( ( softwareSet ) => softwareSet?.slug === 'woo-on-plans' ) ||
		false
	);
}
