import { useSyncExternalStore } from 'react';

export interface ValueStore< T > {
	get(): T;
	set( value: T ): void;
	subscribe( callback: () => void ): () => void;
	reset(): void;
}

/**
 * Create a store that holds a single value which components can subscribe to
 * with `useValueStore()`.
 */
export function createValueStore< T >( initialValue: T ): ValueStore< T > {
	let value = initialValue;
	let subscribers: Array< () => void > = [];

	function set( newValue: T ): void {
		value = newValue;
		subscribers.forEach( ( subscriber ) => subscriber() );
	}

	return {
		get: () => value,
		set,
		subscribe: ( callback ) => {
			subscribers.push( callback );
			return () => {
				subscribers = subscribers.filter( ( subscriber ) => subscriber !== callback );
			};
		},
		reset: () => set( initialValue ),
	};
}

export function useValueStore< T >( store: ValueStore< T > ): T {
	return useSyncExternalStore( store.subscribe, store.get );
}
