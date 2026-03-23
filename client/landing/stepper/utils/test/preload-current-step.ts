import { preloadCurrentStep } from '../preload-current-step';
import type { StepperStep } from '../../declarative-flow/internals/types';

function makeStep( slug: string, asyncComponent?: jest.Mock ): StepperStep {
	return {
		slug,
		asyncComponent: asyncComponent ?? jest.fn( () => Promise.resolve( { default: () => null } ) ),
	};
}

describe( 'preloadCurrentStep', () => {
	it( 'calls asyncComponent for the step matching the URL slug', () => {
		const domainStep = makeStep( 'domains' );
		const plansStep = makeStep( 'plans' );

		preloadCurrentStep( [ domainStep, plansStep ], '/setup/onboarding/domains' );

		expect( domainStep.asyncComponent ).toHaveBeenCalledTimes( 1 );
		expect( plansStep.asyncComponent ).not.toHaveBeenCalled();
	} );

	it( 'does nothing when the URL has no step segment', () => {
		const step = makeStep( 'domains' );

		preloadCurrentStep( [ step ], '/setup/onboarding' );

		expect( step.asyncComponent ).not.toHaveBeenCalled();
	} );

	it( 'does nothing when no step matches the URL slug', () => {
		const step = makeStep( 'domains' );

		preloadCurrentStep( [ step ], '/setup/onboarding/plans' );

		expect( step.asyncComponent ).not.toHaveBeenCalled();
	} );

	it( 'does nothing for an empty steps array', () => {
		// Should not throw.
		expect( () => preloadCurrentStep( [], '/setup/onboarding/domains' ) ).not.toThrow();
	} );

	it( 'does not preload the injected user step that is not yet in the array', () => {
		// flow.initialize() returns steps before injectUserStepInSteps runs,
		// so the "user" step is absent — preload should be a no-op.
		const domainStep = makeStep( 'domains' );

		preloadCurrentStep( [ domainStep ], '/setup/onboarding/user' );

		expect( domainStep.asyncComponent ).not.toHaveBeenCalled();
	} );

	it( 'handles a URL with a trailing locale segment', () => {
		const domainStep = makeStep( 'domains' );

		// /setup/<flow>/<step>/<lang>
		preloadCurrentStep( [ domainStep ], '/setup/onboarding/domains/es' );

		expect( domainStep.asyncComponent ).toHaveBeenCalledTimes( 1 );
	} );
} );
