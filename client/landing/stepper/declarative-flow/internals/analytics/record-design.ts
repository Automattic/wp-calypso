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
		...getVirtualDesignProps( design, styleVariation ),
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
	const variationSlugSuffix =
		styleVariation && styleVariation.slug !== 'default' ? `-${ styleVariation.slug }` : '';

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
	};
}

export function getVirtualDesignProps( design: Design, styleVariation?: StyleVariation ) {
	let variationSlugSuffix = '';
	if ( styleVariation && styleVariation.slug !== 'default' ) {
		variationSlugSuffix = `-${ styleVariation.slug }`;
	} else if ( ! styleVariation && design.preselected_style_variation ) {
		variationSlugSuffix = `-${ design.preselected_style_variation.slug }`;
	}

	return {
		slug: design.slug + variationSlugSuffix,
		is_virtual: design.is_virtual,
	};
}
