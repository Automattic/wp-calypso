import { Design, StyleVariation } from '@automattic/design-picker';
import { getVariationTitle, getVariationType } from '@automattic/global-styles';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { THEME_TIER_PREMIUM } from 'calypso/components/theme-tier/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { GlobalStylesObject } from '@automattic/global-styles';

export function recordPreviewedDesign( {
	flow,
	intent,
	design,
	styleVariation,
	colorVariation,
	fontVariation,
}: {
	flow: string | null;
	intent: string;
	design: Design;
	styleVariation?: StyleVariation;
	colorVariation?: GlobalStylesObject | null;
	fontVariation?: GlobalStylesObject | null;
} ) {
	recordTracksEvent( 'calypso_signup_design_preview_select', {
		...getDesignEventProps( {
			flow,
			intent,
			design,
			styleVariation,
			colorVariation,
			fontVariation,
		} ),
		...getVirtualDesignProps( design ),
	} );
}

export function recordSelectedDesign( {
	flow,
	intent,
	design,
	styleVariation,
	colorVariation,
	fontVariation,
	optionalProps,
}: {
	flow: string | null;
	intent: string;
	design?: Design;
	styleVariation?: StyleVariation;
	colorVariation?: GlobalStylesObject | null;
	fontVariation?: GlobalStylesObject | null;
	optionalProps?: object;
} ) {
	recordTracksEvent( 'calypso_signup_design_type_submit', {
		flow,
		intent,
		design_type: design?.design_type ?? 'default',
		has_style_variations: ( design?.style_variations || [] ).length > 0,
	} );

	if ( design ) {
		recordTracksEvent( 'calypso_signup_select_design', {
			...getDesignEventProps( {
				flow,
				intent,
				design,
				styleVariation,
				colorVariation,
				fontVariation,
			} ),
			...getVirtualDesignProps( design ),
			...optionalProps,
		} );
	}
}

export function getDesignEventProps( {
	flow,
	intent,
	design,
	styleVariation,
	colorVariation,
	fontVariation,
}: {
	flow: string | null;
	intent: string;
	design: Design;
	styleVariation?: StyleVariation;
	colorVariation?: GlobalStylesObject | null;
	fontVariation?: GlobalStylesObject | null;
} ) {
	const is_style_variation = styleVariation && styleVariation.slug !== 'default';
	const variationSlugSuffix = is_style_variation ? `-${ styleVariation?.slug }` : '';

	return {
		flow,
		intent,
		device: resolveDeviceTypeByViewPort(),
		slug: design.slug + variationSlugSuffix,
		theme: design.recipe?.stylesheet,
		theme_style: design.recipe?.stylesheet + variationSlugSuffix,
		design_type: design.design_type,
		...( design?.design_tier && { design_tier: design.design_tier } ),
		is_premium: design?.design_tier === THEME_TIER_PREMIUM,
		is_externally_managed: design?.is_externally_managed,
		is_bundled_with_woo: design?.is_bundled_with_woo,
		has_style_variations: ( design.style_variations || [] ).length > 0,
		is_style_variation: is_style_variation,
		...( colorVariation && {
			color_variation_title: getVariationTitle( colorVariation ),
			color_variation_type: getVariationType( colorVariation ),
		} ),
		...( fontVariation && {
			font_variation_title: getVariationTitle( fontVariation ),
			font_variation_type: getVariationType( fontVariation ),
		} ),
	};
}

export function getVirtualDesignProps( design: Design ) {
	return {
		is_virtual: design.is_virtual,
		slug: design.is_virtual ? design.recipe?.slug : design.slug,
	};
}
