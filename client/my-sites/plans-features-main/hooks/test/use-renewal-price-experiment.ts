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
	} );

	it( 'returns crossed_price for logged-out users when all conditions are met', () => {
		const { result } = renderHook( () => useRenewalPricingExperiment() );
		expect( result.current ).toEqual( [ false, 'crossed_price' ] );
	} );

	describe( 'locale gating', () => {
		it( 'disqualifies non-English locales', () => {
			( useLocale as jest.Mock ).mockReturnValue( 'fr' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'qualifies English locale', () => {
			( useLocale as jest.Mock ).mockReturnValue( 'en' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current[ 1 ] ).toBe( 'crossed_price' );
		} );
	} );

	describe( 'currency gating', () => {
		it( 'disqualifies non-USD currencies', () => {
			mockPlansWithCurrency( 'EUR' );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
		} );

		it( 'disqualifies when plans data has not loaded yet', () => {
			mockPlansWithCurrency( undefined );
			const { result } = renderHook( () => useRenewalPricingExperiment() );
			expect( result.current ).toEqual( [ false, null ] );
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
			mockUserDate( '2026-03-31T05:00:00Z' );
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

	it( 'returns false for unrelated variation names', () => {
		expect( isRenewalPricingTreatment( 'control' ) ).toBe( false );
	} );
} );
