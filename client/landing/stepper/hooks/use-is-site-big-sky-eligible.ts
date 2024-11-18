import config from '@automattic/calypso-config';
import { isBusinessPlan, isPremiumPlan } from '@automattic/calypso-products';
import { Onboard } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import userAgent from 'calypso/lib/user-agent';
import { useIsSiteOwner } from '../hooks/use-is-site-owner';
import { ONBOARD_STORE } from '../stores';
import { useSite } from './use-site';
import type { OnboardSelect } from '@automattic/data-stores';

const { SiteGoal } = Onboard;

const featureFlagEnabled = config.isEnabled( 'calypso/big-sky' );
const invalidGoals = [
	SiteGoal.PaidSubscribers,
	SiteGoal.Courses,
	SiteGoal.DIFM,
	SiteGoal.Import,
	SiteGoal.Newsletter,
	SiteGoal.SellPhysical,
	SiteGoal.SellDigital,
];

export function useIsBigSkyEligible() {
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

	const eligibilityResult =
		( featureFlagEnabled && isOwner && isEligiblePlan && isEligibleGoals && onSupportedDevice ) ||
		false;

	return { isLoading: false, isEligible: eligibilityResult };
}

export function isGoalsBigSkyEligible( goals: Onboard.SiteGoal[] ) {
	const hasInvalidGoal = goals.some( ( value ) => invalidGoals.includes( value ) );
	return ! hasInvalidGoal;
}
