/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import ThemeQueryKey from './key';
import { isThemeMatchingQuery } from './util';
import { DEFAULT_THEME_QUERY } from './constants';

/**
 * ThemeQueryManager manages themes which can be queried
 */
export default class ThemeQueryManager extends PaginatedQueryManager {
	matches = isThemeMatchingQuery;
}

ThemeQueryManager.QueryKey = ThemeQueryKey;

ThemeQueryManager.DEFAULT_QUERY = DEFAULT_THEME_QUERY;
