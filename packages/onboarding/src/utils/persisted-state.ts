import { VERSION, KEY } from '../hooks/use-persisted-state';

/**
 * Clears all persisted state created by useStepPersistedState
 * @param storage The storage to clear (defaults to localStorage)
 */
export function clearStepPersistedState( storage: Storage = localStorage ): void {
	const keys = Object.keys( storage );
	const persistedKeys = keys.filter( ( key ) => key.startsWith( `${ VERSION }-${ KEY }` ) );

	persistedKeys.forEach( ( key ) => {
		storage.removeItem( key );
		storage.removeItem( key + 'time' );
	} );
}
