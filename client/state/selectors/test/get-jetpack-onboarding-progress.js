/** @format */

/**
 * External dependencies
 */
import { invert, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_STEPS as STEPS } from 'jetpack-onboarding/constants';
import { getJetpackOnboardingProgress, isJetpackOnboardingStepCompleted } from 'state/selectors';

describe( 'getJetpackOnboardingProgress()', () => {
	const siteId = 2916284;
	const state = {
		jetpackOnboarding: {
			settings: {
				[ siteId ]: {},
			},
		},
	};

	test( 'should return progress of all steps if no steps are specified', () => {
		const steps = invert( STEPS );
		const expected = mapValues( steps, stepName =>
			isJetpackOnboardingStepCompleted( state, siteId, stepName )
		);
		const progress = getJetpackOnboardingProgress( state, 2916284 );
		expect( progress ).toEqual( expected );
	} );

	test( 'should return progress of concrete steps if such are specified', () => {
		const steps = [ [ STEPS.SITE_TITLE ], [ STEPS.SITE_TYPE ] ];
		const expected = {
			[ STEPS.SITE_TITLE ]: isJetpackOnboardingStepCompleted( state, siteId, STEPS.SITE_TITLE ),
			[ STEPS.SITE_TYPE ]: isJetpackOnboardingStepCompleted( state, siteId, STEPS.SITE_TYPE ),
		};
		const progress = getJetpackOnboardingProgress( state, 2916284, steps );
		expect( progress ).toEqual( expected );
	} );
} );
