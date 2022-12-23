import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { SiteIntent } from 'calypso/../packages/data-stores/src/onboard';
import { Design, StyleVariation } from 'calypso/../packages/design-picker/src';
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
		goes_to_assembler_step: intent === SiteIntent.SiteAssembler,
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
			...getDesignIntentProps( intent ),
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

export function getDesignIntentProps( intent: string ) {
	return {
		goes_to_assembler_step: intent === SiteIntent.SiteAssembler,
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
