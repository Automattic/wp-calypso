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

		const storedQuery = getSessionStorageQuery();
		if ( storedQuery ) {
			return storedQuery;
		}

		if ( currentSiteUrl ) {
			return new URL( currentSiteUrl ).host.replace( /\.(wordpress|wpcomstaging)\.com$/, '' );
		}

		// If there's no stored query and the current site URL is not a free WPCOM subdomain, that
		// means the site slug is probably a custom domain. In that case, the initial search query
		// should be empty
		return '';
	} );

	const setQuery = useCallback( ( query: string ) => {
		setLocalQuery( query );
		setSessionStorageQuery( query );
	}, [] );

	return {
		query: localQuery?.trim().toLowerCase(),
		setQuery,
		clearQuery: clearSessionStorageQuery,
	};
};
