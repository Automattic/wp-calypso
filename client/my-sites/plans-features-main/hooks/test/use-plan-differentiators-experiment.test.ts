/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import usePlanDifferentiatorsExperiment from '../use-plan-differentiators-experiment';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

const EXPERIMENT_NAME = 'calypso_pricing_differentiation_202611';

const CONTROL_RESULT = {
	isLoading: false,
	variant: 'control',
	showAiCredits: false,
	useReversedPlanOrder: false,
	isExperimentEligible: true,
};

const INELIGIBLE_RESULT = {
	...CONTROL_RESULT,
	isExperimentEligible: false,
};

const mockUseExperiment = useExperiment as jest.Mock;
const mockUseSelector = useSelector as jest.Mock;

const SITE_ID = 123;

// Runs the hook's real selectors against the given sites.
function mockSitesState( items: Record< number, object > ) {
	mockUseSelector.mockImplementation( ( selector ) => selector( { sites: { items } } ) );
}

function mockSite( {
	siteCreationFlow = 'onboarding',
	createdAt = '2026-11-05T00:00:01+00:00',
}: {
	siteCreationFlow?: string | null;
	createdAt?: string;
} = {} ) {
	mockSitesState( {
		[ SITE_ID ]: {
			ID: SITE_ID,
			options: {
				site_creation_flow: siteCreationFlow,
				...( createdAt && { created_at: createdAt } ),
			},
		},
	} );
}

function mockNoSite() {
	mockSitesState( {} );
}

const SIGNUP_PARAMS = {
	flowName: 'onboarding',
	isInSignup: true,
	siteId: null,
};

const SITE_PARAMS = {
	flowName: null,
	isInSignup: false,
	siteId: SITE_ID,
};

