import { useCallback, useEffect, useState } from 'react';

const storageKey = ( siteId: number, podcatcherId: string ) =>
	`podcasting:${ siteId }:${ podcatcherId }:url`;

const celebrationKey = ( siteId: number ) => `podcasting:${ siteId }:celebrated_first_save`;

export const hasCelebratedFirstSave = ( siteId: number | null | undefined ): boolean => {
	if ( typeof window === 'undefined' || ! siteId ) {
		return false;
	}
	try {
		return window.localStorage.getItem( celebrationKey( siteId ) ) === '1';
	} catch {
		return false;
	}
};

export const markCelebratedFirstSave = ( siteId: number | null | undefined ): void => {
	if ( typeof window === 'undefined' || ! siteId ) {
		return;
	}
	try {
		window.localStorage.setItem( celebrationKey( siteId ), '1' );
	} catch {
		/* storage unavailable — fail silent */
	}
};

const readUrl = ( siteId: number | null | undefined, podcatcherId: string ): string => {
	if ( typeof window === 'undefined' || ! siteId ) {
		return '';
	}
	try {
		return window.localStorage.getItem( storageKey( siteId, podcatcherId ) ) ?? '';
	} catch {
		return '';
	}
};

export const usePodcatcherUrl = (
	siteId: number | null | undefined,
	podcatcherId: string
): [ string, ( next: string ) => void ] => {
	const [ url, setUrl ] = useState( () => readUrl( siteId, podcatcherId ) );

	useEffect( () => {
		setUrl( readUrl( siteId, podcatcherId ) );
	}, [ siteId, podcatcherId ] );

	const save = useCallback(
		( next: string ) => {
			setUrl( next );
			if ( typeof window === 'undefined' || ! siteId ) {
				return;
			}
			try {
				const key = storageKey( siteId, podcatcherId );
				if ( next ) {
					window.localStorage.setItem( key, next );
				} else {
					window.localStorage.removeItem( key );
				}
			} catch {
				/* storage unavailable — fail silent */
			}
		},
		[ siteId, podcatcherId ]
	);

	return [ url, save ];
};
