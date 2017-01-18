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

	/**
	 * Theme query results arrive in the desired order.
	 *
	 * @returns {Boolean} false
	 */
	shouldSort() {
		return false;
	}
}

ThemeQueryManager.QueryKey = ThemeQueryKey;

ThemeQueryManager.DEFAULT_QUERY = DEFAULT_THEME_QUERY;
