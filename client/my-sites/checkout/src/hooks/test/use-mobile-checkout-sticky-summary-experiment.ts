/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { useInitialIsInStepContainerV2FlowContext } from 'calypso/layout/utils';
import { useExperiment } from 'calypso/lib/explat';
import { useMobileCheckoutStickySummaryExperiment } from '../use-mobile-checkout-sticky-summary-experiment';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

jest.mock( 'calypso/layout/utils', () => ( {
	...jest.requireActual( 'calypso/layout/utils' ),
	useInitialIsInStepContainerV2FlowContext: jest.fn(),
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseViewportMatch = useViewportMatch as jest.MockedFunction< typeof useViewportMatch >;
const mockUseExperiment = useExperiment as jest.MockedFunction< typeof useExperiment >;
const mockUseIsStepContainerV2 = useInitialIsInStepContainerV2FlowContext as jest.MockedFunction<
	typeof useInitialIsInStepContainerV2FlowContext
>;

const treatmentAssignment = {
	experimentName: 'calypso_mobile_checkout_sticky_summary_v1',
	variationName: 'treatment',
	retrievedTimestamp: 0,
	ttl: 0,
};

describe( 'useMobileCheckoutStickySummaryExperiment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseExperiment.mockReturnValue( [ false, null ] );
		// Default to the only surface that can render the treatment: a mobile
		// viewport inside a StepContainerV2 flow.
		mockUseViewportMatch.mockReturnValue( true );
		mockUseIsStepContainerV2.mockReturnValue( true );
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'only requests experiment assignment on mobile inside a StepContainerV2 flow', () => {
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

	// The sticky summary only exists in the StepContainerV2 branch, and these
	// components also render on /me/purchases via useCreateCreditCard. Enrolling
	// there would fire an exposure for an experience the user can never see.
	it( 'opts out of experiment assignment outside a StepContainerV2 flow', () => {
		mockUseIsStepContainerV2.mockReturnValue( false );

		renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_mobile_checkout_sticky_summary_v1', {
			isEligible: false,
		} );
	} );

	it( 'returns isLoading false and isMobileCheckoutStickySummary false on large viewports', () => {
		mockUseViewportMatch.mockReturnValue( false );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toEqual( { isLoading: false, isMobileCheckoutStickySummary: false } );
	} );

	it( 'returns isMobileCheckoutStickySummary false outside a StepContainerV2 flow even if assigned to treatment', () => {
		mockUseIsStepContainerV2.mockReturnValue( false );
		mockUseExperiment.mockReturnValue( [ false, treatmentAssignment ] );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toEqual( { isLoading: false, isMobileCheckoutStickySummary: false } );
	} );

	it( 'returns isLoading true and isMobileCheckoutStickySummary false while ExPlat is loading on mobile', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toEqual( { isLoading: true, isMobileCheckoutStickySummary: false } );
	} );

	it( 'returns isMobileCheckoutStickySummary false for control assignment on mobile', () => {
		mockUseExperiment.mockReturnValue( [
			false,
			{ ...treatmentAssignment, variationName: 'control' },
		] );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toEqual( {
			isLoading: false,
			isMobileCheckoutStickySummary: false,
		} );
	} );

	it( 'returns isMobileCheckoutStickySummary true for treatment assignment on mobile', () => {
		mockUseExperiment.mockReturnValue( [ false, treatmentAssignment ] );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toEqual( {
			isLoading: false,
			isMobileCheckoutStickySummary: true,
		} );
	} );

	it( 'ignores the QA query-param override on large viewports', () => {
		mockUseViewportMatch.mockReturnValue( false );
		window.history.replaceState( {}, '', '/?mobile_checkout_sticky_summary=1' );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toEqual( {
			isLoading: false,
			isMobileCheckoutStickySummary: false,
		} );
	} );

	it( 'ignores the QA query-param override outside a StepContainerV2 flow', () => {
		mockUseIsStepContainerV2.mockReturnValue( false );
		window.history.replaceState( {}, '', '/?mobile_checkout_sticky_summary=1' );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toEqual( {
			isLoading: false,
			isMobileCheckoutStickySummary: false,
		} );
	} );

	// useViewportMatch is reactive. If eligibility could flip false -> true
	// mid-session, ExPlat would start loading, isLoading would go back to true, and
	// checkout would unmount its step group along with anything already typed.
	describe( 'eligibility is frozen at mount', () => {
		it( 'stays ineligible when the viewport later narrows past the breakpoint', () => {
			mockUseViewportMatch.mockReturnValue( false );

			const { rerender } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

			mockUseViewportMatch.mockReturnValue( true );
			rerender();

			expect( mockUseExperiment ).toHaveBeenLastCalledWith(
				'calypso_mobile_checkout_sticky_summary_v1',
				{ isEligible: false }
			);
		} );

		it( 'keeps a participant in the treatment when the viewport later widens', () => {
			mockUseExperiment.mockReturnValue( [ false, treatmentAssignment ] );

			const { result, rerender } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );
			expect( result.current.isMobileCheckoutStickySummary ).toBe( true );

			mockUseViewportMatch.mockReturnValue( false );
			rerender();

			expect( result.current.isMobileCheckoutStickySummary ).toBe( true );
		} );
	} );

	it( 'honors the QA query-param override on eligible surfaces', () => {
		window.history.replaceState( {}, '', '/?mobile_checkout_sticky_summary=1' );

		const { result } = renderHook( () => useMobileCheckoutStickySummaryExperiment() );

		expect( result.current ).toEqual( {
			isLoading: false,
			isMobileCheckoutStickySummary: true,
		} );
	} );
} );
