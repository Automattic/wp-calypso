/**
 * External Dependencies
 */
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

const RouteContext = React.createContext( {
	currentSection: null,
	currentRoute: '',
	currentQuery: false,
} );

export function RouteProvider( {
	currentSection = null,
	currentRoute = '',
	currentQuery = false,
	children,
} ) {
	// modify the `currentRouteInfo` object (and trigger rerender of consumers) only if any
	// of its properties really changes.
	const currentRouteInfo = React.useMemo(
		() => ( { currentSection, currentRoute, currentQuery } ),
		[ currentSection, currentRoute, currentQuery ]
	);
	return <RouteContext.Provider value={ currentRouteInfo }>{ children }</RouteContext.Provider>;
}

export function useCurrentRoute() {
	return React.useContext( RouteContext );
}

export const withCurrentRoute = createHigherOrderComponent( ( Wrapped ) => {
	return function WithCurrentRoute( props ) {
		const currentRouteInfo = useCurrentRoute();
		return <Wrapped { ...props } { ...currentRouteInfo } />;
	};
}, 'WithCurrentRoute' );
