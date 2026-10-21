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

/**
 * Create an omnibar event that also passes its latest payload to new subscribers.
 */
function createOmnibarValue< T >( initialValue: T ) {
	const listeners = new Set< Listener< T > >();
	let latestValue = initialValue;
	return {
		emit( value: T ) {
			latestValue = value;
			listeners.forEach( ( fn ) => fn( value ) );
		},
		subscribe( fn: Listener< T > ) {
			listeners.add( fn );
			fn( latestValue );
			return () => {
				listeners.delete( fn );
			};
		},
	};
}

export const omnibarEvents = {
	mobileMenu: createOmnibarEvent(),
	notificationsAnchor: createOmnibarValue< HTMLElement | null >( null ),
	notifications: createOmnibarEvent(),
	notificationsUnseenCount: createOmnibarEvent< number >(),
	notificationsOpen: createOmnibarEvent< boolean >(),
	notificationsSubscriberReceived: createOmnibarEvent(),
};

type OmnibarEvents = typeof omnibarEvents;

type EventPayload< K extends keyof OmnibarEvents > =
	Parameters< OmnibarEvents[ K ][ 'emit' ] > extends [ infer P ] ? P : void;

/**
 * Subscribe to an omnibar event. The callback fires whenever the named event
 * is emitted from the omnibar.
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
