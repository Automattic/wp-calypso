import { get } from 'lodash';

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

export const getIsOnboardingAffiliateFlow = ( state ) =>
	'onboarding-affiliate' === getCurrentFlowName( state );
