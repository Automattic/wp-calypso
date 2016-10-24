/**
 * External dependencies
 */
import omit from 'lodash/omit';
/**
 * Internal dependencies
 */
import deterministicStringify from 'lib/deterministic-stringify';

/**
 * Converts an object of query parameters into an alphebetically ordered string
 * that is used as a unique identifier for the query.
 *
 * @param  {Object} query A list of query parameters
 * @return {String}       Alphabetically ordered string of query parameters and values
 */
export function getSerializedQuery( query ) {
	return deterministicStringify( omit( query, [ 'page', 'max' ] ) );
}

/**
 * Normalizes a follower object. Changes 'avatar' to 'avatar_URL' allowing a follower
 * object to be used with the Gravatar component.
 *
 * @param  {Object} follower A follower ojbect
 * @return {Object}          A normalized follower object
 */
export function normalizeFollower( follower ) {
	follower.avatar_URL = follower.avatar;
	return follower;
}
