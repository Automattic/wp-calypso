/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';
import { useRsmBetterCheckoutExperiment } from '../use-rsm-better-checkout-experiment';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseViewportMatch = useViewportMatch as jest.MockedFunction< typeof useViewportMatch >;
const mockUseExperiment = useExperiment as jest.MockedFunction< typeof useExperiment >;

describe( 'useRsmBetterCheckoutExperiment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseExperiment.mockReturnValue( [ false, null ] );
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'only requests experiment assignment for large viewports', () => {
		mockUseViewportMatch.mockReturnValue( true );

		renderHook( () => useRsmBetterCheckoutExperiment() );

		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_rsm_better_checkout_v2', {
			isEligible: true,
		} );
	} );

	it( 'opts out of experiment assignment on small viewports', () => {
		mockUseViewportMatch.mockReturnValue( false );

		renderHook( () => useRsmBetterCheckoutExperiment() );

		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_rsm_better_checkout_v2', {
			isEligible: false,
		} );
	} );

	it( 'returns true when the user is in the treatment variation on a large viewport', () => {
		mockUseViewportMatch.mockReturnValue( true );
		mockUseExperiment.mockReturnValue( [
			false,
			{
				experimentName: 'calypso_rsm_better_checkout_v2',
				variationName: 'treatment',
				retrievedTimestamp: 0,
				ttl: 0,
			},
		] );

		const { result } = renderHook( () => useRsmBetterCheckoutExperiment() );

		expect( result.current ).toBe( true );
	} );

	it( 'returns false when the user is in the control variation', () => {
		mockUseViewportMatch.mockReturnValue( true );
		mockUseExperiment.mockReturnValue( [
			false,
			{
				experimentName: 'calypso_rsm_better_checkout_v2',
				variationName: 'control',
				retrievedTimestamp: 0,
				ttl: 0,
			},
		] );

		const { result } = renderHook( () => useRsmBetterCheckoutExperiment() );

		expect( result.current ).toBe( false );
	} );

	it( 'honors the QA query-param override even on small viewports', () => {
		mockUseViewportMatch.mockReturnValue( false );
		window.history.replaceState( {}, '', '/?rsm_better_checkout=1' );

		const { result } = renderHook( () => useRsmBetterCheckoutExperiment() );

		expect( result.current ).toBe( true );
	} );
} );
