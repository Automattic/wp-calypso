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
import type { RouterProviderProps } from '../types';

const locationMemo = new WeakMap();
function getLocationWithQuery() {
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

export function RouterProvider( {
	routes,
	pathArg,
	beforeNavigate,
	children,
}: RouterProviderProps ) {
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
