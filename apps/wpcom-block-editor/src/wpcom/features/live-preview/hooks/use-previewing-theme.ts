import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { currentlyPreviewingTheme, PREMIUM_THEME, WOOCOMMERCE_THEME } from '../utils';
import type { Theme } from 'calypso/types';

/**
 * Get the theme type.
 * This only support WooCommerce and Premium themes.
 */
const getThemeType = ( theme?: Theme ) => {
	const theme_software_set = theme?.taxonomies?.theme_software_set;
	const isWooCommerceTheme = theme_software_set && theme_software_set.length > 0;
	if ( isWooCommerceTheme ) {
		return WOOCOMMERCE_THEME;
	}
	const themeStylesheet = theme?.stylesheet;
	const isPremiumTheme = themeStylesheet && themeStylesheet.startsWith( 'premium/' );
	if ( isPremiumTheme ) {
		return PREMIUM_THEME;
	}
	return undefined;
};

export const usePreviewingTheme = () => {
	const previewingThemeSlug = currentlyPreviewingTheme();
	const previewingThemeId =
		( previewingThemeSlug as string )?.split( '/' )?.[ 1 ] || previewingThemeSlug;
	const [ previewingThemeName, setPreviewingThemeName ] = useState< string >(
		previewingThemeSlug as string
	);
	const [ previewingThemeType, setPreviewingThemeType ] = useState< string >();

	useEffect( () => {
		wpcom.req
			.get( `/themes/${ previewingThemeId }`, { apiVersion: '1.2' } )
			.then( ( theme: Theme ) => {
				const name = theme?.name;
				if ( name ) {
					setPreviewingThemeName( name );
				}
				return theme;
			} )
			.then( ( theme: Theme ) => {
				const type = getThemeType( theme );
				if ( ! type ) {
					return;
				}
				setPreviewingThemeType( type );
			} )
			.catch( () => {
				// do nothing
			} );
		return;
	}, [ previewingThemeId ] );

	return {
		name: previewingThemeName,
		type: previewingThemeType,
	};
};
