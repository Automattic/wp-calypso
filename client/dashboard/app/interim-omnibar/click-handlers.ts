import { createContext, useContext, useEffect, useRef } from 'react';

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

export function createOmnibarEvents() {
	return {
		mobileMenu: createOmnibarEvent(),
		notifications: createOmnibarEvent(),
		linkClick: createOmnibarEvent< { href: string; event: MouseEvent } >(),
	};
}

export type OmnibarEvents = ReturnType< typeof createOmnibarEvents >;

type EventPayload< K extends keyof OmnibarEvents > = Parameters<
	OmnibarEvents[ K ][ 'emit' ]
> extends [ infer P ]
	? P
	: void;

const OmnibarEventsContext = createContext< OmnibarEvents | null >( null );

export const OmnibarEventsProvider = OmnibarEventsContext.Provider;

/**
 * Subscribe to an omnibar event. The callback fires whenever the named event
 * is emitted from the interim omnibar. No-ops when the omnibar is disabled.
 */
export function useOmnibarEvent< K extends keyof OmnibarEvents >(
	name: K,
	callback: ( payload: EventPayload< K > ) => void
) {
	const events = useContext( OmnibarEventsContext );
	const callbackRef = useRef( callback );
	callbackRef.current = callback;

	useEffect( () => {
		if ( ! events ) {
			return;
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return events[ name ].subscribe( ( payload: any ) => {
			callbackRef.current( payload );
		} );
	}, [ events, name ] );
}
