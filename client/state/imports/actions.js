/** @format */
/**
 * External dependencies
 */
import { get, includes, keys, pickBy } from 'lodash';

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
	IMPORTS_IMPORT_RECEIVE,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_AUTHORS_SET_MAPPING,
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_FETCH,
	IMPORTS_FETCH_COMPLETED,
	IMPORTS_FETCH_FAILED,
} from 'state/action-types';
import { appStates } from 'state/imports/constants';
import { fromApi, toApi } from 'lib/importer/common';

const wpcom = wpLib.undocumented();

const ID_GENERATOR_PREFIX = 'local-generated-id-';

const isImporterLocked = ( state, importerId ) =>
	includes( keys( pickBy( get( state, 'imports.lockedImports' ) ) ), importerId );

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

export const receiveImporterStatus = ( importerStatus = {} ) => ( dispatch, getState ) =>
	dispatch( {
		type: IMPORTS_IMPORT_RECEIVE,
		importerStatus,
		isImporterLocked: isImporterLocked( getState(), importerStatus.importerId ),
	} );

export const finishUpload = ( importerId, importerStatus ) => ( {
	type: IMPORTS_UPLOAD_COMPLETED,
	importerId,
	importerStatus,
} );

export const startMappingAuthors = importerId => dispatch => {
	dispatch( lockImportSession( importerId ) );
	dispatch( {
		type: IMPORTS_AUTHORS_START_MAPPING,
		importerId,
	} );
};

export const mapAuthor = ( importerId, sourceAuthor, targetAuthor ) => ( {
	type: IMPORTS_AUTHORS_SET_MAPPING,
	importerId,
	sourceAuthor,
	targetAuthor,
} );

export const cancelImport = ( siteId, importerId ) => dispatch => {
	dispatch( lockImportSession( importerId ) );
	dispatch( {
		type: IMPORTS_IMPORT_CANCEL,
		importerId,
		siteId,
	} );

	// Bail if this is merely a local importer object because
	// there is nothing on the server-side to cancel
	if ( includes( importerId, ID_GENERATOR_PREFIX ) ) {
		return;
	}

	dispatch( { type: IMPORTS_FETCH } );

	wpcom
		.updateImporter(
			siteId,
			toApi( {
				importerId,
				importerState: appStates.CANCEL_PENDING,
				site: { ID: siteId },
			} )
		)
		.then( response => {
			dispatch( { type: IMPORTS_FETCH_COMPLETED } );
			dispatch( receiveImporterStatus( fromApi( response ) ) );
		} )
		.catch( error => {
			dispatch( { type: IMPORTS_FETCH_FAILED, error } );
		} );
};
