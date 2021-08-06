import debugFactory from 'debug';
import { useEffect, useContext } from 'react';
import { cartKeysThatDoNotAllowFetch } from './cart-keys';
import ShoppingCartContext from './shopping-cart-context';
import ShoppingCartOptionsContext from './shopping-cart-options-context';

const debug = debugFactory( 'shopping-cart:use-refetch-on-focus' );

// The number of seconds within that must have passed before we allow an
// automatic refetch on focus.
const minimumFetchInterval = 60;

function convertMsToSecs( ms: number ): number {
	return Math.floor( ms / 1000 );
}

export default function useRefetchOnFocus( cartKey: string | undefined ): void {
	const managerClient = useContext( ShoppingCartContext );
	if ( ! managerClient ) {
		throw new Error( 'useRefetchOnFocus must be used inside a ShoppingCartProvider' );
	}

	const manager = managerClient.forCartKey( cartKey );
	const { isLoading, isPendingUpdate, loadingError, responseCart: lastCart } = manager.getState();
	const { reloadFromServer } = manager.actions;
	const { refetchOnWindowFocus } = useContext( ShoppingCartOptionsContext ) ?? {};

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

		// Refresh only if the cart is not pending any other operations
		const isCartInvalid = isLoading || isPendingUpdate;
		const isError = !! loadingError;
		if ( isCartInvalid && ! isError ) {
			debug( 'cart not in valid or error state; not listening' );
			return;
		}

		function isFocused(): boolean {
			return [ undefined, 'visible', 'prerender' ].includes( document.visibilityState );
		}

		function isOffline(): boolean {
			try {
				return ! window.navigator.onLine;
			} catch ( err ) {
				debug( 'failed to check onLine status with error', err );
				return true;
			}
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
			if ( isOffline() ) {
				debug( 'network is offline; ignoring' );
				return;
			}

			debug( 'window was refocused; refetching' );
			reloadFromServer();
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
	}, [
		cartKey,
		refetchOnWindowFocus,
		lastCart.cart_generated_at_timestamp,
		reloadFromServer,
		isLoading,
		isPendingUpdate,
		loadingError,
	] );
}
