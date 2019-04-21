/** @format */

/**
 * External dependencies
 */

import Dispatcher from 'dispatcher';
import { flowRight, get, includes, keys, reject, pickBy } from 'lodash';
import wpLib from 'lib/wp';
const wpcom = wpLib.undocumented();

/**
 * Internal dependencies
 */
import {
	IMPORTS_AUTHORS_SET_MAPPING,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_FETCH,
	IMPORTS_FETCH_FAILED,
	IMPORTS_FETCH_COMPLETED,
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_RECEIVE,
	IMPORTS_IMPORT_RESET,
	IMPORTS_IMPORT_START,
	IMPORTS_START_IMPORTING,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_START,
} from 'state/action-types';
import { appStates } from 'state/imports/constants';
import { fromApi, toApi } from './common';
import { reduxDispatch, reduxGetState } from 'lib/redux-bridge';
import { lockImportSession, unlockImportSession } from 'state/imports/actions';

const ID_GENERATOR_PREFIX = 'local-generated-id-';

const isImporterLocked = importerId =>
	includes( keys( pickBy( get( reduxGetState(), 'imports.lockedImports' ) ) ), importerId );

/*
 * The following `order` functions prepare objects that can be
 * sent to the API to accomplish a specific purpose. Instead of
 * actually calling the API, however, they return the _order_,
 * or request object, so that the calling function can send it
 * to the API.
 */

// Creates a request object to cancel an importer
const cancelOrder = ( siteId, importerId ) =>
	toApi( { importerId, importerState: appStates.CANCEL_PENDING, site: { ID: siteId } } );

// Creates a request to expire an importer session
const expiryOrder = ( siteId, importerId ) =>
	toApi( { importerId, importerState: appStates.EXPIRE_PENDING, site: { ID: siteId } } );

// Creates a request to clear all import sessions
const clearOrder = ( siteId, importerId ) =>
	toApi( { importerId, importerState: appStates.IMPORT_CLEAR, site: { ID: siteId } } );

// Creates a request object to start performing the actual import
const importOrder = importerStatus =>
	toApi( Object.assign( {}, importerStatus, { importerState: appStates.IMPORTING } ) );

const apiStart = () => {
	Dispatcher.handleViewAction( { type: IMPORTS_FETCH } );
	reduxDispatch( { type: IMPORTS_FETCH } );
};
const apiSuccess = data => {
	const apiFetchCompleteAction = {
		type: IMPORTS_FETCH_COMPLETED,
	};

	Dispatcher.handleViewAction( apiFetchCompleteAction );
	reduxDispatch( {
		...apiFetchCompleteAction,
		data,
	} );

	return data;
};
const apiFailure = data => {
	Dispatcher.handleViewAction( { type: IMPORTS_FETCH_FAILED } );
	reduxDispatch( { type: IMPORTS_FETCH_FAILED } );
	return data;
};

const lockImport = flowRight(
	reduxDispatch,
	lockImportSession
);
const unlockImport = flowRight(
	reduxDispatch,
	unlockImportSession
);

const asArray = a => [].concat( a );

const rejectExpiredImporters = importers =>
	reject( importers, ( { importStatus } ) => importStatus === appStates.IMPORT_EXPIRED );

function receiveImporterStatus( importerStatus = {} ) {
	const receiveImporterStatusAction = {
		type: IMPORTS_IMPORT_RECEIVE,
		importerStatus,
		isImporterLocked: isImporterLocked( importerStatus.importerId ),
	};

	Dispatcher.handleViewAction( receiveImporterStatusAction );
	reduxDispatch( receiveImporterStatusAction );
}

export function cancelImport( siteId, importerId ) {
	lockImport( importerId );

	const cancelAction = {
		type: IMPORTS_IMPORT_CANCEL,
		importerId,
		siteId,
	};

	Dispatcher.handleViewAction( cancelAction );
	reduxDispatch( cancelAction );

	// Bail if this is merely a local importer object because
	// there is nothing on the server-side to cancel
	if ( includes( importerId, ID_GENERATOR_PREFIX ) ) {
		return;
	}

	apiStart();
	wpcom
		.updateImporter( siteId, cancelOrder( siteId, importerId ) )
		.then( apiSuccess )
		.then( fromApi )
		.then( receiveImporterStatus )
		.catch( apiFailure );
}

