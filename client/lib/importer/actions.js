/** @format */
/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
import { defer, includes, partial } from 'lodash';
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
} from 'state/action-types';
import { appStates } from 'state/imports/constants';
import { fromApi, toApi } from './common';
import { reduxDispatch } from 'lib/redux-bridge';

const ID_GENERATOR_PREFIX = 'local-generated-id-';

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

const apiStart = () => Dispatcher.handleViewAction( { type: IMPORTS_FETCH } );
const apiSuccess = data => {
	// console.log( 'apiSuccess', data );
	Dispatcher.handleViewAction( { type: IMPORTS_FETCH_COMPLETED } );

	return data;
};
const apiFailure = data => {
	Dispatcher.handleViewAction( { type: IMPORTS_FETCH_FAILED } );

	return data;
};
const setImportLock = ( shouldEnableLock, importerId ) => {
	const type = shouldEnableLock ? IMPORTS_IMPORT_LOCK : IMPORTS_IMPORT_UNLOCK;

	Dispatcher.handleViewAction( { type, importerId } );
};
const lockImport = partial( setImportLock, true );
const unlockImport = partial( setImportLock, false );

const asArray = a => [].concat( a );

function receiveImporterStatus( importerStatus ) {
	// console.log( 'receiveImporterStatus', importerStatus );
	Dispatcher.handleViewAction( {
		type: IMPORTS_IMPORT_RECEIVE,
		importerStatus,
	} );
}

export function cancelImport( siteId, importerId ) {
	lockImport( importerId );

	Dispatcher.handleViewAction( {
		type: IMPORTS_IMPORT_CANCEL,
		importerId,
		siteId,
	} );

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
		.then( importers => importers.map( fromApi ) )
		.then( importers => importers.map( receiveImporterStatus ) )
		.catch( apiFailure );
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

	Dispatcher.handleViewAction( {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	} );

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

	Dispatcher.handleViewAction( {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	} );

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

	Dispatcher.handleViewAction( {
		type: IMPORTS_AUTHORS_START_MAPPING,
		importerId,
	} );
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

	// console.log( 'startImporting', importerStatus );

	unlockImport( importerId );

	Dispatcher.handleViewAction( {
		type: IMPORTS_START_IMPORTING,
		importerId,
	} );

	return wpcom.updateImporter( siteId, importOrder( importerStatus ) );
}

export const autoStartImport = ( siteId, importerType, targetUrl ) => {
	Dispatcher.handleViewAction( {
		type: 'IMPORTS_AUTO_START_START',
	} );

	// TODO: Cover other site-importer imports here. importStatus and params would
	// need to be amended too.
	if ( importerType === 'importer-type-wix' ) {
		const importStatus = {
			siteId,
			type: 'wix',
		};
		const params = {
			engine: 'wix',
		};

		return wpcom
			.importWithSiteImporter( siteId, importStatus, params, targetUrl )
			.then( response =>
				defer( () => {
					// console.log( 'after importWithSiteImporter', response );
					startImporting( {
						importerId: response.importId,
						site: { ID: response.siteId },
					} ).then( () => {
						// console.log( 'after importWithSiteImporter, after startImporting' );
						Dispatcher.handleViewAction( {
							type: 'IMPORTS_AUTO_START_END',
						} );
					} );
				} )
			)
			.catch( () => {
				// TODO: Properly handle failure. We should look at
				// moving the rest of the site-importer actions out
				// of the components first to reach consistency
			} );
	}

	startImport( siteId, importerType );
	Dispatcher.handleViewAction( {
		type: 'IMPORTS_AUTO_START_END',
	} );
};

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
		.then( importerData => {
			const finishUploadAction = createFinishUploadAction( importerId, importerData );

			Dispatcher.handleViewAction( finishUploadAction );
			reduxDispatch( finishUploadAction );
		} )
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
