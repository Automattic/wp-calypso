import { useEffect, useRef } from 'react';

type Listener< T = void > = ( payload: T ) => void;

function createOmnibarEvent< T = void >() {
	const listeners = new Set< Listener< T > >();
	return {
		emit( ...args: T extends void ? [] : [ T ] ) {
			const payload = args[ 0 ] as T;
			listeners.forEach( ( fn ) => fn( payload ) );
		},
		subscribe( fn: Listener< T > ) {
			listeners.add( fn );
			return () => {
				listeners.delete( fn );
			};
		},
	};
}

export const omnibarEvents = {
	mobileMenu: createOmnibarEvent(),
	notifications: createOmnibarEvent(),
	linkClick: createOmnibarEvent< { href: string; event: MouseEvent } >(),
};

export type OmnibarEvents = typeof omnibarEvents;

type EventPayload< K extends keyof OmnibarEvents > = Parameters<
	OmnibarEvents[ K ][ 'emit' ]
> extends [ infer P ]
	? P
	: void;

/**
 * Subscribe to an omnibar event. The callback fires whenever the named event
 * is emitted from the interim omnibar. No-ops when the omnibar is disabled.
 */
export function useOmnibarEvent< K extends keyof OmnibarEvents >(
	name: K,
	callback: ( payload: EventPayload< K > ) => void
) {
	const callbackRef = useRef( callback );
	useEffect( () => {
		callbackRef.current = callback;
	} );

	useEffect( () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return omnibarEvents[ name ].subscribe( ( payload: any ) => {
			callbackRef.current( payload );
		} );
	}, [ name ] );
}
