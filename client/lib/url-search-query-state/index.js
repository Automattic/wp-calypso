import page from 'page';
import { Component, useEffect, useState, useCallback } from 'react';

function updateUrlSearchQuery( queryName, queryValue ) {
	if ( typeof window === 'undefined' ) {
		return;
	}
	const searchParams = new URLSearchParams( window.location.search );
	// let historyObject = null;
	let newQuery = '';
	if ( queryValue ) {
		searchParams.set( queryName, queryValue );
	} else {
		searchParams.delete( queryName );
	}

	if ( searchParams.toString() ) {
		newQuery = '?' + decodeURIComponent( searchParams.toString() );
	}
	page( window.location.pathname + newQuery );
	// Dispatch the custom event.
	const event = new CustomEvent( 'changeUrlSearchQuery', { details: { queryName, queryValue } } );
	window.dispatchEvent( event );
}

export function hasUrlSearchQuery( queryName ) {
	const searchParams = new URLSearchParams( window.location.search );
	return searchParams.has( queryName );
}

export function getUrlSearchQuery( queryName ) {
	const searchParams = new URLSearchParams( window.location.search );
	return searchParams.get( queryName );
}

export function useHasUrlSearchQuery( queryName ) {
	const [ hasQueryInUrl, setHasQueryInUrl ] = useState( hasUrlSearchQuery( queryName ) );

	const historyEventListener = useCallback( () => {
		setHasQueryInUrl( hasUrlSearchQuery( queryName ) );
	}, [ setHasQueryInUrl, queryName ] );

	useEffect( () => {
		window.addEventListener( 'popstate', historyEventListener );
		window.addEventListener( 'changeUrlSearchQuery', historyEventListener );
		return () => {
			window.removeEventListener( 'popstate', historyEventListener );
			window.removeEventListener( 'changeUrlSearchQuery', historyEventListener );
		};
	}, [ historyEventListener ] );

	return hasQueryInUrl;
}

export function useUrlSearchQueryState( queryName ) {
	const update = ( queryValue ) => updateUrlSearchQuery( queryName, queryValue );
	return [ getUrlSearchQuery( queryName ), update ];
}

export const withUrlSearchQueryState = ( WrappedComponent, queryName ) => {
	return class WithSearchQueryState extends Component {
		render() {
			const updateUrlSearch = ( value ) => updateUrlSearchQuery( queryName, value );
			return <WrappedComponent updateUrlSearchQuery={ updateUrlSearch } { ...this.props } />;
		}
	};
};
