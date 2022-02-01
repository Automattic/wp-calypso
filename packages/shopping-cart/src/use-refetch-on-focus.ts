import debugFactory from 'debug';
import { useEffect, useContext } from 'react';
import { cartKeysThatDoNotAllowFetch } from './cart-keys';
import ShoppingCartOptionsContext from './shopping-cart-options-context';
import useManagerClient from './use-manager-client';
import type { CartKey } from './types';

const debug = debugFactory( 'shopping-cart:use-refetch-on-focus' );

// The number of seconds within that must have passed before we allow an
// automatic refetch on focus.
const minimumFetchInterval = 60;

function convertMsToSecs( ms: number ): number {
	return Math.floor( ms / 1000 );
}

function isFocused(): boolean {
	return [ undefined, 'visible', 'prerender' ].includes( document.visibilityState );
}

function isOffline(): boolean {
	try {
		return ! window.navigator.onLine;
	} catch ( err ) {
		debug( 'failed to check onLine status; ignoring check', err );
		return false;
	}
}

export default function useRefetchOnFocus( cartKey: CartKey | undefined ): void {
	const managerClient = useManagerClient( 'useRefetchOnFocus' );

	const manager = managerClient.forCartKey( cartKey );
	const { refetchOnWindowFocus } = useContext( ShoppingCartOptionsContext );

	useEffect( () => {
		if ( ! refetchOnWindowFocus ) {
			debug( 'refetchOnWindowFocus false; not listening' );
			return;
		}
		if ( ! cartKey ) {
			debug( 'cartKey falsy; not listening' );
			return;
		}
		if ( cartKeysThatDoNotAllowFetch.includes( cartKey ) ) {
			debug( 'cartKey not fetchable; not listening' );
			return;
		}

		function wasLastFetchRecent(): boolean {
			const nowInSeconds = convertMsToSecs( Date.now() );
			const { responseCart: lastCart } = manager.getState();
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
			if ( isOffline() ) {
				debug( 'network is offline; ignoring' );
				return;
			}

			debug( 'window was refocused; refetching' );
			manager.actions.reloadFromServer();
		}

		debug( 'adding focus listeners' );
		window.addEventListener( 'visibilitychange', handleFocusChange );
		window.addEventListener( 'focus', handleFocusChange );
		window.addEventListener( 'online', handleFocusChange );

		return () => {
			debug( 'removing focus listeners' );
			window.removeEventListener( 'visibilitychange', handleFocusChange );
			window.removeEventListener( 'focus', handleFocusChange );
			window.removeEventListener( 'online', handleFocusChange );
		};
	}, [ cartKey, refetchOnWindowFocus, manager ] );
}
