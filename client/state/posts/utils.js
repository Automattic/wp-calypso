/**
 * External dependencies
 */

import {
	concat,
	get,
	isEmpty,
	isPlainObject,
	filter,
	flow,
	includes,
	initial,
	last,
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
	find,
	reject,
} from 'lodash';
import url from 'url';

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
 * @param  {object} query Posts query
 * @returns {object}       Normalized posts query
 */
export function getNormalizedPostsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_POST_QUERY[ key ] === value );
}

/**
 * Returns a serialized posts query
 *
 * @param  {object} query  Posts query
 * @param  {number} siteId Optional site ID
 * @returns {string}        Serialized posts query
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
 * @param  {string} serializedQuery Serialized posts query
 * @returns {object}                 Deserialized posts query details
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
 * @param  {object} query  Posts query
 * @param  {number} siteId Optional site ID
 * @returns {string}        Serialized posts query
 */
export function getSerializedPostsQueryWithoutPage( query, siteId ) {
	return getSerializedPostsQuery( omit( query, 'page' ), siteId );
}

/*
 * Applies a metadata edit operation (either update or delete) to an existing array of
 * metadata values.
 */
function applyMetadataEdit( metadata, edit ) {
	switch ( edit.operation ) {
		case 'update': {
			// Either update existing key's value or append a new one at the end
			const { key, value } = edit;
			if ( find( metadata, { key } ) ) {
				return map( metadata, m => ( m.key === key ? { key, value } : m ) );
			}
			return concat( metadata || [], { key, value } );
		}
		case 'delete': {
			// Remove a value from the metadata array. If the key is not present,
			// return unmodified original value.
			const { key } = edit;
			if ( find( metadata, { key } ) ) {
				return reject( metadata, { key } );
			}
			return metadata;
		}
	}

	return metadata;
}

function applyMetadataEdits( metadata, edits ) {
	return reduce( edits, applyMetadataEdit, metadata );
}

/**
 * Merges edits into a post object. Essentially performs a deep merge of two objects,
 * except that arrays are treated as atomic values and overwritten rather than merged.
 * That's important especially for term removals.
 *
 * @param  {object} post  Destination post for merge
 * @param  {object} edits Objects with edits
 * @returns {object}       Merged post with applied edits
 */
export function applyPostEdits( post, edits ) {
	return mergeWith( cloneDeep( post ), edits, ( objValue, srcValue, key, obj, src, stack ) => {
		// Merge metadata specially. Only a `metadata` key at top level gets special treatment,
		// keys with the same name in nested objects do not.
		if ( key === 'metadata' && stack.size === 0 ) {
			return applyMetadataEdits( objValue, srcValue );
		}

		if ( Array.isArray( srcValue ) ) {
			return srcValue;
		}
	} );
}

function mergeMetadataEdits( edits, nextEdits ) {
	// remove existing edits that get updated in `nextEdits`
	const newEdits = reject( edits, edit => find( nextEdits, { key: edit.key } ) );
	// append the new edits at the end
	return concat( newEdits, nextEdits );
}

/**
 * Merges an array of post edits (called 'edits log') into one object. Essentially performs
 * a repeated deep merge of two objects, except:
 * - arrays are treated as atomic values and overwritten rather than merged.
 *   That's important especially for term removals.
 * - metadata edits, which are also arrays, are merged with a special algorithm.
 *
 * @param  {Array<Object>} postEditsLog Edits objects to be merged
 * @returns {object?}                    Merged edits object with changes from all sources
 */
export const mergePostEdits = ( ...postEditsLog ) =>
	reduce(
		postEditsLog,
		( mergedEdits, nextEdits ) => {
			// filter out save markers
			if ( isString( nextEdits ) ) {
				return mergedEdits;
			}

			// return the input object if it's the first one to merge (optimization that avoids cloning)
			if ( mergedEdits === null ) {
				return nextEdits;
			}

			// proceed to do the merge
			return mergeWith(
				cloneDeep( mergedEdits ),
				nextEdits,
				( objValue, srcValue, key, obj, src, stack ) => {
					if ( key === 'metadata' && stack.size === 0 ) {
						// merge metadata specially
						return mergeMetadataEdits( objValue, srcValue );
					}

					if ( Array.isArray( srcValue ) ) {
						return srcValue;
					}
				}
			);
		},
		null
	);

/**
 * Appends a new edits object to existing edits log. If the last one is
 * an edits object, they will be merged. If the last one is a save marker,
 * the save marker will be left intact and a new edits object will be appended
 * at the end. This helps to keep the edits log as compact as possible.
 *
 * @param {Array<Object>?} postEditsLog Existing edits log to be appended to
 * @param {object} newPostEdits New edits to be appended to the log
 * @returns {Array<Object>} Merged edits log
 */
export const appendToPostEditsLog = ( postEditsLog, newPostEdits ) => {
	if ( isEmpty( postEditsLog ) ) {
		return [ newPostEdits ];
	}

	const lastEdits = last( postEditsLog );

	if ( isString( lastEdits ) ) {
		return [ ...postEditsLog, newPostEdits ];
	}

	const newEditsLog = initial( postEditsLog );
	newEditsLog.push( mergePostEdits( lastEdits, newPostEdits ) );
	return newEditsLog;
};

