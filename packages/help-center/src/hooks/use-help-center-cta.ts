import { useFeatureConfig } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import type { HelpCenterCTAProps, HelpCenterCTAVariant } from '../components/help-center-cta';

/** Where each variant renders. Reported with the Tracks events. */
const VARIANT_PLACEMENTS: Record< HelpCenterCTAVariant, string > = {
	banner: 'help-center-home',
	'link-list-item': 'help-center-more-resources',
};

/**
 * Resolves the contextual CTA the backend picked for this user into renderable
 * props, or null when this slot has nothing to show. Campaign copy, destination,
 * and variant all come from the payload so they can change without a deploy.
 * @param variant The slot asking. Only the CTA the backend built for it renders.
 */
export function useHelpCenterCTA( variant: HelpCenterCTAVariant ): HelpCenterCTAProps | null {
	const featureConfig = useFeatureConfig();
	const { data, isLoading } = useSupportStatus( featureConfig.contextualCta.enabled );

	const cta = data?.cta;

	if ( ! featureConfig.contextualCta.enabled || isLoading || ! cta ) {
		return null;
	}

	if ( cta.variant !== variant || ! cta.title || ! cta.url ) {
		return null;
	}

	return {
		variant,
		ctaId: cta.id,
		placement: VARIANT_PLACEMENTS[ variant ],
		url: cta.url,
		title: cta.title,
		description: cta.description,
		actionLabel: cta.url_text,
	};
}
