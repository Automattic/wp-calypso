import { getIntervalTypeForTerm, PLAN_BUSINESS, PLAN_PREMIUM } from '@automattic/calypso-products';
import {
	PERSONAL_THEME,
	PREMIUM_THEME,
	DOT_ORG_THEME,
	BUNDLED_THEME,
	MARKETPLACE_THEME,
} from '@automattic/design-picker';
import { PlansIntent } from '@automattic/plans-grid-next';
import { THEME_TIERS } from 'calypso/components/theme-tier/constants';
import { supportedIntervalTypes } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/unified-plans/util';
import type { SupportedUrlFriendlyTermType } from '@automattic/plans-grid-next';

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

const getHidePlanPropsBelow = ( minimumPlan: string ) => {
	switch ( minimumPlan ) {
		case PLAN_BUSINESS:
			return { hidePremiumPlan: true, hidePersonalPlan: true, hideFreePlan: true };
		case PLAN_PREMIUM:
			return { hidePersonalPlan: true, hideFreePlan: true };
		default:
			return { hideFreePlan: true };
	}
};

/**
 * Determine which plans should be displayed based on the type of the selected theme.
 */
export const getHidePlanPropsBasedOnThemeType = ( themeType: string ) => {
	/**
	 * Community and bundled themes: Display only Business and eCommerce plans.
	 */
	if ( themeType === DOT_ORG_THEME || themeType === BUNDLED_THEME ) {
		return { hidePremiumPlan: true, hidePersonalPlan: true, hideFreePlan: true };
	}

	/**
	 * Personal and premium themes: display the tier's minimum plan and everything above it.
	 */
	if ( themeType === PERSONAL_THEME || themeType === PREMIUM_THEME ) {
		return getHidePlanPropsBelow( THEME_TIERS[ themeType ].minimumUpsellPlan );
	}

	/**
	 * Marketplace themes: Display Personal, Premium, Business and eCommerce
	 */
	if ( themeType === MARKETPLACE_THEME ) {
		return { hideFreePlan: true };
	}

	return {};
};

/**
 * Ensures that the requested intervalType is compatible with the current plan's term.
 * Users can only select interval types that are equal to or longer than their current plan's interval.
 */
export const ensureCompatibleIntervalType = (
	currentPlanTerm: string | null | undefined,
	requestedIntervalType: SupportedUrlFriendlyTermType
): SupportedUrlFriendlyTermType => {
	if ( ! currentPlanTerm ) {
		return requestedIntervalType;
	}

	const currentPlanIntervalType = getIntervalTypeForTerm( currentPlanTerm );
	if ( ! currentPlanIntervalType ) {
		return requestedIntervalType;
	}

	const currentIndex = supportedIntervalTypes.indexOf(
		currentPlanIntervalType as SupportedUrlFriendlyTermType
	);
	const requestedIndex = supportedIntervalTypes.indexOf( requestedIntervalType );

	if ( currentIndex === -1 || requestedIndex === -1 || requestedIndex >= currentIndex ) {
		return requestedIntervalType;
	}

	return currentPlanIntervalType as SupportedUrlFriendlyTermType;
};
