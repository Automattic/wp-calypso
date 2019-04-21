/** @format */
/**
 * Internal dependencies
 */
import wpLib from 'lib/wp';
import {
	IMPORTS_IMPORT_LOCK,
	IMPORTS_IMPORT_UNLOCK,
	IMPORTS_START_IMPORTING,
	IMPORTS_IMPORT_START,
	IMPORTS_UPLOAD_COMPLETED,
} from 'state/action-types';
import { appStates } from 'state/imports/constants';
import { toApi } from 'lib/importer/common';

const wpcom = wpLib.undocumented();

const ID_GENERATOR_PREFIX = 'local-generated-id-';

export const lockImportSession = importerId => ( {
	type: IMPORTS_IMPORT_LOCK,
	importerId,
} );

export const unlockImportSession = importerId => ( {
	type: IMPORTS_IMPORT_UNLOCK,
	importerId,
} );

export const startImport = ( siteId, importerType ) => dispatch => {
	const action = {
		type: IMPORTS_IMPORT_START,
		// Use a fake ID until the server returns the real one
		importerId: `${ ID_GENERATOR_PREFIX }${ Math.round( Math.random() * 10000 ) }`,
		importerType,
		siteId,
	};

	dispatch( action );
	// Though this is a simple action, we still need to use the thunk pattern
	// so that we can return teh action here and have access to the generated ID elsewhere.
	return action;
};

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

export const finishUpload = ( importerId, importerStatus ) => ( {
	type: IMPORTS_UPLOAD_COMPLETED,
	importerId,
	importerStatus,
} );
