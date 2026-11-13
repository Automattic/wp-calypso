import { useRouter, useRouterState } from '@tanstack/react-router';
import { useEvent } from '@wordpress/compose';
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { AnyRouter } from '@tanstack/react-router';

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
	 * latest callback is used, so it doesn't need to be stable. The params have already left the
	 * URL, so a navigation it starts begins from the clean URL.
	 */
	onConsume?: ( params: ConsumedSearchParams< K > ) => void;
}

function removeFromUrl( router: AnyRouter, keys: readonly string[] ) {
	// The URL as it is now, path included: a navigation without `to` takes its path params from
	// the page on screen, which a navigation in progress may be replacing.
	const { pathname, search, hash } = router.history.location;
	const params = new URLSearchParams( search );
	const present = keys.filter( ( key ) => params.has( key ) );
	present.forEach( ( key ) => params.delete( key ) );
	// A navigation that leaves the URL unchanged still re-runs every `beforeLoad`.
	if ( ! present.length ) {
		return;
	}

	// The router writes back the params that stay, rewriting values that parse as JSON (`1e3`
	// becomes `1000`), as every navigation that keeps the search does.
	const query = params.toString();
	router.navigate( {
		href: pathname + ( query ? `?${ query }` : '' ) + hash,
		state: true,
		replace: true,
		resetScroll: false,
		hashScrollIntoView: false,
		viewTransition: false,
		// The app always registers a blocker. Asking it would defer the write, and a navigation
		// in the meantime would start from the search as it is now and put these keys back.
		ignoreBlocker: true,
	} );
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
 * When any of `keys` is in the URL and `when` returns true, `onConsume` runs once and the keys
 * found leave the URL together. Params that arrive while the component stays mounted, like an
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
	// The params last consumed, while they stay in the URL. Different values are a new arrival;
	// the same values are one only after they've left the URL. Also stops StrictMode's second
	// effect run from acting twice.
	const handled = useRef< string | null >( null );

	const sync = useEvent( () => {
		const id = JSON.stringify( params );
		if ( handled.current === id ) {
			return;
		}
		handled.current = null;
		if ( ! shouldConsume || ! isRouterIdle ) {
			return;
		}
		handled.current = id;
		setConsumed( params );
		removeFromUrl( router, keys );
		onConsume?.( params );
	} );

	// A layout effect, so the URL is clean before any passive effect of the same commit, like a
	// page syncing its filters to the URL, starts a navigation from it.
	useLayoutEffect( () => {
		sync();
	}, [ search, shouldConsume, isRouterIdle, sync ] );

	return consumed;
}
