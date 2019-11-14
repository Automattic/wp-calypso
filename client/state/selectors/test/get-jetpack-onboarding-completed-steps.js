/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_STEPS as STEPS } from 'jetpack-onboarding/constants';
import getJetpackOnboardingCompletedSteps from 'state/selectors/get-jetpack-onboarding-completed-steps';
import isJetpackOnboardingStepCompleted from 'state/selectors/is-jetpack-onboarding-step-completed';

describe( 'getJetpackOnboardingCompletedSteps()', () => {
	test( 'should return onboading progress for the specified steps', () => {
		const siteId = 2916284;
		const state = {
			jetpack: {
				settings: {
					[ siteId ]: {},
				},
			},
		};
		const steps = [ STEPS.SITE_TITLE, STEPS.SITE_TYPE ];
		const expected = {
			[ STEPS.SITE_TITLE ]: isJetpackOnboardingStepCompleted( state, siteId, STEPS.SITE_TITLE ),
			[ STEPS.SITE_TYPE ]: isJetpackOnboardingStepCompleted( state, siteId, STEPS.SITE_TYPE ),
		};
		const progress = getJetpackOnboardingCompletedSteps( state, siteId, steps );
		expect( progress ).toEqual( expected );
	} );
} );
