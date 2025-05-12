import {
	PERSONAL_THEME,
	PREMIUM_THEME,
	DOT_ORG_THEME,
	BUNDLED_THEME,
	MARKETPLACE_THEME,
} from '@automattic/design-picker';
import { PlansIntent } from '@automattic/plans-grid-next';

/* For Guided Signup intents we want to force the default plans for the comparison table. See: pdDR7T-1xi-p2 */
export const shouldForceDefaultPlansBasedOnIntent = ( intent: PlansIntent | undefined ) => {
	return (
		intent &&
		[
			'plans-guided-segment-merchant',
			'plans-guided-segment-blogger',
			'plans-guided-segment-nonprofit',
			'plans-guided-segment-consumer-or-business',
			'plans-guided-segment-developer-or-agency',
		].includes( intent )
	);
};

export const hideEscapeHatchForIntent = ( intent: PlansIntent ) => {
	return intent === 'plans-ai-assembler-free-trial';
};

/**
 * Determine which plans should be displayed based on the type of the selected theme.
 */
export const getHidePlanPropsBasedOnThemeType = ( themeType: string ) => {
	/**
	 * Marketplace themes: Display only Business and eCommerce plans.
	 */
	if (
		themeType === DOT_ORG_THEME ||
		themeType === MARKETPLACE_THEME ||
		themeType === BUNDLED_THEME
	) {
		return { hidePremiumPlan: true, hidePersonalPlan: true, hideFreePlan: true };
	}

	/**
	 * Premium themes: Display Premium, Business and eCommerce
	 */
	if ( themeType === PREMIUM_THEME ) {
		return { hidePersonalPlan: true, hideFreePlan: true };
	}

	/**
	 * Personal themes: Display Personal, Premium, Business and eCommerce
	 */
	if ( themeType === PERSONAL_THEME ) {
		return { hideFreePlan: true };
	}

	return {};
};
