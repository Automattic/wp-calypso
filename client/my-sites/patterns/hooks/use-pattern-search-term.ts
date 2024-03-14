import page from '@automattic/calypso-router';
import { useEffect, useState } from 'react';
import type { Pattern } from 'calypso/my-sites/patterns/types';
import type { Dispatch, SetStateAction } from 'react';

export const QUERY_PARAM_SEARCH = 's';

/**
 * Retrieve a query parameter value from the URL
 */
function getQueryParam( key: string ) {
	if ( typeof window !== 'undefined' ) {
		const params = new URLSearchParams( window.location.search );
		return params.get( key ) ?? '';
	}

	return '';
}

/**
 * Set up search form state and URL-related `useEffect` callbacks
 */
export function usePatternSearchTerm(
	initialSearchTerm?: string
): [ string, Dispatch< SetStateAction< string > > ] {
	const [ searchTerm, setSearchTerm ] = useState( initialSearchTerm ?? '' );

	// Updates the URL of the page whenever the search term changes
	useEffect( () => {
		const params = new URLSearchParams( window.location.search );

		if ( searchTerm ) {
			params.set( QUERY_PARAM_SEARCH, searchTerm );
		} else {
			params.delete( QUERY_PARAM_SEARCH );
		}

		const paramsString = params.toString().length ? `?${ params.toString() }` : '';
		page.redirect( `${ window.location.pathname }${ paramsString }` );
	}, [ searchTerm ] );

	// Updates the search term whenever the URL of the page changes
	useEffect( () => {
		function onPopstate() {
			setSearchTerm( getQueryParam( QUERY_PARAM_SEARCH ) );
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
	const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

	return patterns.filter( ( pattern ) => {
		const patternCategories = Object.values( pattern.categories ).map(
			( category ) => category?.title
		);
		// Filters out falsy values in a way TS can understand
		const fields = [ pattern.title, pattern.description, ...patternCategories ].filter(
			( x ): x is NonNullable< typeof x > => Boolean( x )
		);

		return fields.some( ( field ) => field.toLowerCase().includes( lowerCaseSearchTerm ) );
	} );
}
