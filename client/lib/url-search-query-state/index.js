import page from 'page';
import { Component } from 'react';

function updateUrlSearchQuery( queryName, queryValue ) {
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

	return page( window.location.pathname + newQuery );
}

export function hasUrlSearchQuery( queryName ) {
	const searchParams = new URLSearchParams( window.location.search );
	return searchParams.has( queryName );
}

export function getUrlSearchQuery( queryName ) {
	const searchParams = new URLSearchParams( window.location.search );
	return searchParams.get( queryName );
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
