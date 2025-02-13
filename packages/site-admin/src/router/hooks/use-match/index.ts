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
