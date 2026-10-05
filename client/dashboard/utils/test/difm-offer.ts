/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import {
	DIFM_OFFER_EXPERIMENT,
	DIFM_OFFER_MAX_SITE_AGE_DAYS,
	getDifmOfferCopy,
	isEligibleForDifmOffer,
	normalizeCreatedAt,
	normalizeDifmOfferVariation,
	useDifmOffer,
} from '../difm-offer';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseExperiment = jest.mocked( useExperiment );

// Plan slugs from packages/calypso-products/src/constants, which the dashboard cannot import.
const PLAN_FREE = 'free_plan';
const PLAN_PERSONAL = 'personal-bundle';
const PLAN_PREMIUM = 'value_bundle';
const PLAN_BUSINESS = 'business-bundle';
const PLAN_ECOMMERCE = 'ecommerce-bundle';
const PLAN_JETPACK_FREE = 'jetpack_free';
const PLAN_JETPACK_PERSONAL = 'jetpack_personal';
const PLAN_JETPACK_PREMIUM = 'jetpack_premium';
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

	it( 'accepts the monthly, 2-year and 3-year terms of personal and premium', () => {
		for ( const planSlug of [
			'personal-bundle-monthly',
			'personal-bundle-2y',
			'personal-bundle-3y',
			'value_bundle_monthly',
			'value_bundle-2y',
			'value_bundle-3y',
		] ) {
			expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug }, NOW ) ).toBe( true );
		}
	} );

	it( 'rejects the Woo hosted free plans', () => {
		for ( const planSlug of [ 'woo_hosted_free_plan', 'woo_hosted_free_trial_plan_monthly' ] ) {
			expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug }, NOW ) ).toBe( false );
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

	it( 'rejects an unparseable creation date', () => {
		expect(
			isEligibleForDifmOffer( { ...eligibleInput(), siteCreatedAt: 'not-a-date' }, NOW )
		).toBe( false );
	} );

	it( 'accepts a just-created site even when it appears slightly in the future', () => {
		const justCreated = new Date( NOW ).toISOString();
		const slightlyFuture = new Date( NOW + 10 * 60 * 1000 ).toISOString();
		expect(
			isEligibleForDifmOffer( { ...eligibleInput(), siteCreatedAt: justCreated }, NOW )
		).toBe( true );
		expect(
			isEligibleForDifmOffer( { ...eligibleInput(), siteCreatedAt: slightlyFuture }, NOW )
		).toBe( true );
	} );

	it( 'accepts a space-separated GMT creation date within the window', () => {
		expect(
			isEligibleForDifmOffer( { ...eligibleInput(), siteCreatedAt: '2026-09-24 11:00:00' }, NOW )
		).toBe( true );
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

describe( 'normalizeCreatedAt', () => {
	it( 'rewrites a space-separated date to explicit ISO 8601 UTC', () => {
		expect( normalizeCreatedAt( '2026-09-24 11:00:00' ) ).toBe( '2026-09-24T11:00:00Z' );
	} );

	it( 'passes an ISO 8601 date through unchanged', () => {
		expect( normalizeCreatedAt( '2026-09-24T11:00:00+00:00' ) ).toBe( '2026-09-24T11:00:00+00:00' );
		expect( normalizeCreatedAt( '2026-09-24T11:00:00Z' ) ).toBe( '2026-09-24T11:00:00Z' );
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

describe( 'getDifmOfferCopy', () => {
	it( 'returns no copy for control', () => {
		expect( getDifmOfferCopy( 'control' ) ).toBeNull();
	} );

	it( 'returns a distinct title for each copy variation, with the same CTA', () => {
		const copies = ( [ 'skip_setup', 'expert_help', 'no_time' ] as const ).map( getDifmOfferCopy );
		const titles = copies.map( ( copy ) => copy?.title );

		expect( new Set( titles ).size ).toBe( 3 );
		for ( const copy of copies ) {
			expect( copy?.ctaText ).toBe( 'See the offer' );
		}
	} );
} );
