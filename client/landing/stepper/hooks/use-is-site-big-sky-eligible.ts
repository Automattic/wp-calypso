import config from '@automattic/calypso-config';
import { isBusinessPlan, isPremiumPlan, isPersonalPlan } from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import userAgent from 'calypso/lib/user-agent';
import { useIsSiteOwner } from '../hooks/use-is-site-owner';
import { ONBOARD_STORE } from '../stores';
import { useSite } from './use-site';
import type { OnboardSelect } from '@automattic/data-stores';

const featureFlagEnabled = config.isEnabled( 'calypso/big-sky' );
const validGoals = [ 'other', 'promote' ];

export function useIsBigSkyEligible() {
	const { isOwner } = useIsSiteOwner();
	const site = useSite();
	const product_slug = site?.plan?.product_slug || '';
	const onSupportedDevice = userAgent.isTablet || userAgent.isDesktop;
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[ site ]
	);

	const hasValidGoal = goals.every( ( value ) => validGoals.includes( value ) );
	const isEligiblePlan =
		isPersonalPlan( product_slug ) ||
		isPremiumPlan( product_slug ) ||
		isBusinessPlan( product_slug );

	const eligibilityResult =
		( featureFlagEnabled && isOwner && isEligiblePlan && hasValidGoal && onSupportedDevice ) ||
		false;

	return { isLoading: false, isEligible: eligibilityResult };
}
