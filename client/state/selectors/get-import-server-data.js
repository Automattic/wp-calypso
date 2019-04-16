/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns importer state data if it's been successfully fetched from the API
 *
 * @param {Object} state Global state tree
 * @return {Object|null} Data if it has been fetched -- null, if not
 */
export default function getImportServerData( state ) {
	return get( state, 'imports.serverData', null );
}
