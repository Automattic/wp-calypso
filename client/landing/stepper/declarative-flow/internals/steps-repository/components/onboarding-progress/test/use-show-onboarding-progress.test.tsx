/**
 * @jest-environment jsdom
 */
jest.mock( '@wordpress/compose', () => ( {
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

	it( 'opts in another flow without a plan restriction', () => {
		window.history.replaceState( {}, '', '/?showDomainStep&showPurchaseSteps=true' );
		mockViewport.mockReturnValue( true );
		expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( true );
	} );

	it( 'does not opt in when the parameter is false', () => {
		window.history.replaceState( {}, '', '/?showDomainStep&showPurchaseSteps=false' );
		mockViewport.mockReturnValue( true );
		expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( false );
	} );

	it( 'does not opt in without the domain step', () => {
		window.history.replaceState( {}, '', '/?showPurchaseSteps=true' );
		mockViewport.mockReturnValue( true );
		expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( false );
	} );

	it( 'keeps parameter-enabled progress off mobile', () => {
		window.history.replaceState( {}, '', '/?showDomainStep&showPurchaseSteps=true' );
		mockViewport.mockReturnValue( false );
		expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( false );
	} );
} );
