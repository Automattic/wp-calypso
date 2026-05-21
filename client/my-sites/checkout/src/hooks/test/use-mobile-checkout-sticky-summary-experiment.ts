/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';
import { useMobileCheckoutStickySummaryExperiment } from '../use-mobile-checkout-sticky-summary-experiment';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseViewportMatch = useViewportMatch as jest.MockedFunction< typeof useViewportMatch >;
const mockUseExperiment = useExperiment as jest.MockedFunction< typeof useExperiment >;

describe( 'useMobileCheckoutStickySummaryExperiment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseExperiment.mockReturnValue( [ false, null ] );
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'only requests experiment assignment for mobile viewports', () => {
		mockUseViewportMatch.mockReturnValue( true );

		renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_mobile_checkout_sticky_summary_v1', {
			isEligible: true,
		} );
	} );

	it( 'opts out of experiment assignment on large viewports', () => {
		mockUseViewportMatch.mockReturnValue( false );

		renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_mobile_checkout_sticky_summary_v1', {
			isEligible: false,
		} );
	} );

	it( 'returns true when the user is in the treatment variation on a mobile viewport', () => {
		mockUseViewportMatch.mockReturnValue( true );
		mockUseExperiment.mockReturnValue( [
			false,
			{
				experimentName: 'calypso_mobile_checkout_sticky_summary_v1',
				variationName: 'treatment',
				retrievedTimestamp: 0,
				ttl: 0,
			},
		] );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toBe( true );
	} );

	it( 'honors the QA query-param override even on large viewports', () => {
		mockUseViewportMatch.mockReturnValue( false );
		window.history.replaceState( {}, '', '/?mobile_checkout_sticky_summary=1' );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toBe( true );
	} );
} );
