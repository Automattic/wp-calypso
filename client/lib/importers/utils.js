/** @format */

/**
 * Internal dependencies
 */
import { ENGINE_TO_IMPORTER_TITLE_MAP } from './constants';

export function getImporterTitleByEngineKey( engineKey ) {
	return ENGINE_TO_IMPORTER_TITLE_MAP[ engineKey ] || engineKey;
}
