import page from '@automattic/calypso-router';
import { useEffect, useState } from 'react';
import type { Pattern } from 'calypso/my-sites/patterns/types';
import type { Dispatch, SetStateAction } from 'react';

export const QUERY_PARAM_SEARCH = 's';

/**
 * Set up search form state and URL-related `useEffect` callbacks
 */
export function usePatternSearchTerm(
	initialSearchTerm: string
): [ string, Dispatch< SetStateAction< string > > ] {
	const [ searchTerm, setSearchTerm ] = useState( initialSearchTerm );

	// Updates the URL of the page whenever the search term changes
	useEffect( () => {
		const url = new URL( window.location.href );

		if ( searchTerm ) {
			url.searchParams.set( QUERY_PARAM_SEARCH, searchTerm );

			// Strip out `ref` parameter when updating the URL for search
			// to ensure the referrer is only be reported in the initial page view.
			url.searchParams.delete( 'ref' );
		} else {
			url.searchParams.delete( QUERY_PARAM_SEARCH );
		}

		if ( url.href !== location.href ) {
			page( url.href.replace( url.origin, '' ) );
		}
	}, [ searchTerm ] );

	// Updates the search term whenever the URL of the page changes
	useEffect( () => {
		function onPopstate() {
			const params = new URLSearchParams( window.location.search );
			setSearchTerm( params.get( QUERY_PARAM_SEARCH ) ?? '' );
		}

		window.addEventListener( 'popstate', onPopstate );

		return () => {
			window.removeEventListener( 'popstate', onPopstate );
		};
	}, [] );

	return [ searchTerm, setSearchTerm ];
}

/**
 * Filter patterns by looking at their titles, descriptions and category names
 */
export function filterPatternsByTerm( patterns: Pattern[], searchTerm: string ) {
	const lowerCaseSearchTerms = searchTerm.toLowerCase().trim().split( /\s+/ );

	return patterns.filter( ( pattern ) => {
		const patternCategories = Object.values( pattern.categories ).map(
			( category ) => category?.title
		);
		// Filters out falsy values in a way TS can understand
		const fields = [ pattern.title, pattern.description, ...patternCategories ].filter(
			( x ): x is NonNullable< typeof x > => Boolean( x )
		);

		// If any of the fields matches all parts of the search term, return true
		return fields.some( ( field ) =>
			lowerCaseSearchTerms.every( ( term ) => field.toLowerCase().includes( term ) )
		);
	} );
}
