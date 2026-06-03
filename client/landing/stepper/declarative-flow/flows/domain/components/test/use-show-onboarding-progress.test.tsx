/**
 * @jest-environment jsdom
 */
jest.mock( '@wordpress/compose', () => ( {
	useViewportMatch: jest.fn(),
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';
import { useShowOnboardingProgress } from '../use-show-onboarding-progress';

const mockViewport = useViewportMatch as jest.Mock;
const mockExperiment = useExperiment as jest.Mock;

describe( 'useShowOnboardingProgress', () => {
	beforeEach( () => {
		mockViewport.mockReset();
		mockExperiment.mockReset();
	} );

	it( 'shows on desktop onboarding when assignment is null (temporary control = show)', () => {
		mockViewport.mockReturnValue( true );
		mockExperiment.mockReturnValue( [ false, null ] );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( true );
	} );

	it( 'hides when not onboarding flow', () => {
		mockViewport.mockReturnValue( true );
		mockExperiment.mockReturnValue( [ false, null ] );
		const { result } = renderHook( () => useShowOnboardingProgress( false ) );
		expect( result.current ).toBe( false );
	} );

	it( 'hides on mobile', () => {
		mockViewport.mockReturnValue( false );
		mockExperiment.mockReturnValue( [ false, null ] );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( false );
	} );

	it( 'hides for the treatment assignment (future live state)', () => {
		mockViewport.mockReturnValue( true );
		mockExperiment.mockReturnValue( [ false, { variationName: 'treatment' } ] );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( false );
	} );
} );
