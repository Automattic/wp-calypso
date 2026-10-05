/**
 * @jest-environment jsdom
 */

import { DotcomPlans, JetpackPlans, WooHostedPlans } from '@automattic/api-core';
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse( '2026-09-24T12:00:00Z' );

function isoDaysAgo( days: number, now: number = NOW ): string {
	return new Date( now - days * MS_PER_DAY ).toISOString();
}

function eligibleInput( now: number = NOW ) {
	return {
		planSlug: DotcomPlans.FREE_PLAN,
		siteCreatedAt: isoDaysAgo( 1, now ),
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

describe( 'isEligibleForDifmOffer', () => {
	it( 'accepts free, personal and premium plans', () => {
		for ( const planSlug of [ DotcomPlans.FREE_PLAN, DotcomPlans.PERSONAL, DotcomPlans.PREMIUM ] ) {
			expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug }, NOW ) ).toBe( true );
		}
	} );

	it( 'accepts the monthly, 2-year and 3-year terms of personal and premium', () => {
		for ( const planSlug of [
			DotcomPlans.PERSONAL_MONTHLY,
			DotcomPlans.PERSONAL_2_YEARS,
			DotcomPlans.PERSONAL_3_YEARS,
			DotcomPlans.PREMIUM_MONTHLY,
			DotcomPlans.PREMIUM_2_YEARS,
			DotcomPlans.PREMIUM_3_YEARS,
		] ) {
			expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug }, NOW ) ).toBe( true );
		}
	} );

	it( 'rejects the Woo hosted free plans', () => {
		for ( const planSlug of [
			WooHostedPlans.WOO_HOSTED_FREE_PLAN,
			WooHostedPlans.WOO_HOSTED_FREE_TRIAL_PLAN_MONTHLY,
		] ) {
			expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug }, NOW ) ).toBe( false );
		}
	} );

	it( 'rejects business, commerce and unknown plans', () => {
		for ( const planSlug of [ DotcomPlans.BUSINESS, DotcomPlans.ECOMMERCE, 'not-a-plan' ] ) {
			expect( isEligibleForDifmOffer( { ...eligibleInput(), planSlug }, NOW ) ).toBe( false );
		}
	} );

	it( 'rejects Jetpack plans that share a type with an eligible plan', () => {
		for ( const planSlug of [
			JetpackPlans.PLAN_JETPACK_FREE,
			JetpackPlans.PLAN_JETPACK_PERSONAL,
			JetpackPlans.PLAN_JETPACK_PREMIUM,
		] ) {
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

	it( 'rejects an A4A dev site, and a site whose A4A status is unknown', () => {
		expect( isEligibleForDifmOffer( { ...eligibleInput(), isA4ADevSite: true }, NOW ) ).toBe(
			false
		);
		expect( isEligibleForDifmOffer( { ...eligibleInput(), isA4ADevSite: undefined }, NOW ) ).toBe(
			false
		);
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

	it( 'returns the skip_setup copy', () => {
		expect( getDifmOfferCopy( 'skip_setup' ) ).toEqual( {
			title: 'Skip the setup',
			description:
				'For a limited time, our experts will bring your vision to life. Free with Business.',
			ctaText: 'See the offer',
		} );
	} );

	it( 'returns the expert_help copy', () => {
		expect( getDifmOfferCopy( 'expert_help' ) ).toEqual( {
			title: 'Expert help to get you started',
			description: 'A human builds your site based on your needs — free with Business.',
			ctaText: 'See the offer',
		} );
	} );

	it( 'returns the no_time copy', () => {
		expect( getDifmOfferCopy( 'no_time' ) ).toEqual( {
			title: 'No time to build your site?',
			description: 'Let us take that off your plate. Ready in 4 days and free with Business.',
			ctaText: 'See the offer',
		} );
	} );
} );
