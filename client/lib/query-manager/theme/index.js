/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import ThemeQueryKey from './key';
import { DEFAULT_THEME_QUERY } from './constants';
import { isThemeFromWpcom } from 'state/themes/utils';

/**
 * ThemeQueryManager manages themes which can be queried
 */
export default class ThemeQueryManager extends PaginatedQueryManager {

	/**
	 * A sorting function that defines the sort order of items under
	 * consideration of the specified query.
	 *
	 * Note that this isn't doing anything so the results are kept in the order they
	 * are received from the endpoint.
	 * The themes query REST API endpoint uses ElasticSearch to sort results by
	 * relevancy, which we cannot easily mimick on the client side.
	 */
	sort() {
		return; // Leave the keys argument unchanged.
	}

	/**
	 * Returns true if the item matches the given query, or false otherwise.
	 *
	 * @param  {Object}  query Query object
	 * @param  {Object}  item  Item to consider
	 * @return {Boolean}       Whether item matches query
	 */
	matches( query, item ) {
		if ( query.filterWpcomThemes ) {
			return ! isThemeFromWpcom( item.id );
		}
		return super.matches( query, item );
	}
}

ThemeQueryManager.QueryKey = ThemeQueryKey;

ThemeQueryManager.DEFAULT_QUERY = DEFAULT_THEME_QUERY;
