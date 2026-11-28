/**
 * @vitest-environment jsdom
 */

import { disable, enable } from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useExperiment } from 'calypso/lib/explat';
import { useCancelOptionsExperiment } from '../use-cancel-options-experiment';
import type { Purchase } from '@automattic/api-core';

vi.mock( 'calypso/lib/explat', () => ( {
	useExperiment: vi.fn(),
} ) );

const mockUseExperiment = vi.mocked( useExperiment );

const experimentName = 'calypso_cancel_options_cards_202611_v1';

const planPurchase = {
	ID: 123,
	product_slug: 'value_bundle',
	is_plan: true,
	is_jetpack_plan_or_product: false,
} as Purchase;

function createExperimentAssignment( variationName: string | null ) {
	return {
		experimentName,
		variationName,
		retrievedTimestamp: Date.now(),
		ttl: 60,
	};
}

describe( 'useCancelOptionsExperiment', () => {
	beforeEach( () => {
		mockUseExperiment.mockReset();
	} );

	test.each( [
		[ true, 'new_flow' ],
		[ false, 'control' ],
		[ false, null ],
		[ false, 'treatment' ],
	] )(
		'sets showCards to %s for a plan owner assigned %s at the survey',
		( showCards, variationName ) => {
			mockUseExperiment.mockReturnValue( [ false, createExperimentAssignment( variationName ) ] );

			const { result } = renderHook( () => useCancelOptionsExperiment( planPurchase, true ) );

			expect( mockUseExperiment ).toHaveBeenCalledWith( experimentName, { isEligible: true } );
			expect( result.current ).toEqual( { isLoading: false, showCards } );
		}
	);

	test( 'reports loading and hides the cards while a plan owner waits for an assignment', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderHook( () => useCancelOptionsExperiment( planPurchase, true ) );

		expect( result.current ).toEqual( { isLoading: true, showCards: false } );
	} );

	test( 'keeps a Jetpack plan out of the experiment at the survey', () => {
		mockUseExperiment.mockReturnValue( [ false, null ] );
		const jetpackPlan = {
			...planPurchase,
			product_slug: 'jetpack_security_t1_yearly',
			is_jetpack_plan_or_product: true,
		} as Purchase;

		renderHook( () => useCancelOptionsExperiment( jetpackPlan, true ) );

		expect( mockUseExperiment ).toHaveBeenCalledWith( experimentName, { isEligible: false } );
	} );

	describe( 'with the cards flag on', () => {
		afterEach( () => {
			disable( 'purchases/cancel-options-cards' );
		} );

		test( 'shows the cards and skips the assignment', () => {
			enable( 'purchases/cancel-options-cards' );
			mockUseExperiment.mockReturnValue( [ true, null ] );

			const { result } = renderHook( () => useCancelOptionsExperiment( planPurchase, true ) );

			expect( mockUseExperiment ).toHaveBeenCalledWith( experimentName, { isEligible: false } );
			expect( result.current ).toEqual( { isLoading: false, showCards: true } );
		} );
	} );
} );
