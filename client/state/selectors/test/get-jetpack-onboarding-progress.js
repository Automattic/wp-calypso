/** @format */

/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_STEPS as STEPS } from 'jetpack-onboarding/constants';
import { getJetpackOnboardingProgress, isJetpackOnboardingStepCompleted } from 'state/selectors';

describe( 'getJetpackOnboardingProgress()', () => {
	test( 'should return onboading progress for the specified steps', () => {
		const siteId = 2916284;
		const state = {
			jetpackOnboarding: {
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
		const progress = getJetpackOnboardingProgress( state, siteId, steps );
		expect( progress ).toEqual( expected );
	} );
} );
