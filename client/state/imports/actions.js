import wp from 'calypso/lib/wp';
import {
	IMPORTS_AUTHORS_SET_MAPPING,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_LOCK,
	IMPORTS_IMPORT_RECEIVE,
	IMPORTS_IMPORT_RECEIVED_RESET,
	IMPORTS_IMPORT_RESET,
	IMPORTS_IMPORT_START,
	IMPORTS_IMPORT_UNLOCK,
	IMPORTS_START_IMPORTING,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_PRE_UPLOAD_FAILED,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_START,
} from 'calypso/state/action-types';
import { fromApi, toApi } from './api';
import { appStates } from './constants';
import { isImporterLocked } from './selectors';

import 'calypso/state/imports/init';

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

const updateImporter = ( siteId, importerStatus ) =>
	wp.req.post( {
		path: `/sites/${ siteId }/imports/${ importerStatus.importerId }`,
		formData: [ [ 'importStatus', JSON.stringify( importerStatus ) ] ],
	} );

export const uploadExportFile = ( siteId, params ) =>
	new Promise( ( resolve, reject ) => {
		const resolver = ( error, data ) => {
			error ? reject( error ) : resolve( data );
		};

		const formData = [
			[ 'importStatus', JSON.stringify( params.importStatus ) ],
			[ 'import', params.file ],
		];

		if ( params.url ) {
			formData.push( [ 'url', params.url ] );
		}

		const req = wp.req.post(
			{
				path: `/sites/${ siteId }/imports/new`,
				formData,
			},
			resolver
		);

		req.upload.onprogress = params.onprogress;
		req.onabort = params.onabort;
	} );

export const lockImport = ( importerId ) => ( {
	type: IMPORTS_IMPORT_LOCK,
	importerId,
} );

export const unlockImport = ( importerId ) => ( {
	type: IMPORTS_IMPORT_UNLOCK,
	importerId,
} );

export const resetImportReceived = () => ( { type: IMPORTS_IMPORT_RECEIVED_RESET } );

export const receiveImporterStatus = ( importerStatus ) => ( dispatch, getState ) => {
	const isLocked = isImporterLocked( getState(), importerStatus.importId );
	dispatch( { type: IMPORTS_IMPORT_RECEIVE, importerStatus, isLocked } );
};

export const cancelImport = ( siteId, importerId ) => async ( dispatch ) => {
	dispatch( lockImport( importerId ) );

	const cancelImportAction = {
		type: IMPORTS_IMPORT_CANCEL,
		importerId,
		siteId,
	};
	dispatch( cancelImportAction );

	// Bail if this is merely a local importer object because
	// there is nothing on the server-side to cancel
	if ( importerId.startsWith( ID_GENERATOR_PREFIX ) ) {
		return;
	}

	const data = await updateImporter( siteId, createCancelOrder( siteId, importerId ) );
	dispatch( receiveImporterStatus( data ) );
};

export const fetchImporterState = ( siteId ) => async ( dispatch ) => {
	const data = await wp.req.get( `/sites/${ siteId }/imports/` );
	dispatch( receiveImporterStatus( data ) );
};

export const finishUpload = ( importerId, importerStatus ) => ( {
	type: IMPORTS_UPLOAD_COMPLETED,
	importerId,
	importerStatus,
} );

export const mapAuthor = ( importerId, sourceAuthor, targetAuthor ) => ( {
	type: IMPORTS_AUTHORS_SET_MAPPING,
	importerId,
	sourceAuthor,
	targetAuthor,
} );

export const resetImport = ( siteId, importerId ) => async ( dispatch ) => {
	// We are done with this import session, so lock it away
	dispatch( lockImport( importerId ) );

	const resetImportAction = {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	};
	dispatch( resetImportAction );

	const data = await updateImporter( siteId, createExpiryOrder( siteId, importerId ) );
	dispatch( receiveImporterStatus( data ) );
};

export const clearImport = ( siteId, importerId ) => async ( dispatch ) => {
	// We are done with this import session, so lock it away
	dispatch( lockImport( importerId ) );

	const resetImportAction = {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	};
	dispatch( resetImportAction );

	const data = await updateImporter( siteId, createClearOrder( siteId, importerId ) );
	dispatch( receiveImporterStatus( data ) );
};

export const startMappingAuthors = ( importerId ) => ( dispatch ) => {
	dispatch( lockImport( importerId ) );

	const startMappingAuthorsAction = {
		type: IMPORTS_AUTHORS_START_MAPPING,
		importerId,
	};
	dispatch( startMappingAuthorsAction );
};

export const setUploadProgress = ( importerId, data ) => ( {
	type: IMPORTS_UPLOAD_SET_PROGRESS,
	uploadLoaded: data.uploadLoaded,
	uploadTotal: data.uploadTotal,
	importerId,
} );

export const startImport = ( siteId, importerType ) => ( {
	type: IMPORTS_IMPORT_START,
	// Use a fake ID until the server returns the real one
	importerId: `${ ID_GENERATOR_PREFIX }${ Math.round( Math.random() * 10000 ) }`,
	importerType,
	siteId,
} );

export const startImporting = ( importerStatus ) => ( dispatch ) => {
	const {
		importerId,
		site: { ID: siteId },
	} = importerStatus;

	dispatch( unlockImport( importerId ) );

	const startImportingAction = {
		type: IMPORTS_START_IMPORTING,
		importerId,
	};
	dispatch( startImportingAction );

	return updateImporter( siteId, createImportOrder( importerStatus ) );
};

export const setUploadStartState = ( importerId, filenameOrUrl ) => ( {
	type: IMPORTS_UPLOAD_START,
	filename: filenameOrUrl,
	importerId,
} );

export const startUpload =
	( importerStatus, file, url = undefined ) =>
	( dispatch ) => {
		const {
			importerId,
			site: { ID: siteId },
		} = importerStatus;

		dispatch( setUploadStartState( importerId, file.name ) );

		return uploadExportFile( siteId, {
			importStatus: toApi( importerStatus ),
			file,
			url,
			onprogress: ( event ) => {
				dispatch(
					setUploadProgress( importerId, {
						uploadLoaded: event.loaded,
						uploadTotal: event.total,
					} )
				);
			},
			onabort: () => {
				dispatch( cancelImport( siteId, importerId ) );
			},
		} )
			.then( ( data ) => {
				dispatch( finishUpload( importerId, fromApi( data ) ) );
			} )
			.catch( ( error ) => {
				const failUploadAction = {
					type: IMPORTS_UPLOAD_FAILED,
					importerId,
					error: error.message,
				};

				dispatch( failUploadAction );
			} );
	};

export const failPreUpload = ( importerId, message, code, file ) => ( {
	type: IMPORTS_PRE_UPLOAD_FAILED,
	importerId,
	error: message,
	errorCode: code,
	file,
} );
