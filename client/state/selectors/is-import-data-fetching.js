/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if importer state is fetching from the API
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if data is being fetched
 */
export default function isImportDataFetching( state ) {
	return !! get( state, 'imports.isFetching' );
}
