/** @format */

/**
 * External dependencies
 */

import {
	get,
	isEmpty,
	isPlainObject,
	flow,
	map,
	mapValues,
	mergeWith,
	omit,
	omitBy,
	reduce,
	toArray,
	cloneDeep,
	pickBy,
	isString,
	every,
	unset,
	xor,
} from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_POST_QUERY } from './constants';
import pickCanonicalImage from 'lib/post-normalizer/rule-pick-canonical-image';
import decodeEntities from 'lib/post-normalizer/rule-decode-entities';
import detectMedia from 'lib/post-normalizer/rule-content-detect-media';
import withContentDom from 'lib/post-normalizer/rule-with-content-dom';
import stripHtml from 'lib/post-normalizer/rule-strip-html';

/**
 * Constants
 */

const REGEXP_SERIALIZED_QUERY = /^((\d+):)?(.*)$/;

/**
 * Utility
 */

const normalizeEditedFlow = flow( [ getTermIdsFromEdits ] );

const normalizeApiFlow = flow( [ normalizeTermsForApi ] );

const normalizeDisplayFlow = flow( [
	decodeEntities,
	stripHtml,
	withContentDom( [ detectMedia ] ),
	pickCanonicalImage,
] );

/**
 * Returns a normalized posts query, excluding any values which match the
 * default post query.
 *
 * @param  {Object} query Posts query
 * @return {Object}       Normalized posts query
 */
export function getNormalizedPostsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_POST_QUERY[ key ] === value );
}

/**
 * Returns a serialized posts query
 *
 * @param  {Object} query  Posts query
 * @param  {Number} siteId Optional site ID
 * @return {String}        Serialized posts query
 */
export function getSerializedPostsQuery( query = {}, siteId ) {
	const normalizedQuery = getNormalizedPostsQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	if ( siteId ) {
		return [ siteId, serializedQuery ].join( ':' );
	}

	return serializedQuery;
}

/**
 * Returns an object with details related to the specified serialized query.
 * The object will include siteId and/or query object, if can be parsed.
 *
 * @param  {String} serializedQuery Serialized posts query
 * @return {Object}                 Deserialized posts query details
 */
export function getDeserializedPostsQueryDetails( serializedQuery ) {
	let siteId, query;

	const matches = serializedQuery.match( REGEXP_SERIALIZED_QUERY );
	if ( matches ) {
		siteId = Number( matches[ 2 ] ) || undefined;
		try {
			query = JSON.parse( matches[ 3 ] );
		} catch ( error ) {}
	}

	return { siteId, query };
}

/**
 * Returns a serialized posts query, excluding any page parameter
 *
 * @param  {Object} query  Posts query
 * @param  {Number} siteId Optional site ID
 * @return {String}        Serialized posts query
 */
export function getSerializedPostsQueryWithoutPage( query, siteId ) {
	return getSerializedPostsQuery( omit( query, 'page' ), siteId );
}

/**
 * Merges edits into a post object. Essentially performs a deep merge of two objects,
 * except that arrays are treated as atomic values and overwritten rather than merged.
 * That's important especially for term removals.
 *
 * @param  {Object} post  Destination post for merge
 * @param  {Object} edits Objects with edits
 * @return {Object}       Merged post with applied edits
 */
export function applyPostEdits( post, edits ) {
	return mergeWith( cloneDeep( post ), edits, ( objValue, srcValue ) => {
		if ( Array.isArray( srcValue ) ) {
			return srcValue;
		}
	} );
}

/**
 * Merges two post edits objects into one. Essentially performs a deep merge of two objects,
 * except that arrays are treated as atomic values and overwritten rather than merged.
 * That's important especially for term removals.
 *
 * @param  {Object} edits     Destination edits object for merge
 * @param  {Object} nextEdits Edits object to be merged
 * @return {Object}           Merged edits object with changes from both sources
 */
export function mergePostEdits( edits, nextEdits ) {
	return mergeWith( cloneDeep( edits ), nextEdits, ( objValue, srcValue ) => {
		if ( Array.isArray( srcValue ) ) {
			return srcValue;
		}
	} );
}

/**
 * Memoization cache for `normalizePostForDisplay`. If an identical `post` object was
 * normalized before, retrieve the normalized value from cache instead of recomputing.
 */
const normalizePostCache = new WeakMap();

/**
 * Returns a normalized post object given its raw form. A normalized post
 * includes common transformations to prepare the post for display.
 *
 * @param  {Object} post Raw post object
 * @return {Object}      Normalized post object
 */
export function normalizePostForDisplay( post ) {
	if ( ! post ) {
		return null;
	}

	let normalizedPost = normalizePostCache.get( post );
	if ( ! normalizedPost ) {
		// `normalizeDisplayFlow` mutates its argument properties -- hence deep clone is needed
		normalizedPost = normalizeDisplayFlow( cloneDeep( post ) );
		normalizePostCache.set( post, normalizedPost );
	}
	return normalizedPost;
}

