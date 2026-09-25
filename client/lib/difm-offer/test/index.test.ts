/**
 * @jest-environment jsdom
 */

import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import {
	DIFM_OFFER_EXPERIMENT,
	DIFM_OFFER_MAX_SITE_AGE_DAYS,
	isEligibleForDifmOffer,
	normalizeDifmOfferVariation,
	useDifmOffer,
} from '../index';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseExperiment = jest.mocked( useExperiment );
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse( '2026-09-24T12:00:00Z' );

function isoDaysAgo( days: number, now: number = NOW ): string {
	return new Date( now - days * MS_PER_DAY ).toISOString();
}

function eligibleInput( now: number = NOW ) {
	return {
		planSlug: PLAN_FREE,
		siteCreatedAt: isoDaysAgo( 1, now ),
		localeSlug: 'en',
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

describe( 'isEligibleForDifmOffer', () => {
	it( 'accepts free, personal and premium plans', () => {
		for ( const planSlug of [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ] ) {
			expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug }, NOW ) ).toBe( true );
		}
	} );

	it( 'rejects business, commerce and unknown plans', () => {
		for ( const planSlug of [ PLAN_BUSINESS, PLAN_ECOMMERCE, 'not-a-plan' ] ) {
			expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug }, NOW ) ).toBe( false );
		}
	} );

	it( 'rejects Jetpack plans that share a type with an eligible plan', () => {
		for ( const planSlug of [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM ] ) {
			expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug }, NOW ) ).toBe( false );
		}
	} );

	it( 'accepts a site exactly at the maximum age and rejects one a millisecond older', () => {
		const maxAgeMs = DIFM_OFFER_MAX_SITE_AGE_DAYS * MS_PER_DAY;
		expect(
			isEligibleForDifmOffer(
				{ ...eligibleInput(), siteCreatedAt: new Date( NOW - maxAgeMs ).toISOString() },
				NOW
			)
		).toBe( true );
		expect(
			isEligibleForDifmOffer(
				{ ...eligibleInput(), siteCreatedAt: new Date( NOW - maxAgeMs - 1 ).toISOString() },
				NOW
			)
		).toBe( false );
	} );

	it( 'rejects a future or unparseable creation date', () => {
		expect(
			isEligibleForDifmOffer( { ...eligibleInput(), siteCreatedAt: isoDaysAgo( -1 ) }, NOW )
		).toBe( false );
		expect(
			isEligibleForDifmOffer( { ...eligibleInput(), siteCreatedAt: 'not-a-date' }, NOW )
		).toBe( false );
	} );

	it( 'accepts en and en-gb and rejects en-us and fr', () => {
		expect( isEligibleForDifmOffer( { ...eligibleInput(), localeSlug: 'en' }, NOW ) ).toBe( true );
		expect( isEligibleForDifmOffer( { ...eligibleInput(), localeSlug: 'en-gb' }, NOW ) ).toBe(
			true
		);
		expect( isEligibleForDifmOffer( { ...eligibleInput(), localeSlug: 'en-us' }, NOW ) ).toBe(
			false
		);
		expect( isEligibleForDifmOffer( { ...eligibleInput(), localeSlug: 'fr' }, NOW ) ).toBe( false );
	} );

	it( 'rejects input with a missing planSlug, siteCreatedAt or localeSlug', () => {
		expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug: undefined }, NOW ) ).toBe(
			false
		);
		expect( isEligibleForDifmOffer( { ...eligibleInput(), siteCreatedAt: undefined }, NOW ) ).toBe(
			false
		);
		expect( isEligibleForDifmOffer( { ...eligibleInput(), localeSlug: undefined }, NOW ) ).toBe(
			false
		);
	} );
} );

describe( 'normalizeDifmOfferVariation', () => {
	it( 'returns control for null and unrecognised variation names', () => {
		expect( normalizeDifmOfferVariation( null ) ).toBe( 'control' );
		expect( normalizeDifmOfferVariation( undefined ) ).toBe( 'control' );
		expect( normalizeDifmOfferVariation( 'rotating' ) ).toBe( 'control' );
	} );

	it( 'returns known variation names unchanged', () => {
		expect( normalizeDifmOfferVariation( 'skip_setup' ) ).toBe( 'skip_setup' );
		expect( normalizeDifmOfferVariation( 'expert_help' ) ).toBe( 'expert_help' );
		expect( normalizeDifmOfferVariation( 'no_time' ) ).toBe( 'no_time' );
	} );
} );

describe( 'useDifmOffer', () => {
	beforeEach( () => {
		mockUseExperiment.mockReset();
	} );

	it( 'keeps an ineligible user out of the experiment and returns control', () => {
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

	it( 'returns the assigned variation for an eligible user', () => {
		mockUseExperiment.mockReturnValue( [ false, createExperimentAssignment( 'expert_help' ) ] );

		const { result } = renderHook( () => useDifmOffer( eligibleInput( Date.now() ) ) );

		expect( mockUseExperiment ).toHaveBeenCalledWith( DIFM_OFFER_EXPERIMENT, {
			isEligible: true,
		} );
		expect( result.current ).toEqual( {
			isEligible: true,
			isLoading: false,
			variation: 'expert_help',
		} );
	} );

	it( 'returns control for an eligible user with a null assignment', () => {
		mockUseExperiment.mockReturnValue( [ false, null ] );

		const { result } = renderHook( () => useDifmOffer( eligibleInput( Date.now() ) ) );

		expect( result.current.variation ).toBe( 'control' );
	} );

	it( 'returns control for an eligible user with an unrecognised variation', () => {
		mockUseExperiment.mockReturnValue( [ false, createExperimentAssignment( 'rotating' ) ] );

		const { result } = renderHook( () => useDifmOffer( eligibleInput( Date.now() ) ) );

		expect( result.current.variation ).toBe( 'control' );
	} );

	it( 'reports loading while an eligible user waits for an assignment', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderHook( () => useDifmOffer( eligibleInput( Date.now() ) ) );

		expect( result.current ).toEqual( {
			isEligible: true,
			isLoading: true,
			variation: 'control',
		} );
	} );
} );
