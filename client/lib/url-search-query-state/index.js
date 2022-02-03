import { Component } from 'react';

function updateUrlSearchQuery( queryName, queryValue ) {
	if ( ! window ) {
		return;
	}

	const searchParams = new URLSearchParams( window.location.search );
	let historyObject = null;
	let newQuery = '';

	if ( queryValue ) {
		searchParams.set( queryName, queryValue );
		historyObject = { queryValue };
	} else {
		searchParams.delete( queryName );
	}

	if ( searchParams.toString() ) {
		newQuery = '?' + decodeURIComponent( searchParams.toString() );
	}

	const newUrl = window.location.pathname + newQuery;
	window.history.pushState( historyObject, '', newUrl );
}

export default function useSearchQueryState( queryName ) {
	const searchParams = new URLSearchParams( window.location.search );
	const updateSearchQuery = ( valueObject ) => updateUrlSearchQuery( queryName, valueObject );
	return [ searchParams.get( queryName ), updateSearchQuery ];
}

export const withSearchQueryState = ( WrappedComponent, queryName ) => {
	return class WithSearchQueryState extends Component {
		render() {
			const updateUrlSearch = ( value ) => updateUrlSearchQuery( queryName, value );
			return <WrappedComponent updateUrlSearchQuery={ updateUrlSearch } { ...this.props } />;
		}
	};
};
