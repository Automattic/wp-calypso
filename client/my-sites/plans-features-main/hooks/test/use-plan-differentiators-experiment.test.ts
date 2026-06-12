/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSelector } from 'calypso/state';
import usePlanDifferentiatorsExperiment from '../use-plan-differentiators-experiment';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

const ELIGIBLE_RESULT = {
	showDifferentiatorHeader: false,
	useVar42NoAiFeatures: true,
	showPricingDifferentiationFeaturePills: true,
	useFocusedNewCopyTaglines: true,
	isExperimentVariant: true,
};

const INELIGIBLE_RESULT = {
	showDifferentiatorHeader: false,
	useVar42NoAiFeatures: false,
	showPricingDifferentiationFeaturePills: false,
	useFocusedNewCopyTaglines: false,
	isExperimentVariant: false,
};

function mockSite( isGatingBusinessQ1: boolean | undefined ) {
	( useSelector as jest.Mock ).mockImplementation( () =>
		isGatingBusinessQ1 !== undefined
			? { ID: 123, options: { is_gating_business_q1: isGatingBusinessQ1 } }
			: null
	);
}

describe( 'usePlanDifferentiatorsExperiment', () => {
	beforeEach( () => jest.clearAllMocks() );

	describe( 'signup flows (no siteId yet)', () => {
		test( 'is eligible when isInSignup=true and siteId is null', () => {
			mockSite( undefined );
			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { isInSignup: true, siteId: null } )
			);
			expect( result.current ).toEqual( ELIGIBLE_RESULT );
		} );

		test( 'is eligible when isInSignup=true and siteId is undefined', () => {
			mockSite( undefined );
			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { isInSignup: true } )
			);
			expect( result.current ).toEqual( ELIGIBLE_RESULT );
		} );
	} );

	describe( 'existing sites in signup flows', () => {
		test( 'is not eligible when isInSignup=true but siteId is set and gating flag is absent', () => {
			mockSite( false );
			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { isInSignup: true, siteId: 123 } )
			);
			expect( result.current ).toEqual( INELIGIBLE_RESULT );
		} );

		test( 'is eligible when isInSignup=true, siteId is set, and gating flag is true', () => {
			mockSite( true );
			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { isInSignup: true, siteId: 123 } )
			);
			expect( result.current ).toEqual( ELIGIBLE_RESULT );
		} );
	} );

	describe( 'logged-in flows (not in signup)', () => {
		test( 'is eligible when site has the gating flag', () => {
			mockSite( true );
			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { isInSignup: false, siteId: 123 } )
			);
			expect( result.current ).toEqual( ELIGIBLE_RESULT );
		} );

		test( 'is not eligible when site does not have the gating flag', () => {
			mockSite( false );
			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { isInSignup: false, siteId: 123 } )
			);
			expect( result.current ).toEqual( INELIGIBLE_RESULT );
		} );

		test( 'is not eligible when site is not found', () => {
			mockSite( undefined );
			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { isInSignup: false, siteId: 123 } )
			);
			expect( result.current ).toEqual( INELIGIBLE_RESULT );
		} );

		test( 'is not eligible when there is no siteId', () => {
			mockSite( undefined );
			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { isInSignup: false } )
			);
			expect( result.current ).toEqual( INELIGIBLE_RESULT );
		} );
	} );
} );
