/** @format */
/**
 * External dependencies
 */
import { every, flatMap, includes, intersection, reduce, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import ThemeQueryKey from './key';
import { DEFAULT_THEME_QUERY } from './constants';

/**
 * ThemeQueryManager manages themes which can be queried
 */
export default class ThemeQueryManager extends PaginatedQueryManager {
	static QueryKey = ThemeQueryKey;
	static DefaultQuery = DEFAULT_THEME_QUERY;

	/**
	 * Returns true if the theme item matches the given query, or false
	 * otherwise.
	 *
	 * @param  {Object}  query Query object
	 * @param  {Object}  theme Item to consider
	 * @return {Boolean}       Whether theme item matches query
	 */
	static matches( query, theme ) {
		return every( { ...this.DefaultQuery, ...query }, ( value, key ) => {
			switch ( key ) {
				case 'search':
					if ( ! value ) {
						return true;
					}
					return theme.name && includes( theme.name.toLowerCase(), value.toLowerCase() );

				case 'filter':
					if ( ! value ) {
						return true;
					}
					const filters = uniq( value.split( '+' ) );
					// create an array of taxonomy slugs from the theme taxonomies collection
					const taxonomies = flatMap( theme.taxonomies, taxonomyGroup => {
						return reduce(
							taxonomyGroup,
							( result, taxonomy ) => {
								result.push( taxonomy.slug );
								return result;
							},
							[]
						);
					} );
					const matchedTaxonomies = intersection( filters, taxonomies );

					// all filters should match taxonomies
					return matchedTaxonomies.length === filters.length;

				case 'tier':
					if ( ! value ) {
						return true;
					}

					const isFree = ( theme.cost && theme.cost.number === 0 ) || ! theme.price;
					return 'free' === value ? isFree : ! isFree;
			}

			return true;
		} );
	}

	/**
	 * A sorting function that defines the sort order of items under
	 * consideration of the specified query.
	 *
	 * Note that this isn't doing anything so the results are kept in the order they
	 * are received from the endpoint.
	 * The themes query REST API endpoint uses ElasticSearch to sort results by
	 * relevancy, which we cannot easily mimick on the client side.
	 */
	static sort() {
		return; // Leave the keys argument unchanged.
	}
}
