import { useRouter, useRouterState } from '@tanstack/react-router';
import { useEvent } from '@wordpress/compose';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { AnyRouter, NavigateOptions } from '@tanstack/react-router';

/**
 * Each requested key that is present, with its value as written in the URL, unquoted if the router
 * quoted it.
 */
export type ConsumedSearchParams< K extends string > = Partial< Record< K, string > >;

export interface ConsumeSearchParamsOptions< K extends string > {
	/**
	 * Whether the params found are this component's to consume. Runs during render, so keep it
	 * pure. Defaults to any of the keys being present. Check the value when another component
	 * reads the same key, as every `FlashMessage` does with `flash`.
	 */
	when?: ( params: ConsumedSearchParams< K > ) => boolean;
	/**
	 * Runs once per arrival of the params, after commit, for snackbars and Tracks events. The
	 * latest callback is used, so it doesn't need to be stable.
	 */
	onConsume?: ( params: ConsumedSearchParams< K > ) => void;
}

const pendingRemovals = new WeakMap< AnyRouter, Set< string > >();

function flushRemovals( router: AnyRouter, removals: Set< string > ) {
	// Until a navigation resolves, a navigation without `to` takes its path params from the page
	// still on screen, and would send the user back there.
	if ( router.state.status === 'pending' ) {
		const unsubscribe = router.subscribe( 'onResolved', () => {
			unsubscribe();
			// The router is idle only once its `onResolved` listeners have returned.
			queueMicrotask( () => flushRemovals( router, removals ) );
		} );
		return;
	}

	pendingRemovals.delete( router );
	// A navigation that leaves the URL unchanged still re-runs every `beforeLoad`.
	const current = new URLSearchParams( router.history.location.search );
	if ( ! [ ...removals ].some( ( key ) => current.has( key ) ) ) {
		return;
	}

	const options: NavigateOptions = {
		search: ( prev: Record< string, unknown > ) =>
			Object.fromEntries( Object.entries( prev ).filter( ( [ key ] ) => ! removals.has( key ) ) ),
		replace: true,
		hash: true,
		resetScroll: false,
		hashScrollIntoView: false,
		viewTransition: false,
		// The app always registers a blocker, which defers the write. Another write in the same
		// tick would then start from the stale search and put these keys back.
		ignoreBlocker: true,
	};
	router.navigate( options );
}

/**
 * Removes search params from the current URL with the router, without adding a history entry,
 * scrolling, running a view transition or asking the navigation blocker. Removals requested in
 * the same task share one navigation, which waits for a navigation in progress to resolve.
 * @param router The app's router.
 * @param keys   The params to remove.
 */
export function removeSearchParams( router: AnyRouter, keys: readonly string[] ) {
	const pending = pendingRemovals.get( router );
	if ( pending ) {
		keys.forEach( ( key ) => pending.add( key ) );
		return;
	}

	const removals = new Set( keys );
	pendingRemovals.set( router, removals );
	queueMicrotask( () => flushRemovals( router, removals ) );
}

// The router quotes a string that would otherwise parse as JSON, so `{ id: '123' }` is
// `id=%22123%22`. It never quotes plain text, so `?title=%22Notes%22` keeps its quotes.
function decodeValue( value: string ): string {
	try {
		const parsed: unknown = JSON.parse( value );
		if ( typeof parsed === 'string' ) {
			JSON.parse( parsed );
			return parsed;
		}
	} catch {
		// Not a string the router quoted.
	}
	return value;
}

function readSearchParams< K extends string >(
	search: string,
	keys: readonly K[]
): ConsumedSearchParams< K > {
	const searchParams = new URLSearchParams( search );
	const params: ConsumedSearchParams< K > = {};
	for ( const key of keys ) {
		const value = searchParams.get( key );
		if ( value !== null ) {
			params[ key ] = decodeValue( value );
		}
	}
	return params;
}

/**
 * Reads one-shot search params, like a flash message id or a connection callback, and removes
 * them from the URL so that a reload or Back doesn't act on them again.
 *
 * When any of `keys` is in the URL and `when` returns true, `onConsume` runs once and all of
 * `keys` leave the URL together. Params that arrive while the component stays mounted, like an
 * in-app redirect into a layout, are consumed too. Never consume a key that a matched route reads
 * in `loaderDeps`: removing it puts that page back into its pending state.
 * @param keys    The params to read and remove.
 * @param options When to consume, and what to do once.
 * @returns The values of the latest consumption, or `{}`. Params in the URL on mount are there
 *          from the first render, so `useState` initializers can use them, and they stay after
 *          the URL is cleaned.
 */
export function useConsumeSearchParams< K extends string >(
	keys: readonly K[],
	options: ConsumeSearchParamsOptions< K > = {}
): ConsumedSearchParams< K > {
	const { when, onConsume } = options;
	const router = useRouter();
	// The URL's own text: the router's parsed search turns `?verified=1` into a number and loses
	// digits past 2^53.
	const search = useSyncExternalStore(
		router.history.subscribe,
		() => router.history.location.search
	);
	// Wait for a navigation in progress, like a redirect that adds a flash, to resolve: the page it
	// leaves may still be on screen.
	const isRouterIdle = useRouterState( { select: ( state ) => state.status === 'idle' } );
	const params = readSearchParams( search, keys );
	const isPresent = Object.keys( params ).length > 0;
	const shouldConsume = isPresent && ( when?.( params ) ?? true );

	const [ consumed, setConsumed ] = useState( () => ( shouldConsume ? params : {} ) );
	// Whether the params now in the URL were handled. Cleared once they're gone, so that a later
	// arrival is consumed again. Also stops StrictMode's second effect run from acting twice.
	const isHandled = useRef( false );

	const sync = useEvent( () => {
		if ( ! isPresent ) {
			isHandled.current = false;
			return;
		}
		if ( ! shouldConsume || isHandled.current || ! isRouterIdle ) {
			return;
		}
		isHandled.current = true;
		setConsumed( params );
		onConsume?.( params );
		removeSearchParams( router, keys );
	} );

	useEffect( () => {
		sync();
	}, [ search, shouldConsume, isRouterIdle, sync ] );

	return consumed;
}
