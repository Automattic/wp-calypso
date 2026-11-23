/**
 * @vitest-environment jsdom
 */

import { DotcomPlans } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useExperiment } from 'calypso/lib/explat';
import {
	DIFM_OFFER_EXPERIMENT,
	DIFM_OFFER_FORCE_TREATMENT_FLAG,
} from '../../../../utils/difm-offer';
import { useDifmOffer } from '../use-difm-offer';

vi.mock( 'calypso/lib/explat', () => ( {
	useExperiment: vi.fn(),
} ) );

const mockUseExperiment = vi.mocked( useExperiment );

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function eligibleInput( now: number ) {
	return {
		planSlug: DotcomPlans.FREE_PLAN,
		siteCreatedAt: new Date( now - MS_PER_DAY ).toISOString(),
		localeSlug: 'en',
		isA4ADevSite: false,
	};
}

function createExperimentAssignment( variationName: string | null ) {
	return {
		experimentName: DIFM_OFFER_EXPERIMENT,
		variationName,
		retrievedTimestamp: Date.now(),
		ttl: 60,
	};
}

describe( 'useDifmOffer', () => {
	beforeEach( () => {
		mockUseExperiment.mockReset();
	} );

	afterEach( () => {
		config.disable( DIFM_OFFER_FORCE_TREATMENT_FLAG );
	} );

	test( 'keeps an ineligible user out of the experiment and returns control', () => {
		mockUseExperiment.mockReturnValue( [ false, null ] );

		const { result } = renderHook( () =>
			useDifmOffer( { ...eligibleInput( Date.now() ), localeSlug: 'fr' } )
		);

		expect( mockUseExperiment ).toHaveBeenCalledWith( DIFM_OFFER_EXPERIMENT, {
			isEligible: false,
		} );
		expect( result.current ).toEqual( {
			isEligible: false,
			isLoading: false,
			variation: 'control',
		} );
	} );

	test( 'returns the assigned variation for an eligible user', () => {
		mockUseExperiment.mockReturnValue( [
			false,
			createExperimentAssignment( 'no_time_to_build' ),
		] );

		const { result } = renderHook( () => useDifmOffer( eligibleInput( Date.now() ) ) );

		expect( mockUseExperiment ).toHaveBeenCalledWith( DIFM_OFFER_EXPERIMENT, {
			isEligible: true,
		} );
		expect( result.current ).toEqual( {
			isEligible: true,
			isLoading: false,
			variation: 'no_time_to_build',
		} );
	} );

	test( 'returns control for an eligible user with a null assignment', () => {
		mockUseExperiment.mockReturnValue( [ false, null ] );

		const { result } = renderHook( () => useDifmOffer( eligibleInput( Date.now() ) ) );

		expect( result.current.variation ).toBe( 'control' );
	} );

	test( 'returns control for an eligible user with an unrecognised variation', () => {
		mockUseExperiment.mockReturnValue( [ false, createExperimentAssignment( 'rotating' ) ] );

		const { result } = renderHook( () => useDifmOffer( eligibleInput( Date.now() ) ) );

		expect( result.current.variation ).toBe( 'control' );
	} );

	test( 'returns treatment without an assignment when the QA flag is on', () => {
		config.enable( DIFM_OFFER_FORCE_TREATMENT_FLAG );
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderHook( () => useDifmOffer( eligibleInput( Date.now() ) ) );

		expect( mockUseExperiment ).toHaveBeenCalledWith( DIFM_OFFER_EXPERIMENT, {
			isEligible: false,
		} );
		expect( result.current ).toEqual( {
			isEligible: true,
			isLoading: false,
			variation: 'no_time_to_build',
		} );
	} );

	test( 'keeps an ineligible user in control when the QA flag is on', () => {
		config.enable( DIFM_OFFER_FORCE_TREATMENT_FLAG );
		mockUseExperiment.mockReturnValue( [ false, null ] );

		const { result } = renderHook( () =>
			useDifmOffer( { ...eligibleInput( Date.now() ), localeSlug: 'fr' } )
		);

		expect( result.current.variation ).toBe( 'control' );
	} );

	test( 'reports loading while an eligible user waits for an assignment', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderHook( () => useDifmOffer( eligibleInput( Date.now() ) ) );

		expect( result.current ).toEqual( {
			isEligible: true,
			isLoading: true,
			variation: 'control',
		} );
	} );
} );
