import page from '@automattic/calypso-router';
import { useEffect, useState } from 'react';
import type { Pattern } from 'calypso/my-sites/patterns/types';
import type { Dispatch, SetStateAction } from 'react';

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
export function usePatternSearchTerm(): [ string, Dispatch< SetStateAction< string > > ] {
	const [ searchTerm, setSearchTerm ] = useState( getQueryParam( 's' ) );

	// Updates the URL of the page whenever the search term changes
	useEffect( () => {
		const params = new URLSearchParams( window.location.search );

		if ( searchTerm ) {
			params.set( 's', searchTerm );
		} else {
			params.delete( 's' );
		}

		const paramsString = params.toString().length ? `?${ params.toString() }` : '';
		page.redirect( `${ window.location.pathname }${ paramsString }` );
	}, [ searchTerm ] );

	// Updates the search term whenever the URL of the page changes
	useEffect( () => {
		function onPopstate() {
			setSearchTerm( getQueryParam( 's' ) );
		}

		window.addEventListener( 'popstate', onPopstate );

		return () => {
			window.removeEventListener( 'popstate', onPopstate );
		};
	}, [] );

	return [ searchTerm, setSearchTerm ];
}

/**
 * Filter patterns by looking at their titles, description and category names
 */
export function filterPatternsByTerm( patterns: Pattern[], searchTerm: string ) {
	return patterns.filter( ( pattern ) => {
		const lowerCaseSearchTerm = searchTerm.toLowerCase();
		const patternCategories = Object.values( pattern.categories ).map(
			( category ) => category?.title
		);
		const fields = [ pattern.title, pattern.description, ...patternCategories ].filter(
			( x ): x is NonNullable< typeof x > => Boolean( x )
		);

		return fields.some( ( field ) => field.toLowerCase().includes( lowerCaseSearchTerm ) );
	} );
}
