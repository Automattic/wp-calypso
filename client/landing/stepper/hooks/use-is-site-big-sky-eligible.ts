import config from '@automattic/calypso-config';
import { isBusinessPlan, isPremiumPlan } from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import { useExperiment } from 'calypso/lib/explat';
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

	const [ isLoading, experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_bigsky_soft_launch_v1',
		{
			isEligible: featureFlagEnabled,
		}
	);

	if ( isLoading ) {
		return { isLoading, isEligible: false };
	}

	const isInBigSkyExperiment = experimentAssignment?.variationName === 'treatment';

	if ( ! isInBigSkyExperiment ) {
		return { isLoading: false, isEligible: false };
	}

	const hasValidGoal = goals.every( ( value ) => validGoals.includes( value ) );
	const isEligiblePlan = isPremiumPlan( product_slug ) || isBusinessPlan( product_slug );

	const eligibilityResult =
		( featureFlagEnabled && isOwner && isEligiblePlan && hasValidGoal && onSupportedDevice ) ||
		false;

	return { isLoading: false, isEligible: eligibilityResult };
}
