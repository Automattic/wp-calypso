import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_AI_ASSISTANT, isBusinessPlan, isPremiumPlan } from '@automattic/calypso-products';
import { Onboard } from '@automattic/data-stores';
import { AI_SITE_BUILDER_FLOW, SITE_SETUP_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import userAgent from 'calypso/lib/user-agent';
import { useIsSiteOwner } from '../hooks/use-is-site-owner';
import { ONBOARD_STORE } from '../stores';
import { useSite } from './use-site';
import type { OnboardSelect } from '@automattic/data-stores';

const { SiteGoal } = Onboard;

const featureFlagEnabled = isEnabled( 'calypso/big-sky' );
const featurePostCheckoutAiStepEnabled = isEnabled( 'onboarding/post-checkout-ai-step' );

const invalidGoals = [
	SiteGoal.PaidSubscribers,
	SiteGoal.Courses,
	SiteGoal.DIFM,
	SiteGoal.Import,
	SiteGoal.SellPhysical,
	SiteGoal.SellDigital,
];

export function useIsBigSkyEligible( flowName?: string ) {
	const { isOwner } = useIsSiteOwner();
	const site = useSite();
	const product_slug = site?.plan?.product_slug || '';
	const onSupportedDevice = userAgent.isTablet || userAgent.isDesktop;
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[ site ]
	);

	const isEligibleGoals = isGoalsBigSkyEligible( goals );
	const isEligiblePlan = isPremiumPlan( product_slug ) || isBusinessPlan( product_slug );
	const siteHasAiAssistantFeature =
		site?.plan?.features?.active?.includes( FEATURE_AI_ASSISTANT ) ?? false;

	if ( flowName === AI_SITE_BUILDER_FLOW ) {
		return { isEligible: true };
	}

	if ( flowName === SITE_SETUP_FLOW ) {
		return {
			isEligible:
				featureFlagEnabled &&
				featurePostCheckoutAiStepEnabled &&
				!! isOwner &&
				siteHasAiAssistantFeature &&
				isEligibleGoals &&
				onSupportedDevice,
		};
	}

	return {
		isEligible:
			featureFlagEnabled && !! isOwner && isEligiblePlan && isEligibleGoals && onSupportedDevice,
	};
}

export function isGoalsBigSkyEligible( goals: Onboard.SiteGoal[] ) {
	const hasInvalidGoal = goals.some( ( value ) => invalidGoals.includes( value ) );
	return ! hasInvalidGoal;
}
