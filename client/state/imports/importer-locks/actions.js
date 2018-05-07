/** @format */

/**
 * Internal dependencies
 */
import {
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_RESET,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_START_IMPORTING,
} from 'state/action-types';

/**
 * Returns an action object for canceling the importer with the given id
 *
 * A locked importer signifies that the importer cannot receive any status
 * changes until unlocked
 *
 * @param {string} importerId The id of the importer
 * @return {Object} Action object
 */
export const cancelImport = importerId => ( {
	type: IMPORTS_IMPORT_CANCEL,
	importerId,
} );

/**
 * Returns an action object for resetting the importer with the given id
 *
 * An unlocked importer is one that can receive changes to its status
 *
 * @param {string} importerId The id of the importer
 * @return {Object} Action object
 */
export const resetImport = importerId => ( {
	type: IMPORTS_IMPORT_RESET,
	importerId,
} );

/**
 * Returns an action object for starting the author mapping process for the
 * importer with the given id
 *
 * An unlocked importer is one that can receive changes to its status
 *
 * @param {string} importerId The id of the importer
 * @return {Object} Action object
 */
export const startMappingAuthors = importerId => ( {
	type: IMPORTS_AUTHORS_START_MAPPING,
	importerId,
} );

/**
 * Returns an action object for starting the import process for the importer
 * with the given id
 *
 * An unlocked importer is one that can receive changes to its status
 *
 * @param {string} importerId The id of the importer
 * @return {Object} Action object
 */
export const startImporting = importerId => ( {
	type: IMPORTS_START_IMPORTING,
	importerId,
} );
