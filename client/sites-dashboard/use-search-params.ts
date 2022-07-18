import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';

/**
 * An implementation of react-router's useSearchParams()
 *
 * Until we upgrade to react-router v6, we'll have to make do
 * with our own shim.
 */
export const useSearchParams = () => {
	const defaultParams = Object.fromEntries( new URLSearchParams( window.location.search ) );
	const [ searchParams, setSearchParams ] = useState( defaultParams );

	useEffect( () => {
		window.addEventListener( 'popstate', () => {
			setSearchParams( defaultParams );
		} );
	}, [] );

	const setSearchParam = ( param: string, value: string | null ) => {
		const newParams = {
			...searchParams,
		};
		if ( ! value ) {
			delete newParams[ param ];
		} else {
			newParams[ param ] = value;
		}
		setSearchParams( newParams );
		window.history.pushState( null, '', addQueryArgs( window.location.pathname, newParams ) );
	};

	return [ searchParams, setSearchParam ] as const;
};
