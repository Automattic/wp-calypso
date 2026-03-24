import { createContext, useContext, useEffect, useRef } from 'react';

type Listener = () => void;

function createOmnibarEvent() {
	const listeners = new Set< Listener >();
	return {
		emit() {
			listeners.forEach( ( fn ) => fn() );
		},
		subscribe( fn: Listener ) {
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
	};
}

export type OmnibarEvents = ReturnType< typeof createOmnibarEvents >;

const OmnibarEventsContext = createContext< OmnibarEvents | null >( null );

export const OmnibarEventsProvider = OmnibarEventsContext.Provider;

/**
 * Subscribe to an omnibar event. The callback fires whenever the named event
 * is emitted from the interim omnibar. No-ops when the omnibar is disabled.
 */
export function useOmnibarEvent( name: keyof OmnibarEvents, callback: () => void ) {
	const events = useContext( OmnibarEventsContext );
	const callbackRef = useRef( callback );
	callbackRef.current = callback;

	useEffect( () => {
		if ( ! events ) {
			return;
		}
		// Defer to a microtask so the callback runs after the current click
		// handler but before any macrotasks (e.g. Popover's setTimeout(0)
		// blur-close). This prevents focus-outside handlers from racing
		// with our toggle.
		return events[ name ].subscribe( () => {
			Promise.resolve().then( () => callbackRef.current() );
		} );
	}, [ events, name ] );
}
