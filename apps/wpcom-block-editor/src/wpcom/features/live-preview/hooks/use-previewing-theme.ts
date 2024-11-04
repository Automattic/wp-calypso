import {
	getPlanBusinessTitle,
	getPlanPersonalTitle,
	getPlanPremiumTitle,
} from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from 'react';
import wpcom from 'calypso/lib/wp';
import useLocation from '../../../hooks/use-location';
import {
	currentlyPreviewingTheme,
	PERSONAL_THEME,
	PREMIUM_THEME,
	WOOCOMMERCE_THEME,
} from '../utils';
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

	return theme?.theme_tier?.slug ?? undefined;
};

/**
 * Get the theme required feature.
 * This only support WooCommerce and Premium themes.
 */
const getThemeFeature = ( theme?: Theme ) => theme?.theme_tier?.feature ?? undefined;

export const usePreviewingThemeSlug = () => {
	const location = useLocation();
	const previewingThemeSlug = useMemo( () => currentlyPreviewingTheme(), [ location?.search ] );
	return previewingThemeSlug;
};

export const usePreviewingTheme = () => {
	const previewingThemeSlug = usePreviewingThemeSlug();
	const { previewingThemeName } = useSelect(
		( select ) => {
			// Avoid calling getTheme with null - fetches all site /themes (10s~)
			if ( ! previewingThemeSlug ) {
				return {
					previewingThemeSlug,
					previewingThemeName: undefined,
				};
			}
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

	let previewingThemePlan;
	switch ( previewingThemeType ) {
		case WOOCOMMERCE_THEME:
			previewingThemePlan = getPlanBusinessTitle();
			break;
		case PREMIUM_THEME:
			previewingThemePlan = getPlanPremiumTitle();
			break;
		case PERSONAL_THEME:
			previewingThemePlan = getPlanPersonalTitle();
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
		plan: previewingThemePlan,
	};
};
