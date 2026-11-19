import {
	fetchDomainContactInformation,
	fetchShoppingCart,
	fetchStripeConfiguration,
	fetchTransactionSupportedCountries,
	fetchUserPaymentMethods,
} from '@automattic/api-core';
import { queryClient, siteBySlugQuery } from '@automattic/api-queries';
import { skipToken } from '@tanstack/react-query';
import type { PaymentMethodRequestType } from '@automattic/api-core';
import type { CartKey } from '@automattic/shopping-cart';
import type { QueryFunction, QueryKey } from '@tanstack/react-query';

/**
 * Requests that the checkout route starts before checkout mounts.
 *
 * On a full page load, checkout cannot mount until the site named in the URL
 * has been looked up. The requests below do not depend on that lookup, so the
 * route starts them straight away and the code that would otherwise make each
 * request picks up the one already in flight.
 *
 * Only the first fetch a consumer makes after the page loads can be answered
 * this way, and only while the early request is recent. Every later fetch (on
 * window focus, after a mutation, on a later visit to checkout and so on) goes
 * to the network as it always has.
 */

const MAX_AGE_MS = 30 * 1000;

// How long a fetch waits for an early request that has not answered yet before
// it is also made the usual way. The cart endpoint, for one, occasionally never
// responds while the identical request made again succeeds at once.
const MAX_WAIT_MS = 1000;

interface EarlyRequest {
	promise: Promise< unknown >;
	startedAt: number;
}

const earlyRequests = new Map< string, EarlyRequest >();

// The consumers that have made their first fetch.
const fetchedKeys = new Set< string >();

export const earlyRequestKeys = {
	cart: 'cart',
	site: 'site',
	contactDetails: 'contact-details',
	countries: ( locale?: string ) => `countries:${ locale ?? '' }`,
	paymentMethods: ( type: PaymentMethodRequestType, expired: boolean ) =>
		`payment-methods:${ type }:${ expired }`,
	stripeConfiguration: ( {
		country,
		payment_partner,
	}: { country?: string; payment_partner?: string } = {} ) =>
		`stripe-configuration:${ country ?? '' }:${ payment_partner ?? '' }`,
};

function isRecent( early: EarlyRequest | undefined ): early is EarlyRequest {
	return !! early && Date.now() - early.startedAt <= MAX_AGE_MS;
}

export function startEarlyRequest< T >( key: string, request: () => Promise< T > ): void {
	// Its consumer already has what it fetched itself, or a route that redirects
	// to another checkout route is running twice in a row.
	if ( fetchedKeys.has( key ) || isRecent( earlyRequests.get( key ) ) ) {
		return;
	}
	let promise: Promise< T >;
	try {
		promise = request();
	} catch {
		return;
	}
	// Whoever takes the request over deals with a failure by making it again.
	promise.catch( () => {} );
	earlyRequests.set( key, { promise, startedAt: Date.now() } );
}

/**
 * Resolves with the early request for `key` when there is a recent one,
 * otherwise makes the request. Also makes the request if the early one failed,
 * if `isExpected` rejects what it returned, or if it is slow to answer; in the
 * last case whichever of the two answers first is used.
 */
export function withEarlyRequest< T >(
	key: string,
	request: () => Promise< T >,
	isExpected: ( result: T ) => boolean = () => true
): Promise< T > {
	const early = earlyRequests.get( key );
	earlyRequests.delete( key );
	fetchedKeys.add( key );
	if ( ! isRecent( early ) ) {
		return request();
	}

	return new Promise< T >( ( resolve, reject ) => {
		let isRequested = false;
		const makeRequest = () => {
			if ( isRequested ) {
				return;
			}
			isRequested = true;
			try {
				request().then( resolve, reject );
			} catch ( error ) {
				reject( error );
			}
		};
		const timer = setTimeout( makeRequest, MAX_WAIT_MS );
		( early.promise as Promise< T > )
			.then( ( result ) => {
				if ( isExpected( result ) ) {
					resolve( result );
				} else {
					makeRequest();
				}
			} )
			.catch( makeRequest )
			.finally( () => clearTimeout( timer ) );
	} );
}

/**
 * Wraps a query function so that its first call uses the early request for `key`.
 */
export function withEarlyQueryRequest< T, TQueryKey extends QueryKey >(
	key: string,
	queryFn: QueryFunction< T, TQueryKey > | typeof skipToken | undefined,
	isExpected?: ( result: T ) => boolean
): QueryFunction< T, TQueryKey > {
	return ( context ) =>
		withEarlyRequest(
			key,
			async () => {
				if ( ! queryFn || queryFn === skipToken ) {
					throw new Error( `Missing query function for "${ key }"` );
				}
				return queryFn( context );
			},
			isExpected
		);
}

/**
 * Starts the requests checkout makes as soon as it mounts.
 *
 * Pass `siteSlug` when the site still has to be looked up: the cart and the
 * site are then requested by slug, which returns the same data as by ID.
 */
export function startEarlyCheckoutRequests( { siteSlug }: { siteSlug?: string } ): void {
	startEarlyRequest( earlyRequestKeys.countries(), () => fetchTransactionSupportedCountries() );
	startEarlyRequest( earlyRequestKeys.paymentMethods( 'all', false ), () =>
		fetchUserPaymentMethods( 'all', false )
	);
	startEarlyRequest( earlyRequestKeys.contactDetails, fetchDomainContactInformation );
	startEarlyRequest( earlyRequestKeys.stripeConfiguration(), () => fetchStripeConfiguration( {} ) );

	if ( siteSlug ) {
		// The cart endpoint takes a site slug in place of the cart key, which is how
		// the shopping cart package itself finds the key of a site's cart.
		startEarlyRequest( earlyRequestKeys.cart, () => fetchShoppingCart( siteSlug as CartKey ) );
		// If this fails, the site is fetched again the usual way, retries included.
		startEarlyRequest( earlyRequestKeys.site, () =>
			queryClient.fetchQuery( { ...siteBySlugQuery( siteSlug ), retry: false } )
		);
	}
}

export function resetEarlyRequests(): void {
	earlyRequests.clear();
	fetchedKeys.clear();
}
