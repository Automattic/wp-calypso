import config from '@automattic/calypso-config';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from 'react';
import wpcom from 'calypso/lib/wp';
import {
	currentlyPreviewingTheme,
	PERSONAL_THEME,
	PREMIUM_THEME,
	WOOCOMMERCE_THEME,
} from '../utils';
import useLocation from './use-location';
import type { Theme } from 'calypso/types';

/**
 * Get the theme type.
 * This only supports WooCommerce, Premium, and Personal themes.
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

	// @TODO Replace all the logic above with the following code once Theme Tiers is live.
	if ( config.isEnabled( 'themes/tiers' ) ) {
		return theme?.theme_tier?.slug ?? undefined;
	}

	return undefined;
};

/**
 * Get the theme required feature.
 * This only support WooCommerce and Premium themes.
 */
const getThemeFeature = ( theme?: Theme ) => {
	// @TODO Once theme tiers is live we'll need to refactor use-can-preview-but-need-upgrade's checkNeedUpgrade function.
	if ( config.isEnabled( 'themes/tiers' ) ) {
		return theme?.theme_tier?.feature ?? undefined;
	}

	return undefined;
};

export const usePreviewingThemeSlug = () => {
	const location = useLocation();
	const previewingThemeSlug = useMemo( () => currentlyPreviewingTheme(), [ location?.search ] );
	return previewingThemeSlug;
};

export const usePreviewingTheme = () => {
	const previewingThemeSlug = usePreviewingThemeSlug();
	const { previewingThemeName } = useSelect(
		( select ) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const previewingTheme = ( select( 'core' ) as any ).getTheme( previewingThemeSlug );

			return {
				previewingThemeSlug,
				previewingThemeName: previewingTheme?.name?.rendered || previewingThemeSlug,
			};
		},
		[ previewingThemeSlug ]
	);

	const previewingThemeId =
		( previewingThemeSlug as string )?.split( '/' )?.[ 1 ] || previewingThemeSlug;

	const [ previewingThemeFeature, setPreviewingThemeFeature ] =
		useState< ReturnType< typeof getThemeFeature > >( undefined );

	const [ previewingThemeType, setPreviewingThemeType ] =
		useState< ReturnType< typeof getThemeType > >( undefined );

	// @TODO Find a better solution once we have Theme Tiers live. we could use the theme_tier slug or feature slug instead for simplicity.
	let previewingThemeTypeDisplay;
	switch ( previewingThemeType ) {
		case WOOCOMMERCE_THEME:
			previewingThemeTypeDisplay = 'WooCommerce';
			break;
		case PREMIUM_THEME:
			previewingThemeTypeDisplay = 'Premium';
			break;
		case PERSONAL_THEME:
			previewingThemeTypeDisplay = 'Personal';
			break;
	}

	useEffect( () => {
		if ( previewingThemeId ) {
			// This call only works on Simple sites.
			// On Atomic or self-hosted sites, we won't ever need the theme type,
			// so it is expected that this call fails on such sites.
			wpcom.req
				.get( `/themes/${ previewingThemeId }`, { apiVersion: '1.2' } )
				.then( ( theme: Theme ) => {
					setPreviewingThemeType( getThemeType( theme ) );
					setPreviewingThemeFeature( getThemeFeature( theme ) );
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
		requiredFeature: previewingThemeFeature,
		typeDisplay: previewingThemeTypeDisplay,
	};
};
