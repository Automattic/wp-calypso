/**
 * @jest-environment jsdom
 */
jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { useShowOnboardingProgress } from '../use-show-onboarding-progress';

const mockViewport = useViewportMatch as unknown as jest.Mock;

describe( 'useShowOnboardingProgress', () => {
	beforeEach( () => {
		mockViewport.mockReset();
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'shows on desktop onboarding', () => {
		mockViewport.mockReturnValue( true );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( true );
	} );

	it( 'hides when not onboarding flow', () => {
		mockViewport.mockReturnValue( true );
		const { result } = renderHook( () => useShowOnboardingProgress( false ) );
		expect( result.current ).toBe( false );
	} );

	it( 'hides on mobile', () => {
		mockViewport.mockReturnValue( false );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( false );
	} );
} );

it.each( [ 'new-hosted-site', 'another-flow' ] )(
	'opts in %s without a plan restriction',
	( flow ) => {
		window.history.replaceState( {}, '', `/setup/${ flow }/domains?showPurchaseSteps=true` );
		mockViewport.mockReturnValue( true );
		expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( true );
	}
);

it.each( [ '', 'false', '1' ] )( 'does not opt in with value %s', ( value ) => {
	window.history.replaceState( {}, '', `/?showPurchaseSteps=${ value }` );
	mockViewport.mockReturnValue( true );
	expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( false );
} );

it( 'keeps parameter-enabled progress off mobile', () => {
	window.history.replaceState( {}, '', '/?showPurchaseSteps=true' );
	mockViewport.mockReturnValue( false );
	expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( false );
} );
