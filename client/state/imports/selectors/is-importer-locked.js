/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns a boolean indicating whether the current import is locked (true)
 * or unlocked (false)
 *
 * @param {Object} state Global state tree
 * @param {string} importerId Check the lock state of the importer with this id
 * @return {boolean} Is the importer locked
 */
export default ( state, importerId ) =>
	get( state, [ 'imports', 'importerLocks', importerId ], false );
