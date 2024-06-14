import config from '@automattic/calypso-config';
import { isBusinessPlan, isPremiumPlan } from '@automattic/calypso-products';
import { useBreakpoint } from '@automattic/viewport-react';
import { useSelect } from '@wordpress/data';
import { useExperiment } from 'calypso/lib/explat';
import { useIsSiteOwner } from '../hooks/use-is-site-owner';
import { ONBOARD_STORE } from '../stores';
import { useSite } from './use-site';
import type { OnboardSelect } from '@automattic/data-stores';

export function useIsBigSkyEligible(): boolean | null {
	const { isOwner } = useIsSiteOwner();
	const site = useSite();
	const productSlug = site?.plan?.product_slug || '';
	const isNarrowView = useBreakpoint( '<800px' );
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[ site ]
	);

	const featureFlagEnabled = config.isEnabled( 'calypso/big-sky' );
	// For testing purposes. Will bypass the ExPlat experiment results.
	const bypassExperiment = config.isEnabled( 'big-sky' );
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_bigsky_soft_launch',
		{
			isEligible: featureFlagEnabled && ! bypassExperiment,
		}
	);

	if ( ! featureFlagEnabled ) {
		return false;
	}

	const variantName = experimentAssignment?.variationName;
	const isInBigSkyExperiment = ! isLoadingExperiment && variantName === 'treatment';
	if ( ! isInBigSkyExperiment && ! bypassExperiment ) {
		return false;
	}

	const validGoals = [ 'other', 'promote' ];
	const hasValidGoal = goals.every( ( value ) => validGoals.includes( value ) );
	const isEligiblePlan = isPremiumPlan( productSlug ) || isBusinessPlan( productSlug );

	return isOwner && isEligiblePlan && hasValidGoal && ! isNarrowView;
}
