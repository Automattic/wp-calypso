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
	const { previewingThemeSlug, previewingThemeName } = useSelect( ( select ) => {
		// This needs to be inside `useSelect`, so that we can recompute `previewingThemeSlug` when the active theme changes.
		// This is a workaround because we're not listening to the changes to the `wp_theme_preview` param in the URL.
		const previewingThemeSlug = currentlyPreviewingTheme();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const previewingTheme = ( select( 'core' ) as any ).getTheme( previewingThemeSlug );

		return {
			previewingThemeSlug,
			previewingThemeName: previewingTheme?.name?.rendered || previewingThemeSlug,
		};
	}, [] );

	const previewingThemeId =
		( previewingThemeSlug as string )?.split( '/' )?.[ 1 ] || previewingThemeSlug;

	const [ previewingThemeType, setPreviewingThemeType ] =
		useState< ReturnType< typeof getThemeType > >( undefined );

	const previewingThemeTypeDisplay =
		previewingThemeType === WOOCOMMERCE_THEME ? 'WooCommerce' : 'Premium';

	useEffect( () => {
		if ( previewingThemeId ) {
			// This call only works on Simple sites.
			// On Atomic or self-hosted sites, we won't ever need the theme type,
			// so it is expected that this call fails on such sites.
			wpcom.req
				.get( `/themes/${ previewingThemeId }`, { apiVersion: '1.2' } )
				.then( ( theme: Theme ) => {
					setPreviewingThemeType( getThemeType( theme ) );
				} )
				.catch( () => {
					// do nothing
				} );
		} else {
			setPreviewingThemeType( undefined );
		}
		return;
	}, [ previewingThemeId ] );

	return {
		id: previewingThemeId,
		name: previewingThemeName,
		type: previewingThemeType,
		typeDisplay: previewingThemeTypeDisplay,
	};
};
