/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/data-stores', () => ( {
	Plans: {
		usePlans: jest.fn(),
	},
} ) );
jest.mock( '@automattic/i18n-utils', () => ( {
	useLocale: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/utils/get-flow-from-url', () => ( {
	getFlowFromURL: jest.fn( () => null ),
} ) );
jest.mock( 'calypso/lib/akismet/is-akismet-checkout', () => jest.fn( () => false ) );
jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );
jest.mock( 'calypso/lib/jetpack/is-jetpack-checkout', () => jest.fn( () => false ) );
jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteFlowName: jest.fn( () => null ),
} ) );
jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

import { Plans } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { renderHook } from '@testing-library/react';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { useExperiment } from 'calypso/lib/explat';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import {
	useRenewalPricingExperiment,
	isRenewalPricingTreatment,
} from '../use-renewal-price-experiment';

function mockPlansWithCurrency( currencyCode: string | undefined ) {
	( Plans.usePlans as jest.Mock ).mockReturnValue( {
		data: currencyCode ? { plan: { pricing: { currencyCode } } } : undefined,
	} );
}

function mockUserDate( date: string | null ) {
	( useSelector as jest.Mock ).mockImplementation( ( selector ) =>
		selector( {
			currentUser: {
				id: date !== null ? 1 : null,
				user: date !== null ? { date } : null,
			},
		} )
	);
}

