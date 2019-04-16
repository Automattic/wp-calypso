/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if importer state has been successfully fetched from the API
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if data has been fetched
 */
export default function isImportDataHydrated( state ) {
	return !! get( state, 'imports.isHydrated' );
}
