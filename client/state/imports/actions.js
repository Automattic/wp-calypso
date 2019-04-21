/** @format */
/**
 * Internal dependencies
 */
import wpLib from 'lib/wp';
import {
	IMPORTS_IMPORT_LOCK,
	IMPORTS_IMPORT_UNLOCK,
	IMPORTS_START_IMPORTING,
} from 'state/action-types';
import { appStates } from 'state/imports/constants';
import { toApi } from 'lib/importer/common';

const wpcom = wpLib.undocumented();

export const lockImportSession = importerId => ( {
	type: IMPORTS_IMPORT_LOCK,
	importerId,
} );

export const unlockImportSession = importerId => ( {
	type: IMPORTS_IMPORT_UNLOCK,
	importerId,
} );

export const startImporting = importerStatus => dispatch => {
	const {
		importerId,
		site: { ID: siteId },
	} = importerStatus;

	dispatch( unlockImportSession( importerId ) );
	dispatch( {
		type: IMPORTS_START_IMPORTING,
		importerId,
	} );

	wpcom.updateImporter(
		siteId,
		toApi( {
			...importerStatus,
			importerState: appStates.IMPORTING,
		} )
	);
};
