import {
	fetchDomainContactInformation,
	fetchShoppingCart,
	fetchStripeConfiguration,
	fetchTransactionSupportedCountries,
	fetchUserPaymentMethods,
} from '@automattic/api-core';
import { queryClient } from '@automattic/api-queries';
import {
	earlyRequestKeys,
	resetEarlyRequests,
	startEarlyCheckoutRequests,
	startEarlyRequest,
	withEarlyQueryRequest,
	withEarlyRequest,
} from '../early-requests';
import type { QueryFunctionContext } from '@tanstack/react-query';

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchDomainContactInformation: jest.fn(),
	fetchShoppingCart: jest.fn(),
	fetchStripeConfiguration: jest.fn(),
	fetchTransactionSupportedCountries: jest.fn(),
	fetchUserPaymentMethods: jest.fn(),
} ) );

const queryContext = {} as QueryFunctionContext;

describe( 'early requests', () => {
	beforeEach( () => {
		resetEarlyRequests();
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'hands over a request that was started early instead of making it again', async () => {
		const request = jest.fn().mockResolvedValue( 'early' );
		startEarlyRequest( 'key', request );

		await expect( withEarlyRequest( 'key', request ) ).resolves.toBe( 'early' );
		expect( request ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'hands over an early request only once', async () => {
		const request = jest.fn().mockResolvedValueOnce( 'early' ).mockResolvedValueOnce( 'later' );
		startEarlyRequest( 'key', request );

		await withEarlyRequest( 'key', request );

		await expect( withEarlyRequest( 'key', request ) ).resolves.toBe( 'later' );
		expect( request ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'starts no early request once its consumer has fetched', async () => {
		await withEarlyRequest( 'key', jest.fn().mockResolvedValue( 'own' ) );
		const early = jest.fn().mockResolvedValue( 'early' );
		const request = jest.fn().mockResolvedValue( 'fresh' );

		startEarlyRequest( 'key', early );

		expect( early ).not.toHaveBeenCalled();
		await expect( withEarlyRequest( 'key', request ) ).resolves.toBe( 'fresh' );
	} );

	it( 'makes the request when none was started early', async () => {
		const request = jest.fn().mockResolvedValue( 'fresh' );

		await expect( withEarlyRequest( 'key', request ) ).resolves.toBe( 'fresh' );
		expect( request ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not hand over a request started for another key', async () => {
		startEarlyRequest( 'other', jest.fn().mockResolvedValue( 'early' ) );
		const request = jest.fn().mockResolvedValue( 'fresh' );

		await expect( withEarlyRequest( 'key', request ) ).resolves.toBe( 'fresh' );
	} );

	it( 'makes the request again when the early one failed', async () => {
		startEarlyRequest( 'key', jest.fn().mockRejectedValue( new Error( 'offline' ) ) );
		const request = jest.fn().mockResolvedValue( 'fresh' );

		await expect( withEarlyRequest( 'key', request ) ).resolves.toBe( 'fresh' );
	} );

	it( 'reports the failure of the request it makes after a failed early one', async () => {
		startEarlyRequest( 'key', jest.fn().mockRejectedValue( new Error( 'offline' ) ) );
		const request = jest.fn().mockRejectedValue( new Error( 'still offline' ) );

		await expect( withEarlyRequest( 'key', request ) ).rejects.toThrow( 'still offline' );
	} );

	it( 'ignores an early request that cannot be started', async () => {
		expect( () =>
			startEarlyRequest( 'key', () => {
				throw new Error( 'cannot start' );
			} )
		).not.toThrow();
		const request = jest.fn().mockResolvedValue( 'fresh' );

		await expect( withEarlyRequest( 'key', request ) ).resolves.toBe( 'fresh' );
	} );

	it( 'reports a request that cannot be started after a failed early one', async () => {
		startEarlyRequest( 'key', jest.fn().mockRejectedValue( new Error( 'offline' ) ) );
		const request = () => {
			throw new Error( 'cannot start' );
		};

		await expect( withEarlyRequest( 'key', request ) ).rejects.toThrow( 'cannot start' );
	} );

	it( 'makes the request again when the early result is not the expected one', async () => {
		startEarlyRequest( 'key', jest.fn().mockResolvedValue( { id: 1 } ) );
		const request = jest.fn().mockResolvedValue( { id: 2 } );

		await expect(
			withEarlyRequest< { id: number } >( 'key', request, ( result ) => result.id === 2 )
		).resolves.toEqual( { id: 2 } );
	} );

	it( 'makes the request again when the early result cannot be checked', async () => {
		startEarlyRequest( 'key', jest.fn().mockResolvedValue( undefined ) );
		const request = jest.fn().mockResolvedValue( { id: 2 } );

		await expect(
			withEarlyRequest< { id: number } >( 'key', request, ( result ) => result.id === 2 )
		).resolves.toEqual( { id: 2 } );
	} );

	it( 'makes the request too when the early one is slow to answer', async () => {
		jest.useFakeTimers();
		startEarlyRequest( 'key', () => new Promise( () => {} ) );
		const request = jest.fn().mockResolvedValue( 'fresh' );

		const result = withEarlyRequest( 'key', request );
		jest.advanceTimersByTime( 999 );
		expect( request ).not.toHaveBeenCalled();
		jest.advanceTimersByTime( 1 );

		await expect( result ).resolves.toBe( 'fresh' );
	} );

	it( 'uses a slow early request if it still answers first', async () => {
		jest.useFakeTimers();
		let answerEarly: ( value: string ) => void = () => {};
		startEarlyRequest(
			'key',
			() => new Promise< string >( ( resolve ) => ( answerEarly = resolve ) )
		);
		const request = jest.fn( () => new Promise< string >( () => {} ) );

		const result = withEarlyRequest( 'key', request );
		jest.advanceTimersByTime( 1000 );
		expect( request ).toHaveBeenCalledTimes( 1 );
		answerEarly( 'early' );

		await expect( result ).resolves.toBe( 'early' );
	} );

	it( 'makes the request once when a slow early request then fails', async () => {
		jest.useFakeTimers();
		let failEarly: ( error: Error ) => void = () => {};
		startEarlyRequest(
			'key',
			() => new Promise< string >( ( resolve, reject ) => ( failEarly = reject ) )
		);
		const request = jest.fn().mockResolvedValue( 'fresh' );

		const result = withEarlyRequest( 'key', request );
		jest.advanceTimersByTime( 1000 );
		failEarly( new Error( 'offline' ) );

		await expect( result ).resolves.toBe( 'fresh' );
		expect( request ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ignores an early request that is no longer recent', async () => {
		jest.useFakeTimers();
		startEarlyRequest( 'key', jest.fn().mockResolvedValue( 'early' ) );
		const request = jest.fn().mockResolvedValue( 'fresh' );

		jest.advanceTimersByTime( 31 * 1000 );

		await expect( withEarlyRequest( 'key', request ) ).resolves.toBe( 'fresh' );
	} );

	it( 'keeps a recent early request rather than starting another for the same key', async () => {
		const request = jest.fn().mockResolvedValueOnce( 'first' ).mockResolvedValueOnce( 'second' );
		startEarlyRequest( 'key', request );
		startEarlyRequest( 'key', request );

		await expect( withEarlyRequest( 'key', request ) ).resolves.toBe( 'first' );
		expect( request ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'wraps a query function so that its first call uses the early request', async () => {
		startEarlyRequest( 'key', jest.fn().mockResolvedValue( 'early' ) );
		const queryFn = jest.fn().mockResolvedValue( 'fresh' );
		const wrapped = withEarlyQueryRequest( 'key', queryFn );

		await expect( wrapped( queryContext ) ).resolves.toBe( 'early' );
		await expect( wrapped( queryContext ) ).resolves.toBe( 'fresh' );
		expect( queryFn ).toHaveBeenCalledTimes( 1 );
		expect( queryFn ).toHaveBeenCalledWith( queryContext );
	} );

	it( 'keeps the Stripe configurations of different countries and payment partners apart', () => {
		const key = earlyRequestKeys.stripeConfiguration;

		expect( key( {} ) ).toBe( key() );
		expect( key( { country: 'BR' } ) ).not.toBe( key() );
		expect( key( { payment_partner: 'stripe_ie' } ) ).not.toBe( key() );
		expect( key( { country: 'BR' } ) ).not.toBe( key( { payment_partner: 'BR' } ) );
	} );

	describe( 'startEarlyCheckoutRequests', () => {
		beforeEach( () => {
			jest.mocked( fetchTransactionSupportedCountries ).mockResolvedValue( [] );
			jest.mocked( fetchUserPaymentMethods ).mockResolvedValue( [] );
			jest.mocked( fetchDomainContactInformation ).mockResolvedValue( {} );
			jest.mocked( fetchStripeConfiguration ).mockResolvedValue( {
				js_url: 'https://js.stripe.com/v3/',
				public_key: 'pk_test',
				processor_id: 'stripe',
			} );
			jest.mocked( fetchShoppingCart ).mockResolvedValue( { cart_key: 123 } );
			jest.spyOn( queryClient, 'fetchQuery' ).mockResolvedValue( { ID: 123 } );
		} );

		afterEach( () => {
			jest.restoreAllMocks();
		} );

		it( 'starts nothing for consumers that have already fetched', async () => {
			await withEarlyRequest( earlyRequestKeys.contactDetails, jest.fn().mockResolvedValue( {} ) );
			await withEarlyRequest( earlyRequestKeys.cart, jest.fn().mockResolvedValue( {} ) );

			startEarlyCheckoutRequests( { siteSlug: 'example.com' } );

			expect( fetchDomainContactInformation ).not.toHaveBeenCalled();
			expect( fetchShoppingCart ).not.toHaveBeenCalled();
			expect( fetchTransactionSupportedCountries ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'starts the requests that do not depend on a site', async () => {
			startEarlyCheckoutRequests( {} );

			expect( fetchTransactionSupportedCountries ).toHaveBeenCalledTimes( 1 );
			expect( fetchUserPaymentMethods ).toHaveBeenCalledWith( 'all', false );
			expect( fetchDomainContactInformation ).toHaveBeenCalledTimes( 1 );
			expect( fetchStripeConfiguration ).toHaveBeenCalledTimes( 1 );
			expect( fetchShoppingCart ).not.toHaveBeenCalled();
			expect( queryClient.fetchQuery ).not.toHaveBeenCalled();
		} );

		it( 'also asks for the cart and the site by slug when given one', async () => {
			startEarlyCheckoutRequests( { siteSlug: 'example.com' } );

			expect( fetchShoppingCart ).toHaveBeenCalledWith( 'example.com' );
			expect( queryClient.fetchQuery ).toHaveBeenCalledWith(
				expect.objectContaining( {
					queryKey: expect.arrayContaining( [ 'site-by-slug', 'example.com' ] ),
					retry: false,
				} )
			);
			await expect(
				withEarlyRequest( earlyRequestKeys.cart, jest.fn().mockResolvedValue( 'fresh' ) )
			).resolves.toEqual( { cart_key: 123 } );
			await expect(
				withEarlyRequest( earlyRequestKeys.site, jest.fn().mockResolvedValue( 'fresh' ) )
			).resolves.toEqual( { ID: 123 } );
		} );
	} );
} );
