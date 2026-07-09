/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import usePlansGridRedesignExperiment from '../use-plans-grid-redesign-experiment';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

const CONTROL_RESULT = {
	isLoading: false,
	variant: 'control',
	usePlansGridRedesign: false,
	usePlansGridRedesignNewDescription: false,
	showDifferentiatorHeader: false,
	usePlansGridRedesignFeatures: false,
	showEnterpriseBottomCard: false,
	showWooCommerceBottomCard: false,
	isExperimentEligible: true,
};

const INELIGIBLE_RESULT = {
	...CONTROL_RESULT,
	isExperimentEligible: false,
};

const mockUseExperiment = useExperiment as jest.Mock;
const mockUseSelector = useSelector as jest.Mock;

function mockSite( {
	isGatingBusinessQ1,
	siteCreationFlow = 'onboarding',
}: {
	isGatingBusinessQ1?: boolean;
	siteCreationFlow?: string | null;
} = {} ) {
	mockUseSelector.mockImplementation( () =>
		isGatingBusinessQ1 !== undefined
			? {
					ID: 123,
					options: {
						is_gating_business_q1: isGatingBusinessQ1,
						site_creation_flow: siteCreationFlow,
					},
			  }
			: null
	);
}

describe( 'usePlansGridRedesignExperiment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSite();
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'control' } ] );
	} );

	test( 'is eligible for onboarding signups without a siteId', () => {
		renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: null,
			} )
		);

		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_pricing_differentiation_202607', {
			isEligible: true,
		} );
	} );

	test( 'is eligible for logged-in plans pages when the site has the gating flag and was created by onboarding', () => {
		mockSite( { isGatingBusinessQ1: true, siteCreationFlow: 'onboarding' } );

		renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: null,
				isInSignup: false,
				siteId: 123,
			} )
		);

		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_pricing_differentiation_202607', {
			isEligible: true,
		} );
	} );

	test( 'is not eligible for logged-in plans pages when the site has the gating flag but was not created by onboarding', () => {
		mockSite( { isGatingBusinessQ1: true, siteCreationFlow: 'newsletter' } );

		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: null,
				isInSignup: false,
				siteId: 123,
			} )
		);

		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_pricing_differentiation_202607', {
			isEligible: false,
		} );
		expect( result.current ).toEqual( INELIGIBLE_RESULT );
	} );

	test( 'is not eligible for onboarding flows with an existing site and no gating flag', () => {
		mockSite( { isGatingBusinessQ1: false, siteCreationFlow: 'onboarding' } );

		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: 123,
			} )
		);

		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_pricing_differentiation_202607', {
			isEligible: false,
		} );
		expect( result.current ).toEqual( INELIGIBLE_RESULT );
	} );

	test( 'returns control for eligible users assigned to control', () => {
		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: null,
			} )
		);

		expect( result.current ).toEqual( CONTROL_RESULT );
	} );

	test( 'returns control while the experiment assignment is loading', () => {
		mockUseExperiment.mockReturnValue( [ true, { variationName: 'six_plan_new_features' } ] );

		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: null,
			} )
		);

		expect( result.current ).toEqual( {
			...CONTROL_RESULT,
			isLoading: true,
		} );
	} );

	test( 'falls back to control for an unknown variation name', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'unknown_future_arm' } ] );

		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: null,
			} )
		);

		expect( result.current ).toEqual( CONTROL_RESULT );
	} );

	test( 'enables the differentiator header for six_plan_new_features', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'six_plan_new_features' } ] );

		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: null,
			} )
		);

		expect( result.current ).toEqual( {
			...CONTROL_RESULT,
			variant: 'six_plan_new_features',
			usePlansGridRedesign: true,
			usePlansGridRedesignNewDescription: false,
			showDifferentiatorHeader: true,
			usePlansGridRedesignFeatures: true,
		} );
	} );

	test( 'enables the redesigned plan descriptions for six_plan_new_description', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'six_plan_new_description' } ] );

		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: null,
			} )
		);

		expect( result.current ).toEqual( {
			...CONTROL_RESULT,
			variant: 'six_plan_new_description',
			usePlansGridRedesign: true,
			usePlansGridRedesignNewDescription: true,
		} );
	} );

	test( 'does not enable the redesigned plan descriptions for six_plan_new_design', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'six_plan_new_design' } ] );

		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: null,
			} )
		);

		expect( result.current ).toEqual( {
			...CONTROL_RESULT,
			variant: 'six_plan_new_design',
			usePlansGridRedesign: true,
		} );
	} );

	test( 'enables the Enterprise bottom card for five_plan_new_description', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'five_plan_new_description' } ] );

		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: null,
			} )
		);

		expect( result.current ).toEqual( {
			...CONTROL_RESULT,
			variant: 'five_plan_new_description',
			usePlansGridRedesign: true,
			usePlansGridRedesignNewDescription: true,
			showEnterpriseBottomCard: true,
		} );
	} );

	test( 'enables the WooCommerce bottom card for four_plan_new_description', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'four_plan_new_description' } ] );

		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( {
				flowName: 'onboarding',
				isInSignup: true,
				siteId: null,
			} )
		);

		expect( result.current ).toEqual( {
			...CONTROL_RESULT,
			variant: 'four_plan_new_description',
			usePlansGridRedesign: true,
			usePlansGridRedesignNewDescription: true,
			showWooCommerceBottomCard: true,
		} );
	} );
} );