/**
 * Memoization cache for `normalizePostForDisplay`. If an identical `post` object was
 * normalized before, retrieve the normalized value from cache instead of recomputing.
 */
const normalizePostCache = new WeakMap();

/**
 * Returns a normalized post object given its raw form. A normalized post
 * includes common transformations to prepare the post for display.
 *
 * @param  {object} post Raw post object
 * @returns {object}      Normalized post object
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
 * @returns {object}      Normalized post object
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
 * @param  {object} post Raw post object
 * @returns {object}      Normalized post object
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
			unset( memo, path.concat( 'meta', 'links' ) );
			return memo;
		},
		normalizedPost
	);
}

/**
 * Takes existing term post edits and updates the `terms_by_id` attribute
 *
 * @param  {object}    post  object of post edits
 * @returns {object}          normalized post edits
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
 * @param  {object} post Raw post object
 * @returns {object}      Normalized post object
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
 * @param  {object}  localTermEdits local state of term edits
 * @param  {object}  savedTerms     term object returned from API POST
 * @returns {boolean}                are there differences in local edits vs saved terms
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
 * @param  {object}  localDiscussionEdits local state of discussion edits
 * @param  {object}  savedDiscussion      discussion property returned from API POST
 * @returns {boolean}                      are there differences in local edits vs saved values?
 */
export function isDiscussionEqual( localDiscussionEdits, savedDiscussion ) {
	return every( localDiscussionEdits, ( value, key ) => get( savedDiscussion, [ key ] ) === value );
}

/**
 * Returns true if the locally edited author ID is equal to the saved post author's ID. Other
 * properties of the `author` object are irrelevant.
 *
 * @param  {object}  localAuthorEdit locally edited author object
 * @param  {object}  savedAuthor     author property returned from API POST
 * @returns {boolean}                 are the locally edited and saved values equal?
 */
export function isAuthorEqual( localAuthorEdit, savedAuthor ) {
	return get( localAuthorEdit, 'ID' ) === get( savedAuthor, 'ID' );
}

export function isDateEqual( localDateEdit, savedDate ) {
	// if the local date edit is false, it means we are asking the server to reset
	// the scheduled date to "now". In that case, we accept the date value returned
	// by the server and consider the edit saved.
	if ( localDateEdit === false ) {
		return true;
	}

	return localDateEdit && new Date( localDateEdit ).getTime() === new Date( savedDate ).getTime();
}

export function isStatusEqual( localStatusEdit, savedStatus ) {
	// When receiving a request to change the `status` attribute, the server
	// treats `publish` and `future` as synonyms. It's really the post's `date`
	// that determines the resulting status, not the requested value.
	// Therefore, the `status` edit is considered saved and removed from the
	// local edits even if the value returned by server is different.
	if ( includes( [ 'publish', 'future' ], localStatusEdit ) ) {
		return includes( [ 'publish', 'future' ], savedStatus );
	}

	// All other statuses (draft, private, pending) are 1:1. The only possible
	// exception is requesting `publish` and not having rights to publish new
	// posts. Then the server sets a `pending` status. But we check for this case
	// in the UI and request `pending` instead of `publish` if the user doesn't
	// have the rights.
	return localStatusEdit === savedStatus;
}

function isUnappliedMetadataEdit( edit, savedMetadata ) {
	const savedRecord = find( savedMetadata, { key: edit.key } );

	// is an update already performed?
	if ( edit.operation === 'update' ) {
		return ! savedRecord || savedRecord.value !== edit.value;
	}

	// is a property already deleted?
	if ( edit.operation === 'delete' ) {
		return !! savedRecord;
	}

	return false;
}

/*
 * Returns edits that are not yet applied, i.e.:
 * - when updating, the property doesn't already have the desired value in `savedMetadata`
 * - when deleting, the property is still present in `savedMetadata`
 */
export function getUnappliedMetadataEdits( edits, savedMetadata ) {
	return filter( edits, edit => isUnappliedMetadataEdit( edit, savedMetadata ) );
}

export function areAllMetadataEditsApplied( edits, savedMetadata ) {
	return every( edits, edit => ! isUnappliedMetadataEdit( edit, savedMetadata ) );
}

/**
 * Returns a normalized post object for sending to the API
 *
 * @param  {object} post Raw post object
 * @returns {object}      Normalized post object
 */
export function normalizePostForApi( post ) {
	if ( ! post ) {
		return null;
	}

	return normalizeApiFlow( post );
}

export const getEditURL = function( post, site ) {
	if ( ! site ) {
		return '/post';
	}

	if ( ! post ) {
		return `/post/${ site.slug }`;
	}

	let path;

	const type = post.type || 'post';
	switch ( type ) {
		case 'post':
			path = '/post';
			break;
		case 'page':
			path = '/page';
			break;
		default:
			path = `/edit/${ type }`;
			break;
	}

	path += `/${ site.slug }`;

	if ( post.ID ) {
		path += `/${ post.ID }`;
	}

	return path;
};

