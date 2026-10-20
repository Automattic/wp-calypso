/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useOnboardingStepCounter } from '../use-onboarding-step-counter';

// `calypso/signup/steps/plans` re-exports the plans step into the legacy `/start` framework,
// which is page.js-routed. A router hook added here throws for every flow that still has a
// plans step, in production too.
describe( 'useOnboardingStepCounter', () => {
	it( 'renders outside a Router', () => {
		expect( () =>
			renderHook( () => useOnboardingStepCounter( 'onboarding-pm', 'plans' ) )
		).not.toThrow();
	} );
} );
