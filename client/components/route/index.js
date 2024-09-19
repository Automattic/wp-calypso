import { createHigherOrderComponent } from '@wordpress/compose';
import { createContext, useMemo, useContext } from 'react';

const RouteContext = createContext( {
	// TODO: a `null` value would be a better fit here, but existing code might access
	// the properties of `currentSection` without guarding for `null`. Accessing properties
	// of a boolean value is OK -- it's an object.
	currentSection: false,
	currentRoute: '',
	currentQuery: false,
} );

export function RouteProvider( {
	currentSection = false,
	currentRoute = '',
	currentQuery = false,
	children,
} ) {
	// modify the `currentRouteInfo` object (and trigger rerender of consumers) only if any
	// of its properties really changes.
	const currentRouteInfo = useMemo(
		() => ( { currentSection, currentRoute, currentQuery } ),
		[ currentSection, currentRoute, currentQuery ]
	);

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
