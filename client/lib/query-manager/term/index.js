/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import TermQueryKey from './key';
import { DEFAULT_TERM_QUERY } from './constants';

/**
 * TermQueryManager manages terms which can be queried and change over time
 */
export default class TermQueryManager extends PaginatedQueryManager {
	static QueryKey = TermQueryKey;
	static DefaultQuery = DEFAULT_TERM_QUERY;

	/**
	 * Returns true if the term matches the given query, or false otherwise.
	 *
	 * @param  {object}  query Query object
	 * @param  {object}  term  Item to consider
	 * @returns {boolean}       Whether term matches query
	 */
	static matches( query, term ) {
		if ( ! query.search ) {
			return true;
		}

		const search = query.search.toLowerCase();
		return (
			( term.name && includes( term.name.toLowerCase(), search ) ) ||
			( term.slug && includes( term.slug.toLowerCase(), search ) )
		);
	}

	/**
	 * A sort comparison function that defines the sort order of terms under
	 * consideration of the specified query.
	 *
	 * @param  {object} query Query object
	 * @param  {object} termA First term
	 * @param  {object} termB Second term
	 * @returns {number}       0 if equal, less than 0 if termA is first,
	 *                        greater than 0 if termB is first.
	 */
	static compare( query, termA, termB ) {
		let order;

		switch ( query.order_by ) {
			case 'count':
				order = termA.post_count - termB.post_count;
				break;
			case 'name':
			default:
				order = termA.name.localeCompare( termB.name );
				break;
		}

		// Default to ascending order. When descending, reverse order.
		if ( /^desc$/i.test( query.order ) ) {
			order *= -1;
		}

		return order || 0;
	}
}