describe( 'useRenewalPricingExperiment', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		( useLocale as jest.Mock ).mockReturnValue( 'en' );
		mockPlansWithCurrency( 'USD' );
		mockUserDate( null );
		( isAkismetCheckout as jest.Mock ).mockReturnValue( false );
		( isJetpackCheckout as jest.Mock ).mockReturnValue( false );
		( getSignupCompleteFlowName as jest.Mock ).mockReturnValue( null );
		( useExperiment as jest.Mock ).mockReturnValue( [ false, null ] );
	} );

	it( 'returns crossed_price for logged-out users when all conditions are met', () => {
		const { result } = renderHook( () => useRenewalPricingExperiment() );
		expect( result.current ).toEqual( [ false, 'crossed_price' ] );
	} );

	it( 'blocks V1 until V2 is not loading', () => {
		( useExperiment as jest.Mock ).mockReturnValue( [ true, null ] );
		const { result } = renderHook( () => useRenewalPricingExperiment() );
		expect( result.current ).toEqual( [ true, null ] );
	} );

	it( 'blocks when V2 non-USD is loading', () => {
		mockPlansWithCurrency( 'EUR' ); // non-USD → V2 non-USD is eligible and may be loading
		( useExperiment as jest.Mock )
			.mockReturnValueOnce( [ false, null ] ) // V2 USD: ineligible for EUR, returns immediately
			.mockReturnValueOnce( [ true, null ] ); // V2 non-USD: eligible, still loading
		const { result } = renderHook( () => useRenewalPricingExperiment() );
		expect( result.current ).toEqual( [ true, null ] );
	} );

	it( 'falls back to V1 when V2 is loaded and assignment is null (control)', () => {
		( useExperiment as jest.Mock ).mockReturnValue( [ false, null ] );
		const { result } = renderHook( () => useRenewalPricingExperiment() );
		expect( result.current ).toEqual( [ false, 'crossed_price' ] );
	} );

	it( 'uses V2 USD variationName when assigned', () => {
		( useExperiment as jest.Mock )
			.mockReturnValueOnce( [ false, { variationName: 'usd_variant' } ] ) // V2 USD assigned
			.mockReturnValueOnce( [ false, null ] ); // V2 non-USD not assigned
		const { result } = renderHook( () => useRenewalPricingExperiment() );
		expect( result.current ).toEqual( [ false, 'usd_variant' ] );
	} );

	it( 'uses V2 non-USD variationName when assigned', () => {
		mockPlansWithCurrency( 'EUR' );
		( useExperiment as jest.Mock )
			.mockReturnValueOnce( [ false, null ] ) // V2 USD not assigned
			.mockReturnValueOnce( [ false, { variationName: 'non_usd_variant' } ] ); // V2 non-USD assigned
		const { result } = renderHook( () => useRenewalPricingExperiment() );
		expect( result.current ).toEqual( [ false, 'non_usd_variant' ] );
	} );

	it( 'uses V1 when both V2s are ineligible', () => {
		( isJetpackCheckout as jest.Mock ).mockReturnValue( true ); // makes both V2s ineligible by isEligibleForExperiment
		const { result } = renderHook( () => useRenewalPricingExperiment() );
		expect( result.current ).toEqual( [ false, null ] ); // V1 also ineligible because Jetpack checkout is excluded
	} );

	describe( 'locale gating', () => {
		it( 'disqualifies non-English locales from V1 and V2 USD', () => {
			( useLocale as jest.Mock ).mockReturnValue( 'fr' );
			// V2 non-USD is eligible for non-EN locale; mock returns null (control/not assigned)
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'qualifies English locale for V1', () => {
			( useLocale as jest.Mock ).mockReturnValue( 'en' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current[ 1 ] ).toBe( 'crossed_price' );
		} );

		it( 'skips V2 USD API call for non-EN locale', () => {
			( useLocale as jest.Mock ).mockReturnValue( 'fr' );
			renderHook( () => useRenewalPricingExperiment() );
			expect( useExperiment ).toHaveBeenNthCalledWith(
				1,
				'wpcom_renewal_pricing_increase_v2_usd_202604_v2',
				expect.objectContaining( { isEligible: false } )
			);
		} );

		it( 'makes V2 non-USD API call for non-EN locale regardless of currency', () => {
			( useLocale as jest.Mock ).mockReturnValue( 'fr' );
			// USD currency — normally ineligible for non-USD experiment, but non-EN locale overrides
			mockPlansWithCurrency( 'USD' );
			renderHook( () => useRenewalPricingExperiment() );
			expect( useExperiment ).toHaveBeenNthCalledWith(
				2,
				'wpcom_renewal_pricing_increase_v2_non_usd_202604_v1',
				expect.objectContaining( { isEligible: true } )
			);
		} );

		it( 'non-EN locale with V2 non-USD assignment returns that assignment', () => {
			( useLocale as jest.Mock ).mockReturnValue( 'fr' );
			( useExperiment as jest.Mock )
				.mockReturnValueOnce( [ false, null ] ) // V2 USD: ineligible
				.mockReturnValueOnce( [ false, { variationName: 'non_usd_variant' } ] ); // V2 non-USD assigned
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, 'non_usd_variant' ] );
		} );

		it( 'non-EN locale does not wait for plans to load before calling V2 non-USD API', () => {
			( useLocale as jest.Mock ).mockReturnValue( 'fr' );
			mockPlansWithCurrency( undefined ); // plans not yet loaded
			renderHook( () => useRenewalPricingExperiment() );
			expect( useExperiment ).toHaveBeenNthCalledWith(
				2,
				'wpcom_renewal_pricing_increase_v2_non_usd_202604_v1',
				expect.objectContaining( { isEligible: true } )
			);
		} );
	} );

	describe( 'currency gating', () => {
		it( 'disqualifies non-USD currencies from V1', () => {
			mockPlansWithCurrency( 'EUR' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'disqualifies when plans data has not loaded yet', () => {
			mockPlansWithCurrency( undefined );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'skips V2 non-USD API call for EN + USD users', () => {
			// EN locale + USD currency → both conditions for non-USD experiment fail
			renderHook( () => useRenewalPricingExperiment() );
			expect( useExperiment ).toHaveBeenNthCalledWith(
				2,
				'wpcom_renewal_pricing_increase_v2_non_usd_202604_v1',
				expect.objectContaining( { isEligible: false } )
			);
		} );

		it( 'skips V2 USD API call for non-USD users', () => {
			mockPlansWithCurrency( 'EUR' );
			renderHook( () => useRenewalPricingExperiment() );
			expect( useExperiment ).toHaveBeenNthCalledWith(
				1,
				'wpcom_renewal_pricing_increase_v2_usd_202604_v2',
				expect.objectContaining( { isEligible: false } )
			);
		} );

		it( 'skips both V2 API calls for EN locale when plans are not loaded', () => {
			// EN locale: V2 USD needs currency=USD (not loaded), V2 non-USD needs currency≠USD (unknown)
			mockPlansWithCurrency( undefined );
			renderHook( () => useRenewalPricingExperiment() );
			expect( useExperiment ).toHaveBeenNthCalledWith(
				1,
				'wpcom_renewal_pricing_increase_v2_usd_202604_v2',
				expect.objectContaining( { isEligible: false } )
			);
			expect( useExperiment ).toHaveBeenNthCalledWith(
				2,
				'wpcom_renewal_pricing_increase_v2_non_usd_202604_v1',
				expect.objectContaining( { isEligible: false } )
			);
		} );
	} );

	describe( 'checkout type gating', () => {
		it( 'disqualifies Akismet checkout', () => {
			( isAkismetCheckout as jest.Mock ).mockReturnValue( true );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'disqualifies Jetpack checkout', () => {
			( isJetpackCheckout as jest.Mock ).mockReturnValue( true );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );
	} );

	describe( 'flow gating', () => {
		it( 'disqualifies onboarding-pm flow', () => {
			const { result } = renderHook( () => useRenewalPricingExperiment( 'onboarding-pm' ) );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'disqualifies onboarding-affiliate flow', () => {
			const { result } = renderHook( () => useRenewalPricingExperiment( 'onboarding-affiliate' ) );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'qualifies other flows', () => {
			const { result } = renderHook( () => useRenewalPricingExperiment( 'onboarding' ) );
			expect( result.current[ 1 ] ).toBe( 'crossed_price' );
		} );

		it( 'falls back to flow from storage', () => {
			( getSignupCompleteFlowName as jest.Mock ).mockReturnValue( 'onboarding-pm' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );
	} );

	describe( 'registration date cutoff', () => {
		it( 'qualifies users registered on the cutoff date', () => {
			mockUserDate( '2026-03-31T11:00:00Z' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current[ 1 ] ).toBe( 'crossed_price' );
		} );

		it( 'qualifies users registered after the cutoff date', () => {
			mockUserDate( '2026-06-15T12:00:00Z' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current[ 1 ] ).toBe( 'crossed_price' );
		} );

		it( 'disqualifies users registered before the cutoff date', () => {
			mockUserDate( '2026-03-03T23:59:59Z' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'disqualifies long-standing users', () => {
			mockUserDate( '2020-01-01T00:00:00Z' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'qualifies logged-out users (no registration date)', () => {
			mockUserDate( null );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current[ 1 ] ).toBe( 'crossed_price' );
		} );
	} );
} );

describe( 'isRenewalPricingTreatment', () => {
	it( 'returns true for crossed_price variation', () => {
		expect( isRenewalPricingTreatment( 'crossed_price' ) ).toBe( true );
	} );

	it( 'returns false for null', () => {
		expect( isRenewalPricingTreatment( null ) ).toBe( false );
	} );

	it( 'returns false for undefined', () => {
		expect( isRenewalPricingTreatment( undefined ) ).toBe( false );
	} );

	it( 'returns true for unrelated variation names', () => {
		expect( isRenewalPricingTreatment( 'anything' ) ).toBe( true );
	} );
} );
