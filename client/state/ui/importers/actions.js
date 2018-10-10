/** @format */
/**
 * Internal dependencies
 */
import { IMPORTS_IMPORTER_OPTION_SELECT } from 'state/action-types';

/**
 * Selects a specific importer option from the available importers.
 *
 * @param  {String}  importerOption The selected importer option
 * @return {Object}  Action
 */
export const selectImporterOption = importerOption => ( {
	type: IMPORTS_IMPORTER_OPTION_SELECT,
	importerOption,
} );

/**
 * Deselects the importer option.
 *
 * @return {Object}  Action result of selectImporterOption
 */
export const deselectImporterOption = () => selectImporterOption( null );
