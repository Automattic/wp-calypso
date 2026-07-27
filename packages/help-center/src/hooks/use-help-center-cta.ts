import { useFeatureConfig } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import type { HelpCenterCTAProps, HelpCenterCTAVariant } from '../components/help-center-cta';

const VARIANTS: HelpCenterCTAVariant[] = [ 'banner', 'link-list-item' ];

// Reported with the Tracks events. Moves to the payload once the backend can
// place CTAs on more than the home panel.
const PLACEMENT = 'help-center-home';

/**
 * Resolves the contextual CTA the backend picked for this user into renderable
 * props, or null when there is nothing to show. Campaign copy, destination, and
 * variant all come from the payload so they can change without a deploy.
 */
export function useHelpCenterCTA(): HelpCenterCTAProps | null {
	const featureConfig = useFeatureConfig();
	const { data, isLoading } = useSupportStatus( featureConfig.home.contextualCta );

	const cta = data?.cta;

	if ( ! featureConfig.home.contextualCta || isLoading || ! cta ) {
		return null;
	}

	if ( ! cta.title || ! cta.url || ! VARIANTS.includes( cta.variant as HelpCenterCTAVariant ) ) {
		return null;
	}

	return {
		variant: cta.variant as HelpCenterCTAVariant,
		ctaId: cta.id,
		placement: PLACEMENT,
		url: cta.url,
		title: cta.title,
		description: cta.description,
		actionLabel: cta.action_label,
	};
}
