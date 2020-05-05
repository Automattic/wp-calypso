/**
 * External dependencies
 */
import moment from 'moment';
import { every, some, includes, get } from 'lodash';

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
	static QueryKey = PostQueryKey;
	static DefaultQuery = DEFAULT_POST_QUERY;

	/**
	 * Returns true if the post matches the given query, or false otherwise.
	 *
	 * @param  {object}  query Query object
	 * @param  {object}  post  Item to consider
	 * @returns {boolean}       Whether post matches query
	 */
	static matches( query, post ) {
		const queryWithDefaults = Object.assign( {}, this.DefaultQuery, query );
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

				case 'term':
					return every( value, ( slugs, taxonomy ) => {
						slugs = slugs.split( ',' );
						return some( post.terms[ taxonomy ], ( { slug } ) => includes( slugs, slug ) );
					} );

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
					return (
						'any' === value ||
						String( value )
							.split( ',' )
							.some( ( status ) => {
								return status === post[ key ];
							} )
					);
			}

			return true;
		} );
	}

	/**
	 * A sort comparison function that defines the sort order of posts under
	 * consideration of the specified query.
	 *
	 * @param  {object} query Query object
	 * @param  {object} postA First post
	 * @param  {object} postB Second post
	 * @returns {number}       0 if equal, less than 0 if postA is first,
	 *                        greater than 0 if postB is first.
	 */
	static compare( query, postA, postB ) {
		let order;

		switch ( query.order_by ) {
			case 'ID':
				order = postA.ID - postB.ID;
				break;

			case 'comment_count':
				order =
					get( postA.discussion, 'comment_count', 0 ) - get( postB.discussion, 'comment_count', 0 );
				break;

			case 'title':
				order = postA.title.localeCompare( postB.title );
				break;

			case 'modified':
				order = new Date( postA.modified ) - new Date( postB.modified );
				break;

			case 'date':
			default:
				order = new Date( postA.date ) - new Date( postB.date );
		}

		// Default to descending order, opposite sign of ordered result
		if ( ! query.order || /^desc$/i.test( query.order ) ) {
			order *= -1;
		}

		return order || 0;
	}
}