export const getPreviewURL = function( site, post, autosavePreviewUrl ) {
	let parsed, previewUrl;

	if ( ! post || ! post.URL || post.status === 'trash' ) {
		return '';
	}

	if ( autosavePreviewUrl ) {
		previewUrl = autosavePreviewUrl;
	} else if ( post.status === 'publish' ) {
		previewUrl = post.URL;
	} else {
		parsed = url.parse( post.URL, true );
		parsed.query.preview = 'true';
		delete parsed.search;
		previewUrl = url.format( parsed );
	}

	if ( post.site_ID ) {
		if ( ! ( site && site.options ) ) {
			// site info is still loading, just use what we already have until it does
			return previewUrl;
		}
		if ( site.options.is_mapped_domain ) {
			previewUrl = previewUrl.replace( site.URL, site.options.unmapped_url );
		}
		if ( site.options.frame_nonce ) {
			parsed = url.parse( previewUrl, true );
			parsed.query[ 'frame-nonce' ] = site.options.frame_nonce;
			delete parsed.search;
			previewUrl = url.format( parsed );
		}
	}

	return previewUrl;
};

export const userCan = function( capability, post ) {
	const hasCap = post.capabilities && post.capabilities[ capability ];

	if ( capability === 'edit_post' ) {
		return hasCap && post.status !== 'trash';
	}

	return hasCap;
};

// Return backdated-published status of a post. Optionally, the `status` can be overridden
// with a custom value: what would the post status be if a `status` edit was applied?
export const isBackDatedPublished = function( post, status ) {
	if ( ! post ) {
		return false;
	}

	const effectiveStatus = status || post.status;

	return effectiveStatus === 'future' && new Date( post.date ) < Date.now();
};

// Return published status of a post. Optionally, the `status` can be overridden
// with a custom value: what would the post status be if a `status` edit was applied?
export const isPublished = function( post, status ) {
	if ( ! post ) {
		return false;
	}

	const effectiveStatus = status || post.status;

	return (
		effectiveStatus === 'publish' ||
		effectiveStatus === 'private' ||
		isBackDatedPublished( post, status )
	);
};

export const isScheduled = function( post ) {
	if ( ! post ) {
		return false;
	}

	return post.status === 'future';
};

export const isPrivate = function( post ) {
	if ( ! post ) {
		return false;
	}

	return post.status === 'private';
};

export const isPending = function( post ) {
	if ( ! post ) {
		return false;
	}

	return post.status === 'pending';
};

export const getEditedTime = function( post ) {
	if ( ! post ) {
		return;
	}

	if ( post.status === 'publish' || post.status === 'future' ) {
		return post.date;
	}

	return post.modified;
};

export const isFutureDated = function( post ) {
	if ( ! post ) {
		return false;
	}

	const oneMinute = 1000 * 60;

	return post && +new Date() + oneMinute < +new Date( post.date );
};

export const isBackDated = function( post ) {
	if ( ! post || ! post.date || ! post.modified ) {
		return false;
	}

	return new Date( post.date ) < new Date( post.modified );
};

export const isPage = function( post ) {
	if ( ! post ) {
		return false;
	}

	return post && 'page' === post.type;
};

export const getVisibility = function( post ) {
	if ( ! post ) {
		return null;
	}

	if ( post.password ) {
		return 'password';
	}

	if ( 'private' === post.status ) {
		return 'private';
	}

	return 'public';
};

export const removeSlug = function( path ) {
	if ( ! path ) {
		return;
	}

	const pathParts = path.slice( 0, -1 ).split( '/' );
	pathParts[ pathParts.length - 1 ] = '';

	return pathParts.join( '/' );
};

export const getPermalinkBasePath = function( post ) {
	if ( ! post ) {
		return;
	}

	let path = post.URL;

	// if we have a permalink_URL, utlize that
	if ( ! isPublished( post ) && post.other_URLs && post.other_URLs.permalink_URL ) {
		path = post.other_URLs.permalink_URL;
	}

	return removeSlug( path );
};

export const getPagePath = function( post ) {
	if ( ! post ) {
		return;
	}
	if ( ! isPublished( post ) ) {
		return getPermalinkBasePath( post );
	}

	return removeSlug( post.URL );
};

/**
 * Returns the ID of the featured image assigned to the specified post, or
 * `undefined` otherwise. A utility function is useful because the format
 * of a post varies between the retrieve and update endpoints. When
 * retrieving a post, the thumbnail ID is assigned in `post_thumbnail`, but
 * in creating a post, the thumbnail ID is assigned to `featured_image`.
 *
 * @param  {object} post Post object
 * @returns {*} featured image id or undefined
 */
export const getFeaturedImageId = function( post ) {
	if ( ! post ) {
		return;
	}

	if ( 'featured_image' in post && ! /^https?:\/\//.test( post.featured_image ) ) {
		// Return the `featured_image` property if it does not appear to be
		// formatted as a URL
		return post.featured_image;
	}

	if ( post.post_thumbnail ) {
		// After the initial load from the REST API, pull the numeric ID
		// from the thumbnail object if one exists
		return post.post_thumbnail.ID;
	}
};
