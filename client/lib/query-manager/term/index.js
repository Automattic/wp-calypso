/**
 * External dependencies
 */
import includes from 'lodash/includes';

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
	/**
	 * Returns true if the term matches the given query, or false otherwise.
	 *
	 * @param  {Object}  query Query object
	 * @param  {Object}  term  Item to consider
	 * @return {Boolean}       Whether term matches query
	 */
	matches( query, term ) {
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
	 * @param  {Object} query Query object
	 * @param  {Object} termA First term
	 * @param  {Object} termB Second term
	 * @return {Number}       0 if equal, less than 0 if termA is first,
	 *                        greater than 0 if termB is first.
	 */
	sort( query, termA, termB ) {
		let order;

		switch ( query.order_by ) {
			case 'name':
				order = termA.name.localeCompare( termB.name );
				break;

			case 'count':
				order = termA.post_count - termB.post_count;
				break;
		}

		// Default to ascending order. When descending, reverse order.
		if ( /^desc$/i.test( query.order ) ) {
			order *= -1;
		}

		return order || 0;
	}
}

TermQueryManager.QueryKey = TermQueryKey;

TermQueryManager.DEFAULT_QUERY = DEFAULT_TERM_QUERY;
