/**
 * External dependencies
 */
import { omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_POST_QUERY } from 'calypso/state/posts/constants';

/**
 * Returns a normalized posts query, excluding any values which match the
 * default post query.
 *
 * @param  {object} query Posts query
 * @returns {object}       Normalized posts query
 */
export function getNormalizedPostsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_POST_QUERY[ key ] === value );
}
