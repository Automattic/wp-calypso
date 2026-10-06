import { useCallback, useEffect, useState } from 'react';

function readIds( key: string ): string[] {
	try {
		const value: unknown = JSON.parse( localStorage.getItem( key ) ?? '[]' );
		return Array.isArray( value )
			? value.filter( ( id ): id is string => typeof id === 'string' )
			: [];
	} catch {
		return [];
	}
}

export default function useResourceReadState( userId: number ) {
	const key = `a4a-library-read-v1:${ userId }`;
	const [ state, setState ] = useState< { key: string; ids: string[] } >( { key, ids: [] } );
	const [ error, setError ] = useState( false );
	const ids = state.key === key ? state.ids : readIds( key );
	useEffect( () => {
		setState( { key, ids: readIds( key ) } );
		const sync = ( event: StorageEvent ) => {
			if ( event.key === key || event.key === null ) {
				setState( { key, ids: readIds( key ) } );
			}
		};
		window.addEventListener( 'storage', sync );
		return () => window.removeEventListener( 'storage', sync );
	}, [ key ] );
	const setRead = useCallback(
		( id: string, read: boolean ) => {
			const next = new Set( readIds( key ) );
			if ( read ) {
				next.add( id );
			} else {
				next.delete( id );
			}
			try {
				localStorage.setItem( key, JSON.stringify( [ ...next ] ) );
				setState( { key, ids: [ ...next ] } );
				setError( false );
				return true;
			} catch {
				setError( true );
				return false;
			}
		},
		[ key ]
	);
	return { readIds: ids, setRead, error };
}
