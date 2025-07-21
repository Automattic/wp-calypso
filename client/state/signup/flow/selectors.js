import { ONBOARDING_UNIFIED_FLOW } from '@automattic/onboarding';
import { get } from 'lodash';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
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
	// Use Redux state instead of direct window access
	if ( currentFlowName === '' ) {
		const currentRoute = getCurrentRoute( state );
		const queryArgs = getCurrentQueryArguments( state );

		if ( currentRoute ) {
			const flowFromURL = getFlowFromURL( currentRoute );
			if ( flowFromURL === ONBOARDING_UNIFIED_FLOW ) {
				return queryArgs?.source === 'affiliate';
			}
		}
	}

	return false;
};
