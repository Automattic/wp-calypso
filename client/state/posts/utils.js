/**
 * External dependencies
 */
import moment from 'moment';
import get from 'lodash/get';
import includes from 'lodash/includes';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import some from 'lodash/some';

/**
 * Internal dependencies
 */
import { DEFAULT_POST_QUERY } from './constants';

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
 * Returns a serialized posts query, used as the key in the
 * `state.posts.queries` state object.
 *
 * @param  {Object} query  Posts query
 * @param  {Number} siteId Optional site ID
 * @return {String}        Serialized posts query
 */
export function getSerializedPostsQuery( query = {}, siteId ) {
	const normalizedQuery = getNormalizedPostsQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery ).toLocaleLowerCase();

	if ( siteId ) {
		return [ siteId, serializedQuery ].join( ':' );
	}

	return serializedQuery;
}

/**
 * Returns a serialized posts query, excluding any page parameter, used as the
 * key in the `state.posts.queriesLastPage` state object.
 *
 * @param  {Object} query  Posts query
 * @param  {Number} siteId Optional site ID
 * @return {String}        Serialized posts query
 */
export function getSerializedPostsQueryWithoutPage( query, siteId ) {
	return getSerializedPostsQuery( omit( query, 'page' ), siteId );
}

/**
 * Taks a query key name and returns a function that takes a post and a filterValue
 * and returns a Boolean Whether the post match the query value or not
 * The query key can be one of (after, before, modified_after, modified_before)
 *
 * @param  {String} key Query Key
 * @return {Function}   Post filtering function
 */
function doPostMatchDate( key ) {
	return ( post, value ) => {
		const queryDate = moment( value, moment.ISO_8601 );
		const comparison = /after$/.test( key ) ? 'isAfter' : 'isBefore';
		const field = /^modified_/.test( key ) ? 'modified' : 'date';
		return queryDate.isValid() && moment( post[ field ] )[ comparison ]( queryDate );
	};
}

/**
 * Taks a query key name and returns a function that takes a post and a filterValue
 * and returns a Boolean Whether the post match the query value or not
 * The query key can be one of (tag, category)
 *
 * @param  {String} key Query Key
 * @return {Function}   Post filtering function
 */
function doPostMatchTagCategory( key ) {
	return ( post, value ) => {
		const search = new RegExp( `^${ value }$`, 'i' );
		const field = 'tag' === key ? 'tags' : 'categories';
		return some( post[ field ], ( { name, slug } ) => {
			return search.test( name ) || search.test( slug );
		} );
	};
}

/**
 * Takes a post and checks Whether the post match the type
 *
 * @param  {Object} post  Post object
 * @param  {string} value Post Type
 * @return {Boolean}      Whether the post has value as type
 */
function doPostMatchType( post, value ) {
	return 'any' === value || value === post.type;
}

/**
 * Takes a post and check if he has value as parent
 *
 * @param  {Object} post  Post object
 * @param  {string} value Post ID
 * @return {Boolean}      Whether the post has value as parent
 */
function doPostMatchParent( post, value ) {
	return value === post.parent;
}

/**
 * Checkes Whether the post is excluded
 *
 * @param  {Object} post  Post object
 * @param  {Array} value  Post Ids
 * @return {Boolean}      Whether the post is excluded
 */
function doPostMatchExclude( post, value ) {
	if ( Array.isArray( value ) ) {
		return ! includes( value, post.ID );
	}

	return value !== post.ID;
}

/**
 * Check if the post is excluded from query
 * based on the value of the sticky filter
 *
 * @param  {Object} post  Post object
 * @param  {string} value Sticky filter value
 * @return {Boolean}      Whether the post is excluded
 */
function doPostMatchSticky( post, value ) {
	if ( 'require' === value ) {
		return post.sticky;
	} else if ( 'exclude' === value ) {
		return ! post.sticky;
	}

	return true;
}

/**
 * Checks if the post author matchs the provided value
 *
 * @param  {Object} post  Post object
 * @param  {Number} value Author ID
 * @return {Boolean}      Whether the post has the provided author
 */
function doPostMatchAuthor( post, value ) {
	return get( post, 'author.ID', post.author ) === value;
}

/**
 * Checks if the post status matchs the provided value
 *
 * @param  {Object} post  Post object
 * @param  {Number} value Post status
 * @return {Boolean}      Whether the post has the provided status
 */
function doPostMatchStatus( post, value ) {
	return value === post.status;
}

const matchingFunctions = {
	after: doPostMatchDate( 'after' ),
	before: doPostMatchDate( 'before' ),
	modified_after: doPostMatchDate( 'modified_after' ),
	modified_before: doPostMatchDate( 'modified_before' ),
	tag: doPostMatchTagCategory( 'tag' ),
	category: doPostMatchTagCategory( 'category' ),
	type: doPostMatchType,
	parent_id: doPostMatchParent,
	exclude: doPostMatchExclude,
	sticky: doPostMatchSticky,
	author: doPostMatchAuthor,
	status: doPostMatchStatus
};

/**
 * Checks Whether the post matchs the provided query key
 *
 * @param  {Object} post  Post object
 * @param  {Object} query Posts query object
 * @param  {String} key   Query key
 * @return {Boolean}      Whether the post matchs the query key
 */
function doPostMatchQueryKey( post, query, key ) {
	const doMatch = matchingFunctions[key];
	return ! ( key in query ) || doMatch( post, query[key] );
}

/**
 * Checks Whether the post matchs the provided query
 *
 * @param  {Object} post  Post object
 * @param  {Object} query Posts query object
 * @return {Boolean}      Whether the post matchs the query
 */
export function doPostMatchQuery( post, query ) {
	return Object.keys( matchingFunctions )
		.every( key => doPostMatchQueryKey( post, query, key ) );
}

/**
 * Sort Compare Function based on a query object
 *
 * @param  {Object} query  Posts query object
 * @param  {Object} postA  Post object
 * @param  {Object} postB  Post object
 * @return {Number}        Whether postA is greater/lower or equal to postB
 */
function comparePostsByQuery( query, postA, postB ) {
	let order;

	switch ( query.order_by ) {
		case 'ID':
			order = postA.ID - postB.ID;
			break;

		case 'comment_count':
			order = postA.discussion.comment_count - postB.discussion.comment_count;
			break;

		case 'title':
			order = postA.title.localeCompare( postB.title );
			break;

		case 'modified':
			order = moment( postA.modified ).diff( postB.modified );
			break;

		case 'date':
		default:
			order = moment( postA.date ).diff( postB.date );
	}

	// Default to descending order, opposite sign of ordered result
	if ( ! query.order || /^desc$/i.test( query.order ) ) {
		order *= -1;
	}

	return order || 0;
}

/**
 * Apply query filtering, pagination and sorting to a post list
 *
 * @param  {Array} posts  Posts list
 * @param  {Object} query Posts query object
 * @return {Array}        Posts for the post query
 */
export function applyQueryToPostsList( posts, query ) {
	const { number = 20, offset = 0, page } = query,
		startAt = page ? ( page - 1 * number ) : offset;

	return posts
		.filter( post => doPostMatchQuery( post, query ) )
		.sort( ( postA, postB ) => comparePostsByQuery( query, postA, postB ) )
		.splice( startAt, number );
}
