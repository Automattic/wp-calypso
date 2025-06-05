/**
 * External dependencies
 */
import { useMemo } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import RouteRecognizer from 'route-recognizer';
/**
 * Types
 */
import type { LocationWithQuery, Match, Route } from '../../types';

/**
 * Custom hook for matching the current location against registered routes.
 *
 * This hook uses a `RouteRecognizer` instance to match the given location
 * and return a structured match object containing the resolved route and query parameters.
 * @param {LocationWithQuery} location - The current browser location, including query parameters.
 * @param {RouteRecognizer} matcher    - The route recognizer instance used to match the path.
 * @param {string} pathArg             - The argument key used to extract the path from query parameters.
 * @returns {Match} A structured match object containing route details.
 */
export default function useMatch(
	location: LocationWithQuery,
	matcher: RouteRecognizer,
	pathArg: string
): Match {
	const { query: rawQuery = {} } = location;

	return useMemo( () => {
		const { [ pathArg ]: path = '/', ...query } = rawQuery;
		const result = matcher.recognize( path )?.[ 0 ];
		if ( ! result ) {
			return {
				name: '404',
				path: addQueryArgs( path, query ),
				areas: {},
				widths: {},
				query,
				params: {},
			};
		}

		const matchedRoute = result.handler as Route;
		const resolveFunctions = ( record: Record< string, any > = {} ) => {
			return Object.fromEntries(
				Object.entries( record ).map( ( [ key, value ] ) => {
					if ( typeof value === 'function' ) {
						return [ key, value( { query, params: result.params } ) ];
					}
					return [ key, value ];
				} )
			);
		};

		return {
			name: matchedRoute.name,
			areas: resolveFunctions( matchedRoute.areas ),
			widths: resolveFunctions( matchedRoute.widths ),
			params: result.params,
			query,
			path: addQueryArgs( path, query ),
		};
	}, [ matcher, rawQuery, pathArg ] );
}
