/**
 * External dependencies
 */
import moment from 'moment';
import { every, includes } from 'lodash';

/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import MediaQueryKey from './key';
import { DEFAULT_MEDIA_QUERY } from './constants';

/**
 * MediaQueryManager manages media which can be queried and change over time
 */
export default class MediaQueryManager extends PaginatedQueryManager {
	static QueryKey = MediaQueryKey;
	static DefaultQuery = DEFAULT_MEDIA_QUERY;

	/**
	 * Returns true if the media item matches the given query, or false
	 * otherwise.
	 *
	 * @param  {object}  query Query object
	 * @param  {object}  media Item to consider
	 * @returns {boolean}       Whether media item matches query
	 */
	static matches( query, media ) {
		return every( { ...this.DefaultQuery, ...query }, ( value, key ) => {
			switch ( key ) {
				case 'search':
					if ( ! value ) {
						return true;
					}

					return media.title && includes( media.title.toLowerCase(), value.toLowerCase() );

				case 'mime_type':
					if ( ! value ) {
						return true;
					}

					// See: https://developer.wordpress.org/reference/functions/wp_post_mime_type_where/
					return new RegExp(
						`^${ value
							// Replace wildcard-only, wildcard group, and empty
							// group with wildcard pattern matching
							.replace( /(^%|(\/)%?)$/, '$2.+' )
							// Split subgroup and group to filter
							.split( '/' )
							// Remove invalid characters
							.map( ( group ) => group.replace( /[^-*.+a-zA-Z0-9]/g, '' ) )
							// If no group, append wildcard match
							.concat( '.+' )
							// Take only subgroup and group
							.slice( 0, 2 )
							// Finally, merge back into string
							.join( '/' ) }$`
					).test( media.mime_type );

				case 'post_ID':
					// Note that documentation specifies that query value of 0
					// will match only media not attached to posts, but since
					// those media items assign post_ID of 0, we can still
					// match by equality
					return value === media.post_ID;

				case 'after':
				case 'before':
					const queryDate = moment( value, moment.ISO_8601 );
					const comparison = /after$/.test( key ) ? 'isAfter' : 'isBefore';
					return queryDate.isValid() && moment( media.date )[ comparison ]( queryDate );
			}

			return true;
		} );
	}

	/**
	 * A sort comparison function that defines the sort order of media items
	 * under consideration of the specified query.
	 *
	 * @param  {object} query  Query object
	 * @param  {object} mediaA First media item
	 * @param  {object} mediaB Second media item
	 * @returns {number}        0 if equal, less than 0 if mediaA is first,
	 *                         greater than 0 if mediaB is first.
	 */
	static compare( query, mediaA, mediaB ) {
		let order;

		switch ( query.order_by ) {
			case 'ID':
				order = mediaA.ID - mediaB.ID;
				break;

			case 'title':
				order = mediaA.title.localeCompare( mediaB.title );
				break;

			case 'date':
			default:
				order = moment( mediaA.date ).diff( mediaB.date );
		}

		// Default to descending order, opposite sign of ordered result
		if ( ! query.order || /^desc$/i.test( query.order ) ) {
			order *= -1;
		}

		return order || 0;
	}
}
