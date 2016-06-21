/**
 * External dependencies
 */
import moment from 'moment';
import every from 'lodash/every';
import some from 'lodash/some';
import includes from 'lodash/includes';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import PostQueryKey from './key';
import { DEFAULT_POST_QUERY } from './constants';

/**
 * PostQueryManager manages posts which can be queried and change over time
 */
export default class PostQueryManager extends PaginatedQueryManager {
	/**
	 * Returns true if the post matches the given query, or false otherwise.
	 *
	 * @param  {Object}  query Query object
	 * @param  {Object}  post  Item to consider
	 * @return {Boolean}       Whether post matches query
	 */
	matches( query, post ) {
		const queryWithDefaults = Object.assign( {}, DEFAULT_POST_QUERY, query );
		return every( queryWithDefaults, ( value, key ) => {
			switch ( key ) {
				case 'search':
					if ( ! value ) {
						return true;
					}

					const search = value.toLowerCase();
					return (
						( post.title && includes( post.title.toLowerCase(), search ) ) ||
						( post.content && includes( post.content.toLowerCase(), search ) )
					);

				case 'after':
				case 'before':
				case 'modified_after':
				case 'modified_before': {
					const queryDate = moment( value, moment.ISO_8601 );
					const comparison = /after$/.test( key ) ? 'isAfter' : 'isBefore';
					const field = /^modified_/.test( key ) ? 'modified' : 'date';
					return queryDate.isValid() && moment( post[ field ] )[ comparison ]( queryDate );
				}

				case 'tag':
				case 'category': {
					if ( ! value ) {
						return true;
					}

					const valueLowercase = value.toLowerCase();
					const field = 'tag' === key ? 'tags' : 'categories';
					return some( post[ field ], ( { name, slug } ) => {
						return (
							( name && name.toLowerCase() === valueLowercase ) ||
							( slug && slug.toLowerCase() === valueLowercase )
						);
					} );
				}

				case 'type':
					return 'any' === value || value === post.type;

				case 'parent_id':
					return value === post.parent || ( post.parent && value === post.parent.ID );

				case 'exclude':
					if ( Array.isArray( value ) ) {
						return ! includes( value, post.ID );
					}

					return value !== post.ID;

				case 'sticky':
					if ( 'require' === value ) {
						return post.sticky;
					} else if ( 'exclude' === value ) {
						return ! post.sticky;
					}

					return true;

				case 'author':
					return get( post, 'author.ID', post.author ) === value;

				case 'status':
					return 'any' === value || String( value ).split( ',' ).some( ( status ) => {
						return status === post[ key ];
					} );
			}

			return true;
		} );
	}

	/**
	 * A sort comparison function that defines the sort order of posts under
	 * consideration of the specified query.
	 *
	 * @param  {Object} query Query object
	 * @param  {Object} postA First post
	 * @param  {Object} postB Second post
	 * @return {Number}       0 if equal, less than 0 if postA is first,
	 *                        greater than 0 if postB is first.
	 */
	sort( query, postA, postB ) {
		let order;

		switch ( query.order_by ) {
			case 'ID':
				order = postA.ID - postB.ID;
				break;

			case 'comment_count':
				order = get( postA.discussion, 'comment_count', 0 ) - get( postB.discussion, 'comment_count', 0 );
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
}

PostQueryManager.QueryKey = PostQueryKey;

PostQueryManager.DEFAULT_QUERY = DEFAULT_POST_QUERY;
