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

const mockViewport = useViewportMatch as unknown as jest.Mock;
const mockExperiment = useExperiment as unknown as jest.Mock;

describe( 'useShowOnboardingProgress', () => {
	beforeEach( () => {
		mockViewport.mockReset();
		mockExperiment.mockReset();
	} );

	it( 'shows on desktop onboarding for the progress_bar treatment', () => {
		mockViewport.mockReturnValue( true );
		mockExperiment.mockReturnValue( [ false, { variationName: 'progress_bar' } ] );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( true );
	} );

	it( 'hides for the control assignment (null)', () => {
		mockViewport.mockReturnValue( true );
		mockExperiment.mockReturnValue( [ false, null ] );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( false );
	} );

	it( 'hides when not onboarding flow', () => {
		mockViewport.mockReturnValue( true );
		mockExperiment.mockReturnValue( [ false, { variationName: 'progress_bar' } ] );
		const { result } = renderHook( () => useShowOnboardingProgress( false ) );
		expect( result.current ).toBe( false );
	} );

	it( 'hides on mobile', () => {
		mockViewport.mockReturnValue( false );
		mockExperiment.mockReturnValue( [ false, { variationName: 'progress_bar' } ] );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( false );
	} );

	it( 'passes isEligible: true to useExperiment on desktop', () => {
		mockViewport.mockReturnValue( true );
		mockExperiment.mockReturnValue( [ false, { variationName: 'progress_bar' } ] );
		renderHook( () => useShowOnboardingProgress( true ) );
		expect( mockExperiment ).toHaveBeenCalledWith(
			expect.any( String ),
			expect.objectContaining( { isEligible: true } )
		);
	} );

	it( 'passes isEligible: false to useExperiment on mobile', () => {
		mockViewport.mockReturnValue( false );
		mockExperiment.mockReturnValue( [ false, null ] );
		renderHook( () => useShowOnboardingProgress( true ) );
		expect( mockExperiment ).toHaveBeenCalledWith(
			expect.any( String ),
			expect.objectContaining( { isEligible: false } )
		);
	} );

	it( 'hides while the experiment assignment is still loading', () => {
		mockViewport.mockReturnValue( true );
		mockExperiment.mockReturnValue( [ true, null ] );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( false );
	} );
} );
