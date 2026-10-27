/**
 * Tests for the onboarding domain search results experiment hook.
 *
 * Run with:
 * yarn test-client client/landing/stepper/declarative-flow/internals/steps-repository/domain-search/test/results-experiment.ts
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { useDomainSearchResultsExperiment } from '../results-experiment';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseExperiment = useExperiment as jest.MockedFunction< typeof useExperiment >;

const assignedTo = ( variationName: string | null ) =>
	mockUseExperiment.mockReturnValue( [
		false,
		{
			experimentName: 'calypso_signup_onboarding_domain_results_variants_202610',
			variationName,
			retrievedTimestamp: Date.now(),
			ttl: 60,
		},
	] );

describe( 'useDomainSearchResultsExperiment', () => {
	beforeEach( () => {
		mockUseExperiment.mockReset();
	} );

	it( 'only makes the onboarding flow eligible', () => {
		mockUseExperiment.mockReturnValue( [ false, null ] );

		renderHook( () => useDomainSearchResultsExperiment( 'onboarding' ) );
		expect( mockUseExperiment ).toHaveBeenLastCalledWith(
			'calypso_signup_onboarding_domain_results_variants_202610',
			{ isEligible: true }
		);

		renderHook( () => useDomainSearchResultsExperiment( 'ai-site-builder-onboarding' ) );
		expect( mockUseExperiment ).toHaveBeenLastCalledWith(
			'calypso_signup_onboarding_domain_results_variants_202610',
			{ isEligible: false }
		);
	} );

	it( 'returns the assigned variation', () => {
		assignedTo( 'tone_down_purchase' );

		const { result } = renderHook( () => useDomainSearchResultsExperiment( 'onboarding' ) );

		expect( result.current ).toEqual( { isLoading: false, variation: 'tone_down_purchase' } );
	} );

	it( 'falls back to control without an assignment or with an unknown variation', () => {
		assignedTo( null );
		expect(
			renderHook( () => useDomainSearchResultsExperiment( 'onboarding' ) ).result.current.variation
		).toBe( 'control' );

		assignedTo( 'free_domain_banner_copy' );
		expect(
			renderHook( () => useDomainSearchResultsExperiment( 'onboarding' ) ).result.current.variation
		).toBe( 'control' );
	} );

	it( 'reports loading while the assignment is fetched', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderHook( () => useDomainSearchResultsExperiment( 'onboarding' ) );

		expect( result.current ).toEqual( { isLoading: true, variation: 'control' } );
	} );
} );
