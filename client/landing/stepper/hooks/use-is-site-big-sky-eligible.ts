import config from '@automattic/calypso-config';
import { isBusinessPlan, isPremiumPlan } from '@automattic/calypso-products';
import { useBreakpoint } from '@automattic/viewport-react';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { useIsSiteOwner } from '../hooks/use-is-site-owner';
import { ONBOARD_STORE } from '../stores';
import { useSite } from './use-site';
import type { OnboardSelect } from '@automattic/data-stores';

const bypassBigSkyExperiment = () => config.isEnabled( 'big-sky' );

export function useIsBigSkyEligible() {
	const { isOwner } = useIsSiteOwner();
	const site = useSite();
	const product_slug = site?.plan?.product_slug || '';
	const isNarrowView = useBreakpoint( '<800px' );
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[ site ]
	);

	const featureFlagEnabled = config.isEnabled( 'calypso/big-sky' );
	const [ , experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_bigsky_soft_launch',
		{
			isEligible: featureFlagEnabled && ! bypassBigSkyExperiment(),
		}
	);

	const [ isLoading, setIsLoading ] = useState( true );
	const [ isEligible, setIsEligible ] = useState( false );

	useEffect( () => {
		if ( ! featureFlagEnabled ) {
			setIsEligible( false );
			setIsLoading( false );
			return;
		}

		const variantName = experimentAssignment?.variationName;
		const isInBigSkyExperiment = variantName === 'treatment';
		if ( ! isInBigSkyExperiment && ! bypassBigSkyExperiment() ) {
			setIsEligible( false );
			setIsLoading( false );
			return;
		}

		const validGoals = [ 'other', 'promote' ];
		const hasValidGoal = goals.every( ( value ) => validGoals.includes( value ) );
		const isEligiblePlan = isPremiumPlan( product_slug ) || isBusinessPlan( product_slug );

		const eligibilityResult =
			( isOwner && isEligiblePlan && hasValidGoal && ! isNarrowView ) || false;

		setIsEligible( eligibilityResult );
		setIsLoading( false );
	}, [ featureFlagEnabled, experimentAssignment, goals, isOwner, product_slug, isNarrowView ] );

	return { isEligible: isEligible, isLoading: isLoading };
}
