/** @format */

/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import getImportServerData from 'state/selectors/get-import-server-data';

/**
 * Returns true if importer state has been successfully fetched from the API
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if data has been fetched
 */
export default function isImportDataHydrated( state ) {
	return ! isEmpty( getImportServerData( state ) );
}
