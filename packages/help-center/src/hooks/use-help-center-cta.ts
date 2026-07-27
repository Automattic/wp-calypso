import { __ } from '@wordpress/i18n';
import { useFeatureConfig } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import type { HelpCenterCTAProps, HelpCenterCTAVariant } from '../components/help-center-cta';

export const HELP_CENTER_CTA_HOME_PLACEMENT = 'help-center-home';

const VARIANTS: HelpCenterCTAVariant[] = [ 'banner', 'link-list-item' ];

/**
 * Copy stays client-side so it can be translated and A/B tested; the backend
 * only decides who sees a campaign and where it points. Unknown campaign ids
 * render nothing.
 */
const CAMPAIGN_COPY: Record< string, () => Pick< HelpCenterCTAProps, 'title' | 'description' > > = {
	'onboarding-call-v1': () => ( {
		title: __( 'Book Your Free Onboarding Call', __i18n_text_domain__ ),
	} ),
};

/**
 * Resolves the contextual CTA the backend picked for this user into renderable
 * props, or null when there is nothing to show.
 * @param placement Where the CTA renders; reported with the Tracks events.
 */
export function useHelpCenterCTA( placement: string ): HelpCenterCTAProps | null {
	const featureConfig = useFeatureConfig();
	const { data, isLoading } = useSupportStatus( featureConfig.home.contextualCta );

	const cta = data?.cta;

	if ( ! featureConfig.home.contextualCta || isLoading || ! cta ) {
		return null;
	}

	const copy = CAMPAIGN_COPY[ cta.id ];

	if ( ! copy || ! VARIANTS.includes( cta.variant as HelpCenterCTAVariant ) ) {
		return null;
	}

	return {
		...copy(),
		variant: cta.variant as HelpCenterCTAVariant,
		ctaId: cta.id,
		placement,
		url: cta.url,
	};
}