export function fetchState( siteId ) {
	apiStart();

	return wpcom
		.fetchImporterState( siteId )
		.then( apiSuccess )
		.then( asArray )
		.then( rejectExpiredImporters )
		.then( importers => importers.map( fromApi ) )
		.then( importers => importers.map( receiveImporterStatus ) )
		.catch( apiFailure );
}

export const createFinishUploadAction = ( importerId, importerStatus ) => ( {
	type: IMPORTS_UPLOAD_COMPLETED,
	importerId,
	importerStatus,
} );

export const finishUpload = ( importerId, importerStatus ) => {
	const finishUploadAction = createFinishUploadAction( importerId, importerStatus );

	Dispatcher.handleViewAction( finishUploadAction );
	reduxDispatch( finishUploadAction );
};

export const mapAuthor = ( importerId, sourceAuthor, targetAuthor ) => {
	const setAuthorMappingAction = {
		type: IMPORTS_AUTHORS_SET_MAPPING,
		importerId,
		sourceAuthor,
		targetAuthor,
	};

	Dispatcher.handleViewAction( setAuthorMappingAction );
	reduxDispatch( setAuthorMappingAction );
};

export function resetImport( siteId, importerId ) {
	// We are done with this import session, so lock it away
	lockImport( importerId );

	const resetImportAction = {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	};

	Dispatcher.handleViewAction( resetImportAction );
	reduxDispatch( resetImportAction );

	apiStart();
	wpcom
		.updateImporter( siteId, expiryOrder( siteId, importerId ) )
		.then( apiSuccess )
		.then( fromApi )
		.then( receiveImporterStatus )
		.catch( apiFailure );
}

export function clearImport( siteId, importerId ) {
	// We are done with this import session, so lock it away
	lockImport( importerId );

	const clearImportAction = {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	};

	Dispatcher.handleViewAction( clearImportAction );
	reduxDispatch( clearImportAction );

	apiStart();
	wpcom
		.updateImporter( siteId, clearOrder( siteId, importerId ) )
		.then( apiSuccess )
		.then( fromApi )
		.then( receiveImporterStatus )
		.catch( apiFailure );
}

export function startMappingAuthors( importerId ) {
	lockImport( importerId );

	const startMappingAuthorsAction = {
		type: IMPORTS_AUTHORS_START_MAPPING,
		importerId,
	};

	Dispatcher.handleViewAction( startMappingAuthorsAction );
	reduxDispatch( startMappingAuthorsAction );
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
	reduxDispatch( action );

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
	reduxDispatch( startImportingAction );

	wpcom.updateImporter( siteId, importOrder( importerStatus ) );
}

export const startUpload = ( importerStatus, file ) => {
	const {
		importerId,
		site: { ID: siteId },
	} = importerStatus;

	const startUploadAction = {
		type: IMPORTS_UPLOAD_START,
		filename: file.name,
		importerId,
	};
	Dispatcher.handleViewAction( startUploadAction );
	reduxDispatch( startUploadAction );

	wpcom
		.uploadExportFile( siteId, {
			importStatus: toApi( importerStatus ),
			file,
			onprogress: event => {
				const uploadProgressAction = setUploadProgress( importerId, {
					uploadLoaded: event.loaded,
					uploadTotal: event.total,
				} );

				Dispatcher.handleViewAction( uploadProgressAction );
				reduxDispatch( uploadProgressAction );
			},
			onabort: () => cancelImport( siteId, importerId ),
		} )
		.then( data => Object.assign( data, { siteId } ) )
		.then( fromApi )
		.then( importerData => finishUpload( importerId, importerData ) )
		.catch( error => {
			const failUploadAction = {
				type: IMPORTS_UPLOAD_FAILED,
				importerId,
				error: error.message,
			};

			Dispatcher.handleViewAction( failUploadAction );
			reduxDispatch( failUploadAction );
		} );
};
