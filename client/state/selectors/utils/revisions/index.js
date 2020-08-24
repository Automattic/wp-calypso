/**
 * External dependencies
 */

import { cloneDeep, get, identity } from 'lodash';

/**
 * Internal dependencies
 */
import decodeEntities from 'lib/post-normalizer/rule-decode-entities';

/**
 * Wraps a given value in a fake Maybe monad, passes it to a given function
 * operating on the monad, and returns the extracted value.
 *
 * For simplicity, the monad is just a one-element array containing `value`. At
 * any moment, this array will either contain one element, or none -- signaling
 * that something failed. This is enough to facilitate simple transforms using
 * `map` to manipulate `value`, and `filter` to short-circuit any further
 * manipulations.
 *
 * @example
 * // Either returns the output of `fetch( endpoint )`, or `null` if any filter
 * // check failed.
 * runMaybe( payload, maybe => maybe
 * 		.filter( payload => isValidNonce( payload.nonce ) )
 * 		.map( payload => payload.filePath )
 * 		.filter( isValidPath )
 * 		.map( path => `/api/${ camelCase( path ) }` )
 * 		.map( endpoint => fetch( endpoint ) ) )
 *
 * @param {any} input - Anything. The world is your oyster.
 * @param {Function} fn - A function expecting an array of size {0,1} and returning the same kind of array.
 * @returns {?*} The value returned by `fn`, extracted from the array, or `null`.
 */
const runMaybe = ( input, fn ) => get( fn( [ input ] ), 0, null );

const normalizeForFields = ( fields ) => ( revision ) =>
	runMaybe( revision, ( maybe ) =>
		maybe
			.filter( Boolean )
			.map( cloneDeep )
			.map( ( post ) => decodeEntities( post, fields ) )
	);

const NORMALIZER_MAPPING = {
	display: normalizeForFields( [ 'content', 'excerpt', 'title', 'site_name' ] ),
	editing: normalizeForFields( [ 'excerpt', 'title', 'site_name' ] ),
};

const injectAuthor = ( state ) => ( revision ) => {
	const author = get( state.users.items, revision.post_author );
	return author ? { ...revision, author } : revision;
};

export function hydrateRevision( state, revision ) {
	return runMaybe( revision, ( maybe ) => maybe.filter( Boolean ).map( injectAuthor( state ) ) );
}

export function normalizeRevision( normalizerName, revision ) {
	return get( NORMALIZER_MAPPING, normalizerName, identity )( revision );
}
