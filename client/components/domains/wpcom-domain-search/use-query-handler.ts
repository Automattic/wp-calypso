import { useCallback, useState } from 'react';

const SESSION_STORAGE_QUERY_KEY = 'domain-search-query';

const getSessionStorageQuery = () => {
	try {
		return sessionStorage.getItem( SESSION_STORAGE_QUERY_KEY ) ?? undefined;
	} catch {
		return undefined;
	}
};

const setSessionStorageQuery = ( query: string ) => {
	sessionStorage.setItem( SESSION_STORAGE_QUERY_KEY, query );
};

const clearSessionStorageQuery = () => {
	sessionStorage.removeItem( SESSION_STORAGE_QUERY_KEY );
};

export const useQueryHandler = ( {
	initialQuery: externalInitialQuery,
	currentSiteUrl,
}: {
	initialQuery?: string;
	currentSiteUrl?: string;
} ) => {
	const [ localQuery, setLocalQuery ] = useState< string | undefined >( () => {
		if ( externalInitialQuery ) {
			return externalInitialQuery;
		}

		if ( currentSiteUrl ) {
			return new URL( currentSiteUrl ).host.replace( /\.(wordpress|wpcomstaging)\.com$/, '' );
		}

		return getSessionStorageQuery();
	} );

	const setQuery = useCallback( ( query: string ) => {
		const normalizedQuery = query
			.trim()
			.toLowerCase()
			.replace( /^(https?:\/\/)?(www[0-9]?\.)?/, '' )
			.replace( /^www[0-9]?\./, '' )
			.replace( /[^a-zA-ZÀ-ÖÙ-öù-ÿĀ-žḀ-ỿ0-9-. ]/g, '' );

		if ( normalizedQuery ) {
			setLocalQuery( normalizedQuery );
			setSessionStorageQuery( normalizedQuery );
		}
	}, [] );

	return {
		query: localQuery,
		setQuery,
		clearQuery: clearSessionStorageQuery,
	};
};
