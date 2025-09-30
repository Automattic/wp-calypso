import { useState } from 'react';

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

	return {
		query: localQuery,
		setQuery: ( query: string ) => {
			setLocalQuery( query );
			setSessionStorageQuery( query );
		},
	};
};
