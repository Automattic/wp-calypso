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
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_bigsky_soft_launch'
	);
	const variantName = experimentAssignment?.variationName;
	const showBigSkyExperiment = ! isLoadingExperiment && variantName === 'treatment';
	if ( ! showBigSkyExperiment ) {
		return false;
	}

	const validGoals = [ 'other', 'promote' ];

	const configEnabled = config.isEnabled( 'calypso/ai-assembler' );
	if ( ! configEnabled ) {
		return false;
	}

	const hasValidGoal = goals.every( ( value ) => validGoals.includes( value ) );
	const isEligiblePlan = isPremiumPlan( productSlug ) || isBusinessPlan( productSlug );

	return isOwner && isEligiblePlan && hasValidGoal && ! isNarrowView;
}
