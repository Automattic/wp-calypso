import PaginatedQueryKey from '../paginated/key';
import { DEFAULT_MEDIA_QUERY } from './constants';

/**
 * MediaQueryKey manages the serialization and deserialization of a query key
 * for use in tracking query results in an instance of MediaQueryManager
 */
export default class MediaQueryKey extends PaginatedQueryKey {
	/**
	 * Default query used in determining values to be omitted from stringified
	 * or parsed query objects
	 *
	 * @type {?Object}
	 */
	static DEFAULT_QUERY = DEFAULT_MEDIA_QUERY;

	/**
	 * Controls omission to remove all null values from stringified or parsed
	 * query objects
	 *
	 * @type {boolean}
	 */
	static OMIT_NULL_VALUES = true;
}
