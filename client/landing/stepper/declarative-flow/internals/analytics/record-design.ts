import { Design, StyleVariation } from '@automattic/design-picker/src';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getAssemblerSource } from '../steps-repository/pattern-assembler/events';

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
	}
}

export function getDesignTypeProps( design: Design ) {
	return {
		goes_to_assembler_step: design?.design_type === 'assembler',
		assembler_source: getAssemblerSource( design ),
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
	return {
		is_virtual: design.is_virtual,
		slug: design.is_virtual ? design.recipe?.slug : design.slug,
	};
}
