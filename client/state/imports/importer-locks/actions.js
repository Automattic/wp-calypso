/** @format */

/**
 * Internal dependencies
 */
import { IMPORTS_IMPORT_LOCK, IMPORTS_IMPORT_UNLOCK } from 'state/action-types';

/**
 * Returns an action object for locking the importer with the given id
 *
 * A locked importer signifies that the importer cannot receive any status
 * changes until unlocked
 *
 * @param {string} importerId The id of the importer
 * @return {Object} Action object
 */
export const lockImporter = importerId => ( {
	type: IMPORTS_IMPORT_LOCK,
	importerId,
} );

/**
 * Returns an action object for unlocking the importer with the given id
 *
 * An unlocked importer is one that can receive changes to its status
 *
 * @param {string} importerId The id of the importer
 * @return {Object} Action object
 */
export const unlockImporter = importerId => ( {
	type: IMPORTS_IMPORT_UNLOCK,
	importerId,
} );
