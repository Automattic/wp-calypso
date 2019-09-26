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
