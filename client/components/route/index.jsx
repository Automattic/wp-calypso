import page from '@automattic/calypso-router';
import { createHigherOrderComponent } from '@wordpress/compose';
import { createContext, useMemo, useContext, useEffect } from 'react';

const RouteContext = createContext( {
	// TODO: a `null` value would be a better fit here, but existing code might access
	// the properties of `currentSection` without guarding for `null`. Accessing properties
	// of a boolean value is OK -- it's an object.
	currentSection: false,
	currentRoute: '',
	currentQuery: false,
} );

/** @type {(view: { path: string, route?: string }) => void} */
const noopOnRouteCommit = () => {};

export function RouteProvider( {
	currentSection = false,
	currentRoute = '',
	currentQuery = false,
	onRouteCommit = noopOnRouteCommit,
	children,
} ) {
	// modify the `currentRouteInfo` object (and trigger rerender of consumers) only if any
	// of its properties really changes.
	const currentRouteInfo = useMemo(
		() => ( { currentSection, currentRoute, currentQuery } ),
		[ currentSection, currentRoute, currentQuery ]
	);
	const path = currentRoute.split( /[?#]/ )[ 0 ];
	// run the callback after commit, can be used to track page-views consistent with how we define them in the multi-site dashboard.
	useEffect( () => {
		if (
			typeof onRouteCommit !== 'function' ||
			! path ||
			path !== page.current.split( /[?#]/ )[ 0 ]
		) {
			return;
		}
		const route = page.currentRoutePattern;
		onRouteCommit( {
			path,
			route,
		} );
	}, [ path, onRouteCommit ] );

	if ( ! currentRoute ) {
		return null;
	}

	return <RouteContext.Provider value={ currentRouteInfo }>{ children }</RouteContext.Provider>;
}

export function useCurrentRoute() {
	return useContext( RouteContext );
}

export const withCurrentRoute = createHigherOrderComponent( ( Wrapped ) => {
	return function WithCurrentRoute( props ) {
		const currentRouteInfo = useCurrentRoute();
		return <Wrapped { ...props } { ...currentRouteInfo } />;
	};
}, 'WithCurrentRoute' );
