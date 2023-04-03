import { Design, StyleVariation } from '@automattic/design-picker/src';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export function recordPreviewedDesign( {
	flow,
	intent,
	design,
	styleVariation,
}: {
	flow: string | null;
	intent: string;
	design: Design;
	styleVariation?: StyleVariation;
} ) {
	recordTracksEvent( 'calypso_signup_design_preview_select', {
		...getDesignEventProps( { flow, intent, design, styleVariation } ),
		...getDesignTypeProps( design ),
		...getVirtualDesignProps( design ),
	} );
}

export function recordSelectedDesign( {
	flow,
	intent,
	design,
	styleVariation,
	optionalProps,
}: {
	flow: string | null;
	intent: string;
	design?: Design;
	styleVariation?: StyleVariation;
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
			...getDesignEventProps( { flow, intent, design, styleVariation } ),
			...getDesignTypeProps( design ),
			...getVirtualDesignProps( design ),
			...optionalProps,
		} );

		if ( design.verticalizable ) {
			recordTracksEvent(
				'calypso_signup_select_verticalized_design',
				getDesignEventProps( { flow, intent, design, styleVariation } )
			);
		}
	}
}

export function getDesignTypeProps( design?: Design ) {
	return {
		goes_to_assembler_step: design?.design_type === 'assembler',
	};
}

export function getDesignEventProps( {
	flow,
	intent,
	design,
	styleVariation,
}: {
	flow: string | null;
	intent: string;
	design: Design;
	styleVariation?: StyleVariation;
} ) {
	const is_style_variation = styleVariation && styleVariation.slug !== 'default';
	const variationSlugSuffix = is_style_variation ? `-${ styleVariation.slug }` : '';

	return {
		flow,
		intent,
		device: resolveDeviceTypeByViewPort(),
		slug: design.slug + variationSlugSuffix,
		theme: design.recipe?.stylesheet,
		theme_style: design.recipe?.stylesheet + variationSlugSuffix,
		design_type: design.design_type,
		is_premium: design.is_premium,
		has_style_variations: ( design.style_variations || [] ).length > 0,
		is_style_variation: is_style_variation,
	};
}

export function getVirtualDesignProps( design: Design ) {
	/**
	 * If the design is virtual, and it has a recipe with pattern_ids,
	 * then we assume that it's a pattern based virtual theme.
	 */
	const virtual_theme_pattern = design.is_virtual ? design.recipe?.pattern_ids?.[ 0 ] : null;

	return {
		is_virtual: design.is_virtual,
		virtual_theme_pattern,
	};
}