describe( 'usePlanDifferentiatorsExperiment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockNoSite();
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'control' } ] );
	} );

	describe( 'eligibility', () => {
		test( 'is eligible for onboarding signups without a siteId', () => {
			const { result } = renderHook( () => usePlanDifferentiatorsExperiment( SIGNUP_PARAMS ) );

			expect( mockUseExperiment ).toHaveBeenCalledWith( EXPERIMENT_NAME, { isEligible: true } );
			expect( result.current ).toEqual( CONTROL_RESULT );
		} );

		test( 'is not eligible for other signup flows', () => {
			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { ...SIGNUP_PARAMS, flowName: 'newsletter' } )
			);

			expect( mockUseExperiment ).toHaveBeenCalledWith( EXPERIMENT_NAME, { isEligible: false } );
			expect( result.current ).toEqual( INELIGIBLE_RESULT );
		} );

		test( 'is not eligible for the onboarding flow once a site exists that was not created by onboarding', () => {
			mockSite( { siteCreationFlow: 'newsletter' } );

			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { ...SIGNUP_PARAMS, siteId: SITE_ID } )
			);

			expect( mockUseExperiment ).toHaveBeenCalledWith( EXPERIMENT_NAME, { isEligible: false } );
			expect( result.current ).toEqual( INELIGIBLE_RESULT );
		} );

		test( 'is eligible for logged-in plans pages when the site was created by onboarding after launch', () => {
			mockSite();

			renderHook( () => usePlanDifferentiatorsExperiment( SITE_PARAMS ) );

			expect( mockUseExperiment ).toHaveBeenCalledWith( EXPERIMENT_NAME, { isEligible: true } );
		} );

		test( 'is not eligible for logged-in plans pages when the site was not created by onboarding', () => {
			mockSite( { siteCreationFlow: 'newsletter' } );

			const { result } = renderHook( () => usePlanDifferentiatorsExperiment( SITE_PARAMS ) );

			expect( mockUseExperiment ).toHaveBeenCalledWith( EXPERIMENT_NAME, { isEligible: false } );
			expect( result.current ).toEqual( INELIGIBLE_RESULT );
		} );

		test.each( [
			[ 'before launch', '2026-11-04T23:59:59+00:00' ],
			[ 'exactly at launch', '2026-11-05T00:00:00+00:00' ],
			[ 'before launch in another timezone', '2026-11-05T01:00:00+02:00' ],
		] )(
			'is not eligible for logged-in plans pages when the site was created %s',
			( _, createdAt ) => {
				mockSite( { createdAt } );

				const { result } = renderHook( () => usePlanDifferentiatorsExperiment( SITE_PARAMS ) );

				expect( mockUseExperiment ).toHaveBeenCalledWith( EXPERIMENT_NAME, { isEligible: false } );
				expect( result.current ).toEqual( INELIGIBLE_RESULT );
			}
		);

		test( 'is not eligible when the plans page is for another site', () => {
			mockSite();

			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { ...SITE_PARAMS, siteId: 456 } )
			);

			expect( mockUseExperiment ).toHaveBeenCalledWith( EXPERIMENT_NAME, { isEligible: false } );
			expect( result.current.isExperimentEligible ).toBe( false );
		} );

		test( 'is not eligible for logged-in plans pages when the site has no creation date', () => {
			mockSite( { createdAt: '' } );

			const { result } = renderHook( () => usePlanDifferentiatorsExperiment( SITE_PARAMS ) );

			expect( mockUseExperiment ).toHaveBeenCalledWith( EXPERIMENT_NAME, { isEligible: false } );
			expect( result.current ).toEqual( INELIGIBLE_RESULT );
		} );
	} );

	describe( 'variants', () => {
		test( 'shows AI credits in the normal order for the ai_credits variant', () => {
			mockUseExperiment.mockReturnValue( [ false, { variationName: 'ai_credits' } ] );

			const { result } = renderHook( () => usePlanDifferentiatorsExperiment( SIGNUP_PARAMS ) );

			expect( result.current ).toEqual( {
				...CONTROL_RESULT,
				variant: 'ai_credits',
				showAiCredits: true,
			} );
		} );

		test( 'shows AI credits in the reversed order for the ai_credits_reversed_order variant', () => {
			mockUseExperiment.mockReturnValue( [
				false,
				{ variationName: 'ai_credits_reversed_order' },
			] );

			const { result } = renderHook( () => usePlanDifferentiatorsExperiment( SIGNUP_PARAMS ) );

			expect( result.current ).toEqual( {
				...CONTROL_RESULT,
				variant: 'ai_credits_reversed_order',
				showAiCredits: true,
				useReversedPlanOrder: true,
			} );
		} );

		test( 'keeps the normal order for intents that curate their own plan mix', () => {
			mockUseExperiment.mockReturnValue( [
				false,
				{ variationName: 'ai_credits_reversed_order' },
			] );

			const { result } = renderHook( () =>
				usePlanDifferentiatorsExperiment( { ...SIGNUP_PARAMS, intent: 'plans-newsletter' } )
			);

			expect( result.current.showAiCredits ).toBe( true );
			expect( result.current.useReversedPlanOrder ).toBe( false );
		} );

		test( 'falls back to control for an unknown variation', () => {
			mockUseExperiment.mockReturnValue( [ false, { variationName: 'unknown' } ] );

			const { result } = renderHook( () => usePlanDifferentiatorsExperiment( SIGNUP_PARAMS ) );

			expect( result.current ).toEqual( CONTROL_RESULT );
		} );

		test( 'falls back to control while the assignment loads', () => {
			mockUseExperiment.mockReturnValue( [ true, null ] );

			const { result } = renderHook( () => usePlanDifferentiatorsExperiment( SIGNUP_PARAMS ) );

			expect( result.current ).toEqual( { ...CONTROL_RESULT, isLoading: true } );
		} );

		test( 'reports loading instead of control while the site loads', () => {
			mockUseExperiment.mockReturnValue( [ false, null ] );

			const { result } = renderHook( () => usePlanDifferentiatorsExperiment( SITE_PARAMS ) );

			expect( mockUseExperiment ).toHaveBeenCalledWith( EXPERIMENT_NAME, { isEligible: false } );
			expect( result.current ).toEqual( { ...INELIGIBLE_RESULT, isLoading: true } );
		} );

		test( 'reports the assigned variant once the site loads', () => {
			mockUseExperiment.mockReturnValue( [ false, null ] );

			const { result, rerender } = renderHook( () =>
				usePlanDifferentiatorsExperiment( SITE_PARAMS )
			);
			expect( result.current.isLoading ).toBe( true );

			mockSite();
			mockUseExperiment.mockReturnValue( [ false, { variationName: 'ai_credits' } ] );
			rerender();

			expect( result.current ).toEqual( {
				...CONTROL_RESULT,
				variant: 'ai_credits',
				showAiCredits: true,
			} );
		} );
	} );
} );
