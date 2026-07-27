import { useFeatureConfig } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import type { HelpCenterCTAProps, HelpCenterCTAVariant } from '../components/help-center-cta';

export type HelpCenterCTAPlacement = 'help-center-home' | 'help-center-more-resources';

/**
 * Which variants each slot is able to render. A link-list item is an `<li>` and
 * only belongs inside the More resources list; a banner only fits the standalone
 * slot at the top of the home panel.
 */
const PLACEMENT_VARIANTS: Record< HelpCenterCTAPlacement, HelpCenterCTAVariant[] > = {
	'help-center-home': [ 'banner' ],
	'help-center-more-resources': [ 'link-list-item' ],
};

/**
 * Resolves the contextual CTA the backend picked for this user into renderable
 * props, or null when this slot has nothing to show. Campaign copy, destination,
 * variant, and placement all come from the payload so they can change without a
 * deploy.
 * @param placement The slot asking. Only the CTA the backend placed here renders.
 */
export function useHelpCenterCTA( placement: HelpCenterCTAPlacement ): HelpCenterCTAProps | null {
	const featureConfig = useFeatureConfig();
	const { data, isLoading } = useSupportStatus( featureConfig.contextualCta.enabled );

	const cta = data?.cta;

	if ( ! featureConfig.contextualCta.enabled || isLoading || ! cta ) {
		return null;
	}

	if ( cta.placement !== placement || ! cta.title || ! cta.url ) {
		return null;
	}

	if ( ! PLACEMENT_VARIANTS[ placement ].includes( cta.variant as HelpCenterCTAVariant ) ) {
		return null;
	}

	return {
		variant: cta.variant as HelpCenterCTAVariant,
		ctaId: cta.id,
		placement,
		url: cta.url,
		title: cta.title,
		description: cta.description,
		actionLabel: cta.action_label,
	};
}
