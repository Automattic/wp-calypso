import { useSelect } from '@wordpress/data';
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
	const previewingThemeSlug = useSelect( ( select ) => {
		// Subscribe to the core store, so that we can recompute `previewingThemeSlug` when the active theme changes.
		// This is a workaround because we're not listening to the changes to the `wp_theme_preview` param in the URL.
		select( 'core' );
		return currentlyPreviewingTheme();
	}, [] );
	const [ previewingTheme, setPreviewingTheme ] = useState< Theme | undefined >( undefined );

	const previewingThemeName = previewingTheme?.name || previewingThemeSlug;
	const previewingThemeType = previewingTheme ? getThemeType( previewingTheme ) : undefined;
	const previewingThemeTypeDisplay =
		previewingThemeType === WOOCOMMERCE_THEME ? 'WooCommerce' : 'Premium';

	useEffect( () => {
		const previewingThemeId =
			( previewingThemeSlug as string )?.split( '/' )?.[ 1 ] || previewingThemeSlug;

		if ( previewingThemeId ) {
			wpcom.req
				.get( `/themes/${ previewingThemeId }`, { apiVersion: '1.2' } )
				.then( ( theme: Theme ) => {
					setPreviewingTheme( theme );
				} )
				.catch( () => {
					// do nothing
				} );
		} else {
			setPreviewingTheme( undefined );
		}
		return;
	}, [ previewingThemeSlug ] );

	return {
		name: previewingThemeName,
		type: previewingThemeType,
		typeDisplay: previewingThemeTypeDisplay,
	};
};
