/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useOnboardingStepCounter } from '../use-onboarding-step-counter';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: () => true,
} ) );

// `calypso/signup/steps/plans` re-exports the plans step into the legacy `/start` framework,
// which is page.js-routed. A router hook added here throws for every flow that still has a
// plans step, in production too.
describe( 'useOnboardingStepCounter', () => {
	beforeEach( () => window.history.replaceState( {}, '', '/' ) );

	it( 'renders outside a Router', () => {
		expect( () =>
			renderHook( () => useOnboardingStepCounter( 'onboarding-pm', 'plans' ) )
		).not.toThrow();
	} );

	it( 'lets another flow opt in through the parameter', () => {
		window.history.replaceState( {}, '', '/?showDomainStep&showPurchaseSteps=true' );
		const { result, rerender } = renderHook( () =>
			useOnboardingStepCounter( 'new-hosted-site', 'domains' )
		);
		expect( result.current ).toEqual( { current: 1, total: 3 } );

		window.history.replaceState( {}, '', '/' );
		rerender();
		expect( result.current ).toBeNull();
	} );
} );
