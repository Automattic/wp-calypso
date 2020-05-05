/**
 * External dependencies
 */
import deterministicStringify from 'fast-json-stable-stringify';
import { omit } from 'lodash';

/**
 * Converts an object of query parameters into an alphebetically ordered string
 * that is used as a unique identifier for the query.
 *
 * @param  {object} query A list of query parameters
 * @returns {string}       Alphabetically ordered string of query parameters and values
 */
export function getSerializedQuery( query ) {
	return deterministicStringify( omit( query, [ 'page', 'max' ] ) );
}

/**
 * Normalizes a follower object. Changes 'avatar' to 'avatar_URL' allowing a follower
 * object to be used with the Gravatar component.
 *
 * @param  {object} follower A follower ojbect
 * @returns {object}          A normalized follower object
 */
export function normalizeFollower( follower ) {
	follower.avatar_URL = follower.avatar;
	return follower;
}
