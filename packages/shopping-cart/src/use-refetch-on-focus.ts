/**
 * External dependencies
 */
import { useEffect } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import type { CacheStatus, ShoppingCartManagerOptions, ResponseCart } from './types';

const debug = debugFactory( 'shopping-cart:use-refetch-on-focus' );

// The number of seconds within that must have passed before we allow an
// automatic refetch on focus.
const minimumFetchInterval = 60;

function convertMsToSecs( ms: number ): number {
	return Math.floor( ms / 1000 );
}

export default function useRefetchOnFocus(
	options: ShoppingCartManagerOptions,
	cacheStatus: CacheStatus,
	lastCart: ResponseCart,
	refetch: () => void
): void {
	useEffect( () => {
		if ( ! options.refetchOnWindowFocus || cacheStatus !== 'valid' ) {
			return;
		}

		function isFocused(): boolean {
			return [ undefined, 'visible', 'prerender' ].includes( document.visibilityState );
		}

		function wasLastFetchRecent(): boolean {
			const nowInSeconds = convertMsToSecs( Date.now() );
			const lastRefreshTime = lastCart.cart_generated_at_timestamp;
			const secondsSinceLastFetch = nowInSeconds - lastRefreshTime;
			debug( 'last fetch was', secondsSinceLastFetch, 'seconds ago' );
			return secondsSinceLastFetch < minimumFetchInterval;
		}

		function handleFocusChange(): void {
			if ( ! isFocused() ) {
				debug( 'window was made invisible; ignoring' );
				return;
			}
			if ( wasLastFetchRecent() ) {
				debug( 'last fetch was quite recent; ignoring' );
				return;
			}

			debug( 'window was refocused; refetching' );
			refetch();
		}

		window.addEventListener( 'visibilitychange', handleFocusChange );
		window.addEventListener( 'focus', handleFocusChange );

		return () => {
			window.removeEventListener( 'visibilitychange', handleFocusChange );
			window.removeEventListener( 'focus', handleFocusChange );
		};
	}, [ options.refetchOnWindowFocus, lastCart.cart_generated_at_timestamp, refetch, cacheStatus ] );
}
