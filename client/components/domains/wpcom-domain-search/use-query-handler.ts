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

export const clearSessionStorageQuery = () => {
	sessionStorage.removeItem( SESSION_STORAGE_QUERY_KEY );
};

export const useQueryHandler = ( {
	initialQuery: externalInitialQuery,
	currentSiteUrl,
	persistQuery = true,
}: {
	initialQuery?: string;
	currentSiteUrl?: string;
	persistQuery?: boolean;
} ) => {
	const [ localQuery, setLocalQuery ] = useState< string | undefined >( () => {
		if ( externalInitialQuery ) {
			return externalInitialQuery;
		}

		const storedQuery = persistQuery ? getSessionStorageQuery() : undefined;
		if ( storedQuery ) {
			return storedQuery;
		}

		if ( currentSiteUrl ) {
			const currentSiteHost = new URL( currentSiteUrl ).host;

			// Remove the current site host's TLD or any WPCOM subdomain suffixes
			// (e.g. `.wordpress.com`, `.wpcomstaging.com`, `.w.link`, `.tech.blog`, etc)
			return currentSiteHost.split( '.' )[ 0 ];
		}

		// If there's no stored query and there's no current site URL, that means we're not in
		// a site context (e.g. onboarding). In that case, the initial search query should be undefined.
		return undefined;
	} );

	const setQuery = useCallback(
		( query: string ) => {
			setLocalQuery( query );
			if ( persistQuery ) {
				setSessionStorageQuery( query );
			}
		},
		[ persistQuery ]
	);

	const resetQuery = useCallback( () => {
		clearSessionStorageQuery();
		setLocalQuery( undefined );
	}, [] );

	return {
		query: localQuery?.trim().toLowerCase(),
		setQuery,
		clearQuery: clearSessionStorageQuery,
		resetQuery,
	};
};
