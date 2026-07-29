import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { Banner, LinkListItem } from './help-center-cta-variants';
import './help-center-cta.scss';
import type { HelpCenterCTAVariantProps } from './help-center-cta-variants';

interface HelpCenterCTAVariantDefinition {
	/** Where this variant renders. Reported with the Tracks events. */
	placement: string;
	Component: React.FC< HelpCenterCTAVariantProps >;
}

/**
 * Every variant the backend can ask for. A new one is a new entry here plus a
 * component in `help-center-cta-variants.tsx` — nothing else knows the list.
 */
export const HELP_CENTER_CTA_VARIANTS = {
	banner: { placement: 'help-center-home', Component: Banner },
	'link-list-item': { placement: 'help-center-more-resources', Component: LinkListItem },
} as const satisfies Record< string, HelpCenterCTAVariantDefinition >;

export type HelpCenterCTAVariant = keyof typeof HELP_CENTER_CTA_VARIANTS;

export interface HelpCenterCTAProps extends Omit< HelpCenterCTAVariantProps, 'onClick' > {
	variant: HelpCenterCTAVariant;
	ctaId: string;
}

// Module-level so it survives remounts (e.g. search filtering the More
// resources list) and only resets on a full page load, per cta_id.
const reportedCtaIds = new Set< string >();

function useCTATracking(
	eventProps: { cta_id: string; variant: string; placement: string } | null
) {
	useEffect( () => {
		if ( ! eventProps || reportedCtaIds.has( eventProps.cta_id ) ) {
			return;
		}
		reportedCtaIds.add( eventProps.cta_id );
		recordTracksEvent( 'calypso_helpcenter_cta_impression', eventProps );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ eventProps?.cta_id ] );

	return () => {
		if ( eventProps ) {
			recordTracksEvent( 'calypso_helpcenter_cta_click', eventProps );
		}
	};
}

export const HelpCenterCTA: React.FC< HelpCenterCTAProps > = ( { variant, ctaId, ...content } ) => {
	const variantDefinition = HELP_CENTER_CTA_VARIANTS[ variant ];
	const trackClick = useCTATracking(
		variantDefinition ? { cta_id: ctaId, variant, placement: variantDefinition.placement } : null
	);

	if ( ! variantDefinition ) {
		return null;
	}

	const { Component } = variantDefinition;
	return <Component { ...content } onClick={ trackClick } />;
};
