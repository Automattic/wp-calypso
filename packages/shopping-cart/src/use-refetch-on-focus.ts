/**
 * External dependencies
 */
import { useEffect } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import type { CacheStatus, ShoppingCartManagerOptions } from './types';

const debug = debugFactory( 'shopping-cart:use-refetch-on-focus' );

export default function useRefetchOnFocus(
	options: ShoppingCartManagerOptions,
	cacheStatus: CacheStatus,
	refetch: () => void
): void {
	useEffect( () => {
		if ( ! options.refetchOnWindowFocus || cacheStatus !== 'valid' ) {
			return;
		}

		function isFocused(): boolean {
			return [ undefined, 'visible', 'prerender' ].includes( document.visibilityState );
		}

		function handleFocusChange(): void {
			if ( ! isFocused() ) {
				debug( 'window was made invisible; ignoring' );
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
	}, [ options.refetchOnWindowFocus, refetch, cacheStatus ] );
}
