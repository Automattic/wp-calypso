import { isAIBuilderOnboardingFlow, isOnboardingFlow } from '@automattic/onboarding';

type SkipSuggestionCopy = {
	title?: string;
	subtitle?: string;
	buttonText?: string;
	skipLabel?: string;
};

/**
 * Copy for the free-subdomain skip card.
 *
 * Two sources, in order of precedence:
 *   1. `overrides` — supplied by a flow via the domain-search step's
 *      `freeSubdomainTitle` / `freeSubdomainButtonLabel` accepts-props (already
 *      translated). A `title` may contain the `%(domain)s` placeholder, which the
 *      package interpolates with the free subdomain.
 *   2. The flow default:
 *      - AI Website Builder onboarding requires a paid plan, so skipping the domain
 *        doesn't start a free site; it drops the "start free" framing.
 *      - Onboarding frames the card as skipping the domain. It doesn't name the free
 *        WordPress.com address, since some sites end up on a different one.
 *
 * Returns `undefined` when neither applies, so the package renders its own defaults.
 */
export const getSkipSuggestionCopy = (
	flow: string | null,
	__: ( text: string ) => string,
	overrides?: SkipSuggestionCopy
): SkipSuggestionCopy | undefined => {
	let flowCopy: SkipSuggestionCopy | undefined;

	if ( isAIBuilderOnboardingFlow( flow ) ) {
		flowCopy = {
			// translators: %(domain)s is the free WordPress.com subdomain
			title: __( 'Start with %(domain)s' ),
			buttonText: __( 'Choose a domain later' ),
		};
	} else if ( isOnboardingFlow( flow ) ) {
		flowCopy = {
			title: __( 'Skip the domain for now' ),
			subtitle: __(
				'You’ll get a WordPress.com branded domain. Upgrade to a custom domain name anytime.'
			),
			buttonText: __( 'Skip' ),
			skipLabel: __( 'Skip the domain for now' ),
		};
	}

	const title = overrides?.title ?? flowCopy?.title;
	const subtitle = overrides?.subtitle ?? flowCopy?.subtitle;
	const buttonText = overrides?.buttonText ?? flowCopy?.buttonText;
	const skipLabel = overrides?.skipLabel ?? flowCopy?.skipLabel;

	if (
		title === undefined &&
		subtitle === undefined &&
		buttonText === undefined &&
		skipLabel === undefined
	) {
		return undefined;
	}

	return { title, subtitle, buttonText, skipLabel };
};