/**
 * Given a post object, returns a normalized post object
 *
 * @param  {Ojbect} post Raw edited post object
 * @return {Object}      Normalized post object
 */
export function normalizePostForEditing( post ) {
	if ( ! post ) {
		return null;
	}

	return normalizeEditedFlow( post );
}

/**
 * Given a post object, returns a normalized post object prepared for storing
 * in the global state object.
 *
 * @param  {Object} post Raw post object
 * @return {Object}      Normalized post object
 */
export function normalizePostForState( post ) {
	const normalizedPost = cloneDeep( post );
	return reduce(
		[
			[],
			...reduce(
				post.terms,
				( memo, terms, taxonomy ) =>
					memo.concat( map( terms, ( term, slug ) => [ 'terms', taxonomy, slug ] ) ),
				[]
			),
			...map( post.categories, ( category, slug ) => [ 'categories', slug ] ),
			...map( post.tags, ( tag, slug ) => [ 'tags', slug ] ),
			...map( post.attachments, ( attachment, id ) => [ 'attachments', id ] ),
		],
		( memo, path ) => {
			unset( memo, path.concat( 'meta' ) );
			return memo;
		},
		normalizedPost
	);
}

/**
 * Takes existing term post edits and updates the `terms_by_id` attribute
 *
 * @param  {Object}    post  object of post edits
 * @return {Object}          normalized post edits
 */
export function getTermIdsFromEdits( post ) {
	if ( ! post || ! post.terms ) {
		return post;
	}

	// Filter taxonomies that are set as arrays ( i.e. tags )
	// This can be detected by an array of strings vs an array of objects
	const taxonomies = reduce(
		post.terms,
		( prev, taxonomyTerms, taxonomyName ) => {
			// Ensures we are working with an array
			const termsArray = toArray( taxonomyTerms );
			if ( termsArray && termsArray.length && ! isPlainObject( termsArray[ 0 ] ) ) {
				return prev;
			}

			prev[ taxonomyName ] = termsArray;
			return prev;
		},
		{}
	);

	if ( isEmpty( taxonomies ) ) {
		return post;
	}

	return {
		...post,
		terms_by_id: mapValues( taxonomies, taxonomy => {
			const termIds = map( taxonomy, 'ID' );

			// Hack: qs omits empty arrays in wpcom.js request, which prevents
			// removing all terms for a given taxonomy since the empty array is not sent to the API
			return termIds.length ? termIds : null;
		} ),
	};
}

/**
 * Returns a normalized post terms object for sending to the API
 *
 * @param  {Object} post Raw post object
 * @return {Object}      Normalized post object
 */
export function normalizeTermsForApi( post ) {
	if ( ! post || ! post.terms ) {
		return post;
	}

	return {
		...post,
		terms: pickBy( post.terms, terms => {
			return terms.length && every( terms, isString );
		} ),
	};
}

/**
 * Returns truthy if local terms object is the same as the API response
 *
 * @param  {Object}  localTermEdits local state of term edits
 * @param  {Object}  savedTerms     term object returned from API POST
 * @return {Boolean}                are there differences in local edits vs saved terms
 */
export function isTermsEqual( localTermEdits, savedTerms ) {
	return every( localTermEdits, ( terms, taxonomy ) => {
		const termsArray = toArray( terms );
		const isHierarchical = isPlainObject( termsArray[ 0 ] );
		const normalizedEditedTerms = isHierarchical ? map( termsArray, 'ID' ) : termsArray;
		const normalizedKey = isHierarchical ? 'ID' : 'name';
		const normalizedSavedTerms = map( savedTerms[ taxonomy ], normalizedKey );
		return ! xor( normalizedEditedTerms, normalizedSavedTerms ).length;
	} );
}

/**
 * Returns true if the modified properties in the local edit of the `discussion` object (the edited
 * properties are a subset of the full object) are equal to the values in the saved post.
 *
 * @param  {Object}  localDiscussionEdits local state of discussion edits
 * @param  {Object}  savedDiscussion      discussion property returned from API POST
 * @return {Boolean}                      are there differences in local edits vs saved values?
 */
export function isDiscussionEqual( localDiscussionEdits, savedDiscussion ) {
	return every( localDiscussionEdits, ( value, key ) => get( savedDiscussion, [ key ] ) === value );
}

/**
 * Returns true if the locally edited author ID is equal to the saved post author's ID. Other
 * properties of the `author` object are irrelevant.
 *
 * @param  {Object}  localAuthorEdit locally edited author object
 * @param  {Object}  savedAuthor     author property returned from API POST
 * @return {Boolean}                 are the locally edited and saved values equal?
 */
export function isAuthorEqual( localAuthorEdit, savedAuthor ) {
	return get( localAuthorEdit, 'ID' ) === get( savedAuthor, 'ID' );
}

/**
 * Returns a normalized post object for sending to the API
 *
 * @param  {Object} post Raw post object
 * @return {Object}      Normalized post object
 */
export function normalizePostForApi( post ) {
	if ( ! post ) {
		return null;
	}

	return normalizeApiFlow( post );
}
