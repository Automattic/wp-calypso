import config from '@automattic/calypso-config';
import { isBusinessPlan, isPremiumPlan } from '@automattic/calypso-products';
import { Onboard } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from 'react';
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

function useOpenAIHealth() {
	const [ isOpenAIDown, setIsOpenAIDown ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		const checkHealth = async () => {
			try {
				const response = await fetch(
					'https://public-api.wordpress.com/wpcom/v2/openai-proxy/v1/healthcheck'
				);
				const data = await response.json();
				setIsOpenAIDown( data.status === 'KO' );
			} catch ( error ) {
				setIsOpenAIDown( false );
			} finally {
				setIsLoading( false );
			}
		};

		checkHealth();
	}, [] );

	return { isOpenAIDown, isLoading };
}

export function useIsBigSkyEligible() {
	const { isOwner } = useIsSiteOwner();
	const site = useSite();
	const product_slug = site?.plan?.product_slug || '';
	const onSupportedDevice = userAgent.isTablet || userAgent.isDesktop;
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[ site ]
	);
	const { isOpenAIDown, isLoading: isOpenAIStatusLoading } = useOpenAIHealth();

	const isEligibleGoals = isGoalsBigSkyEligible( goals );
	const isEligiblePlan = isPremiumPlan( product_slug ) || isBusinessPlan( product_slug );

	const eligibilityResult =
		( featureFlagEnabled && isOwner && isEligiblePlan && isEligibleGoals && onSupportedDevice ) ||
		false;

	return { isLoading: isOpenAIStatusLoading, isEligible: eligibilityResult, isOpenAIDown };
}

export function isGoalsBigSkyEligible( goals: Onboard.SiteGoal[] ) {
	const hasInvalidGoal = goals.some( ( value ) => invalidGoals.includes( value ) );
	return ! hasInvalidGoal;
}
