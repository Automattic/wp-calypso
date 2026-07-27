import { useFeatureConfig } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import type { HelpCenterCTAProps, HelpCenterCTAVariant } from '../components/help-center-cta';

export const HELP_CENTER_CTA_HOME_PLACEMENT = 'help-center-home';

const VARIANTS: HelpCenterCTAVariant[] = [ 'banner', 'link-list-item' ];

/**
 * Resolves the contextual CTA the backend picked for this user into renderable
 * props, or null when there is nothing to show. Campaign copy, destination, and
 * variant all come from the payload so they can change without a deploy.
 * @param placement Where the CTA renders; reported with the Tracks events.
 */
export function useHelpCenterCTA( placement: string ): HelpCenterCTAProps | null {
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
		placement,
		url: cta.url,
		title: cta.title,
		description: cta.description,
		actionLabel: cta.action_label,
	};
}
