import { useFeatureConfig } from '../contexts/HelpCenterContext';
import { useHelpCenterCTAQuery } from '../data/use-help-center-cta';
import type { HelpCenterCTAProps, HelpCenterCTAVariant } from '../components/help-center-cta';

/**
 * The destination is campaign data, so it can be edited without a deploy. Only
 * follow it when it is an absolute http(s) URL, never `javascript:` or `data:`.
 * @param url The destination from the payload.
 */
function isSafeUrl( url: string ): boolean {
	try {
		const { protocol } = new URL( url );
		return protocol === 'https:' || protocol === 'http:';
	} catch {
		return false;
	}
}

/**
 * Resolves the contextual CTA the backend picked for this user into renderable
 * props, or null when this slot has nothing to show. Campaign copy, destination,
 * and variant all come from the payload so they can change without a deploy.
 * @param variant The slot asking. Only the CTA the backend built for it renders.
 */
export function useHelpCenterCTA( variant: HelpCenterCTAVariant ): HelpCenterCTAProps | null {
	const featureConfig = useFeatureConfig();
	const { data: cta, isLoading } = useHelpCenterCTAQuery( featureConfig.contextualCta.enabled );

	if ( ! featureConfig.contextualCta.enabled || isLoading || ! cta ) {
		return null;
	}

	if (
		cta.variant !== variant ||
		! cta.id ||
		typeof cta.title !== 'string' ||
		! cta.title ||
		! cta.url ||
		! isSafeUrl( cta.url )
	) {
		return null;
	}

	return {
		variant,
		ctaId: cta.id,
		url: cta.url,
		title: cta.title,
		description: typeof cta.description === 'string' ? cta.description : undefined,
		actionLabel: typeof cta.url_text === 'string' ? cta.url_text : undefined,
		purchasedAt: Number.isFinite( cta.purchased_at ) ? cta.purchased_at : undefined,
		planFamily: typeof cta.plan_family === 'string' ? cta.plan_family : undefined,
	};
}
