import { isAIBuilderOnboardingFlow } from '@automattic/onboarding';

/**
 * Copy override for the free-subdomain skip card, per flow.
 *
 * The AI Website Builder onboarding flow requires a paid plan, so skipping the
 * domain doesn't start a free site — drop the "start free" framing. Every other
 * flow keeps the default copy (returns `undefined`).
 */
export const getSkipSuggestionCopy = (
	flow: string | null,
	__: ( text: string ) => string
): { title: string; buttonText: string } | undefined => {
	if ( ! isAIBuilderOnboardingFlow( flow ) ) {
		return undefined;
	}

	return {
		// translators: %(domain)s is the free WordPress.com subdomain
		title: __( 'Start with %(domain)s' ),
		buttonText: __( 'Choose a domain later' ),
	};
};
