/* eslint-disable jsdoc/require-param */

/**
 * Internal dependencies
 */
import 'calypso/state/route/init';

/**
 * Type dependencies
 */
import type { IAppState } from 'calypso/state/types';

/**
 * Gets the last query parameters set by a ROUTE_SET action
 *
 * TODO: We would be better off not conditioning with null here.
 * Kept for backwards compatibility in case any null checks.
 * Investigate and refactor.
 */
export function getCurrentQueryArguments(
	state: IAppState
): IAppState[ 'route' ][ 'query' ][ 'current' ] | null {
	return state?.route?.query?.current || null;
}

export default getCurrentQueryArguments;
