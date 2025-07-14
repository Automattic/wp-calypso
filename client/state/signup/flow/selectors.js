import { getQueryArgs } from '@wordpress/url';
import { get } from 'lodash';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';

import 'calypso/state/signup/init';

export function getCurrentFlowName( state ) {
	return get( state, 'signup.flow.currentFlowName', '' );
}

export function getPreviousFlowName( state ) {
	return get( state, 'signup.flow.previousFlowName', '' );
}

export function getExcludedSteps( state ) {
	return get( state, 'signup.flow.excludedSteps', [] );
}

export const getIsOnboardingAffiliateFlow = ( state ) => {
	const currentFlowName = getCurrentFlowName( state );

	// Check if it's the legacy onboarding-affiliate flow
	if ( currentFlowName === 'onboarding-affiliate' ) {
		return true;
	}

	// Check if it's the new onboarding-unified flow with source=affiliate
	// getCurrentFlowName returns empty string for onboarding-unified, so we check the URL directly
	if ( currentFlowName === '' && typeof window !== 'undefined' ) {
		const flowFromURL = getFlowFromURL();
		if ( flowFromURL === 'onboarding-unified' ) {
			const queryArgs = getQueryArgs( window.location.href );
			return queryArgs.source === 'affiliate';
		}
	}

	return false;
};
