/**
 * External dependencies
 */
import { useSyncExternalStore, useMemo } from '@wordpress/element';
import RouteRecognizer from 'route-recognizer';
/**
 * Internal dependencies
 */
import { browserHistory, ConfigContext, RoutesContext, useMatch } from '../';
/**
 * Types
 */
import type { LocationWithQuery, RouterProviderProps } from '../types';
import type { JSX } from 'react';

/**
 * Cache for storing location objects with parsed query parameters.
 */
const locationMemo = new WeakMap();

function getLocationWithQuery(): LocationWithQuery {
	const location = browserHistory.location;
	let locationWithQuery = locationMemo.get( location );
	if ( ! locationWithQuery ) {
		locationWithQuery = {
			...location,
			query: Object.fromEntries( new URLSearchParams( location.search ) ),
		};
		locationMemo.set( location, locationWithQuery );
	}
	return locationWithQuery;
}

/**
 * Provides routing context for the application.
 *
 * This provider initializes and maintains the routing state using `browserHistory`,
 * and manages route recognition and navigation context.
 * @param {RouterProviderProps} props - The properties for the router provider.
 * @returns {JSX.Element} The router context provider wrapping child components.
 * @example
 * ```tsx
 * import { RouterProvider } from '../router';
 *
 * function App() {
 *     return (
 *         <RouterProvider routes={ [ { name: 'home', path: '/' } ] } pathArg="p">
 *             <MyComponent />
 *         </RouterProvider>
 *     );
 * }
 * ```
 */
export function RouterProvider( {
	routes = [],
	pathArg = 'p',
	beforeNavigate,
	children,
}: RouterProviderProps ): JSX.Element {
	const location = useSyncExternalStore(
		browserHistory.listen,
		getLocationWithQuery,
		getLocationWithQuery
	);

	const matcher = useMemo( () => {
		const ret = new RouteRecognizer();
		routes.forEach( ( route ) => {
			ret.add( [ { path: route.path, handler: route } ], {
				as: route.name,
			} );
		} );
		return ret;
	}, [ routes ] );

	const match = useMatch( location, matcher, pathArg );
	const config = useMemo( () => ( { beforeNavigate, pathArg } ), [ beforeNavigate, pathArg ] );

	return (
		<ConfigContext.Provider value={ config }>
			<RoutesContext.Provider value={ match }>{ children }</RoutesContext.Provider>
		</ConfigContext.Provider>
	);
}
