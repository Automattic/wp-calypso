/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import wpLib from 'calypso/lib/wp';
import {
	IMPORTS_AUTHORS_SET_MAPPING,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_LOCK,
	IMPORTS_IMPORT_RECEIVE,
	IMPORTS_IMPORT_RESET,
	IMPORTS_IMPORT_START,
	IMPORTS_IMPORT_UNLOCK,
	IMPORTS_START_IMPORTING,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_START,
} from 'calypso/state/action-types';
import { appStates } from 'calypso/state/imports/constants';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import { fromApi, toApi } from 'calypso/lib/importer/common';

// This library unfortunately relies on global Redux state directly, by e.g. creating actions.
// Because of this, we need to ensure that the relevant portion of state is initialized.
import 'calypso/state/imports/init';

const wpcom = wpLib.undocumented();

const ID_GENERATOR_PREFIX = 'local-generated-id-';

/*
 * The following `order` functions prepare objects that can be
 * sent to the API to accomplish a specific purpose. Instead of
 * actually calling the API, however, they return the _order_,
 * or request object, so that the calling function can send it
 * to the API.
 */

// Creates a request object to cancel an importer
const createCancelOrder = ( siteId, importerId ) =>
	toApi( { importerId, importerState: appStates.CANCEL_PENDING, site: { ID: siteId } } );

// Creates a request to expire an importer session
const createExpiryOrder = ( siteId, importerId ) =>
	toApi( { importerId, importerState: appStates.EXPIRE_PENDING, site: { ID: siteId } } );

// Creates a request to clear all import sessions
const createClearOrder = ( siteId, importerId ) =>
	toApi( { importerId, importerState: appStates.IMPORT_CLEAR, site: { ID: siteId } } );

// Creates a request object to start performing the actual import
const createImportOrder = ( importerStatus ) =>
	toApi( {
		...importerStatus,
		importerState: appStates.IMPORTING,
	} );

const lockImport = ( importerId ) => {
	const lockImportAction = {
		type: IMPORTS_IMPORT_LOCK,
		importerId,
	};
	Dispatcher.handleViewAction( lockImportAction );
};

const unlockImport = ( importerId ) => {
	const unlockImportAction = {
		type: IMPORTS_IMPORT_UNLOCK,
		importerId,
	};
	Dispatcher.handleViewAction( unlockImportAction );
};

function receiveImporterStatus( importerStatus ) {
	const action = {
		type: IMPORTS_IMPORT_RECEIVE,
		importerStatus,
	};
	Dispatcher.handleViewAction( action );
}

export function cancelImport( siteId, importerId ) {
	lockImport( importerId );

	const cancelImportAction = {
		type: IMPORTS_IMPORT_CANCEL,
		importerId,
		siteId,
	};
	Dispatcher.handleViewAction( cancelImportAction );

	// Bail if this is merely a local importer object because
	// there is nothing on the server-side to cancel
	if ( importerId.startsWith( ID_GENERATOR_PREFIX ) ) {
		return;
	}

	wpcom
		.updateImporter( siteId, createCancelOrder( siteId, importerId ) )
		.then( receiveImporterStatus );
}

export function fetchState( siteId ) {
	return wpcom.fetchImporterState( siteId ).then( receiveImporterStatus );
}

export const createFinishUploadAction = ( importerId, importerStatus ) => ( {
	type: IMPORTS_UPLOAD_COMPLETED,
	importerId,
	importerStatus,
} );

export const mapAuthor = ( importerId, sourceAuthor, targetAuthor ) =>
	Dispatcher.handleViewAction( {
		type: IMPORTS_AUTHORS_SET_MAPPING,
		importerId,
		sourceAuthor,
		targetAuthor,
	} );

export function resetImport( siteId, importerId ) {
	// We are done with this import session, so lock it away
	lockImport( importerId );

	const resetImportAction = {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	};
	Dispatcher.handleViewAction( resetImportAction );

	wpcom
		.updateImporter( siteId, createExpiryOrder( siteId, importerId ) )
		.then( receiveImporterStatus );
}

export function clearImport( siteId, importerId ) {
	// We are done with this import session, so lock it away
	const lockImportAction = {
		type: IMPORTS_IMPORT_LOCK,
		importerId,
	};
	Dispatcher.handleViewAction( lockImportAction );

	const resetImportAction = {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	};
	Dispatcher.handleViewAction( resetImportAction );

	wpcom
		.updateImporter( siteId, createClearOrder( siteId, importerId ) )
		.then( receiveImporterStatus );
}

export function startMappingAuthors( importerId ) {
	const lockImportAction = {
		type: IMPORTS_IMPORT_LOCK,
		importerId,
	};
	Dispatcher.handleViewAction( lockImportAction );

	const startMappingAuthorsAction = {
		type: IMPORTS_AUTHORS_START_MAPPING,
		importerId,
	};
	Dispatcher.handleViewAction( startMappingAuthorsAction );
}

export const setUploadProgress = ( importerId, data ) => ( {
	type: IMPORTS_UPLOAD_SET_PROGRESS,
	uploadLoaded: data.uploadLoaded,
	uploadTotal: data.uploadTotal,
	importerId,
} );

export const startImport = ( siteId, importerType ) => {
	const action = {
		type: IMPORTS_IMPORT_START,
		// Use a fake ID until the server returns the real one
		importerId: `${ ID_GENERATOR_PREFIX }${ Math.round( Math.random() * 10000 ) }`,
		importerType,
		siteId,
	};

	Dispatcher.handleViewAction( action );
	return action;
};

export function startImporting( importerStatus ) {
	const {
		importerId,
		site: { ID: siteId },
	} = importerStatus;

	unlockImport( importerId );

	const startImportingAction = {
		type: IMPORTS_START_IMPORTING,
		importerId,
	};
	Dispatcher.handleViewAction( startImportingAction );

	wpcom.updateImporter( siteId, createImportOrder( importerStatus ) );
}

export const setUploadStartState = ( importerId, filenameOrUrl ) => {
	const startUploadAction = {
		type: IMPORTS_UPLOAD_START,
		filename: filenameOrUrl,
		importerId,
	};
	Dispatcher.handleViewAction( startUploadAction );
	reduxDispatch( startUploadAction );
};

export const startUpload = ( importerStatus, file ) => {
	const {
		importerId,
		site: { ID: siteId },
	} = importerStatus;

	setUploadStartState( importerId, file.name );

	wpcom
		.uploadExportFile( siteId, {
			importStatus: toApi( importerStatus ),
			file,
			onprogress: ( event ) => {
				const uploadProgressAction = setUploadProgress( importerId, {
					uploadLoaded: event.loaded,
					uploadTotal: event.total,
				} );

				Dispatcher.handleViewAction( uploadProgressAction );
				reduxDispatch( uploadProgressAction );
			},
			onabort: () => cancelImport( siteId, importerId ),
		} )
		.then( ( data ) => {
			const finishUploadAction = createFinishUploadAction(
				importerId,
				fromApi( { ...data, siteId } )
			);

			Dispatcher.handleViewAction( finishUploadAction );
			reduxDispatch( finishUploadAction );
		} )
		.catch( ( error ) => {
			const failUploadAction = {
				type: IMPORTS_UPLOAD_FAILED,
				importerId,
				error: error.message,
			};

			Dispatcher.handleViewAction( failUploadAction );
			reduxDispatch( failUploadAction );
		} );
};
