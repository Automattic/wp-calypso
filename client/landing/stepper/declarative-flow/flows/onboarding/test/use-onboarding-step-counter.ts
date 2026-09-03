/**
 * @jest-environment jsdom
 */
// Only the viewport hook is faked. The rest of the module has to stay real:
// `@automattic/onboarding` pulls in `@wordpress/components`, which needs
// `createHigherOrderComponent` from here at import time.
jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { useShowOnboardingProgress } from '../../../internals/steps-repository/components/onboarding-progress/use-show-onboarding-progress';
import { useOnboardingStepCounter } from '../use-onboarding-step-counter';

const mockViewport = useViewportMatch as unknown as jest.Mock;

describe( 'useOnboardingStepCounter', () => {
	beforeEach( () => {
		mockViewport.mockReset();
	} );

	it( 'counts the step when the viewport is too narrow for the names', () => {
		mockViewport.mockReturnValue( false );
		const { result } = renderHook( () => useOnboardingStepCounter( ONBOARDING_FLOW, 'plans' ) );
		expect( result.current ).toEqual( { current: 2, total: 3 } );
	} );

	// This is the behaviour change. The counter used to be gated to `small`, so
	// between the mobile and desktop breakpoints the flow showed no progress at
	// all. It now runs all the way up to where the names take over.
	it( 'counts the step at tablet widths, not just mobile', () => {
		mockViewport.mockReturnValue( false );
		const { result } = renderHook( () => useOnboardingStepCounter( ONBOARDING_FLOW, 'domains' ) );
		expect( result.current ).toEqual( { current: 1, total: 3 } );
		expect( mockViewport ).toHaveBeenCalledWith( 'large' );
	} );

	it( 'stands down once there is room for the names', () => {
		mockViewport.mockReturnValue( true );
		const { result } = renderHook( () => useOnboardingStepCounter( ONBOARDING_FLOW, 'plans' ) );
		expect( result.current ).toBeNull();
	} );

	it( 'stays out of other flows', () => {
		mockViewport.mockReturnValue( false );
		const { result } = renderHook( () => useOnboardingStepCounter( 'newsletter', 'plans' ) );
		expect( result.current ).toBeNull();
	} );

	it( 'ignores steps that are not part of the purchase path', () => {
		mockViewport.mockReturnValue( false );
		const { result } = renderHook( () =>
			useOnboardingStepCounter( ONBOARDING_FLOW, 'processing' )
		);
		expect( result.current ).toBeNull();
	} );

	// The point of the pair. Whatever the viewport, the flow shows exactly one
	// treatment: never both at once, and never a gap with neither.
	describe.each( [
		[ 'wide', true ],
		[ 'narrow', false ],
	] )( 'at %s widths', ( _label, matches ) => {
		it( 'shows exactly one of the two treatments', () => {
			mockViewport.mockReturnValue( matches );

			const names = renderHook( () => useShowOnboardingProgress( true ) ).result.current;
			const counter = renderHook( () => useOnboardingStepCounter( ONBOARDING_FLOW, 'plans' ) )
				.result.current;

			expect( names ).toBe( matches );
			expect( Boolean( names ) !== Boolean( counter ) ).toBe( true );
		} );
	} );
} );
