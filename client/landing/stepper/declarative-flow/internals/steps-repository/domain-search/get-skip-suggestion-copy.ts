import { isAIBuilderOnboardingFlow } from '@automattic/onboarding';

/**
 * Copy for the free-subdomain skip card ("Start free with %(domain)s" / "Start Free").
 *
 * Two sources, in order of precedence:
 *   1. Per-flow `overrides` — supplied by a flow via the domain-search step's
 *      `freeSubdomainTitle` / `freeSubdomainButtonLabel` accepts-props (already
 *      translated). A `title` may contain the `%(domain)s` placeholder, which the
 *      package interpolates with the free subdomain.
 *   2. The AI Website Builder onboarding default — that flow requires a paid plan,
 *      so skipping the domain doesn't start a free site; it drops the "start free"
 *      framing.
 *
 * Returns `undefined` when neither applies, so the package renders its own defaults.
 */
export const getSkipSuggestionCopy = (
	flow: string | null,
	__: ( text: string ) => string,
	overrides?: { title?: string; buttonText?: string }
): { title?: string; buttonText?: string } | undefined => {
	const flowCopy = isAIBuilderOnboardingFlow( flow )
		? {
				// translators: %(domain)s is the free WordPress.com subdomain
				title: __( 'Start with %(domain)s' ),
				buttonText: __( 'Choose a domain later' ),
		  }
		: undefined;

	const title = overrides?.title ?? flowCopy?.title;
	const buttonText = overrides?.buttonText ?? flowCopy?.buttonText;

	if ( title === undefined && buttonText === undefined ) {
		return undefined;
	}

	return { title, buttonText };
};
