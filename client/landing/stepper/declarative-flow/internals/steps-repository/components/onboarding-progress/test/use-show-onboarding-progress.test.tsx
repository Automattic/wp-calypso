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
