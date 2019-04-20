/** @format */
/**
 * Internal dependencies
 */
import { IMPORTS_IMPORT_LOCK, IMPORTS_IMPORT_UNLOCK } from 'state/action-types';

export const lockImportSession = importerId => ( {
	type: IMPORTS_IMPORT_LOCK,
	importerId,
} );

export const unlockImportSession = importerId => ( {
	type: IMPORTS_IMPORT_UNLOCK,
	importerId,
} );
