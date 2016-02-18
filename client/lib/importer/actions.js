/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
import includes from 'lodash/includes';
import partial from 'lodash/partial';
const wpcom = require( 'lib/wp' ).undocumented();

/**
 * Internal dependencies
 */
import { actionTypes, appStates } from './constants';
import { fromApi, toApi } from './common';

const ID_GENERATOR_PREFIX = 'local-generated-id-';

/*
 * The following `order` functions prepare objects that can be
 * sent to the API to accomplish a specific purpose. Instead of
 * actually calling the API, however, they return the _order_,
 * or request object, so that the calling function can send it
 * to the API.
 */

/** Creates a request object to cancel an importer */
const cancelOrder = ( siteId, importerId ) => toApi( { importerId, importerState: appStates.CANCEL_PENDING, site: { ID: siteId } } );

/** Creates a request to expire an importer session */
const expiryOrder = ( siteId, importerId ) => toApi( { importerId, importerState: appStates.EXPIRE_PENDING, site: { ID: siteId } } );

/** Creates a request object to start performing the actual import */
const importOrder = importerStatus => toApi( Object.assign( {}, importerStatus, { importerState: appStates.IMPORTING } ) );

const apiStart = () => Dispatcher.handleViewAction( { type: actionTypes.API_REQUEST } );
const apiSuccess = data => {
	Dispatcher.handleViewAction( { type: actionTypes.API_SUCCESS } );

	return data;
};
const apiFailure = data => {
	Dispatcher.handleViewAction( { type: actionTypes.API_FAILURE } );

	return data;
};
const setImportLock = ( shouldEnableLock, importerId ) => {
	const type = shouldEnableLock
		? actionTypes.LOCK_IMPORT
		: actionTypes.UNLOCK_IMPORT;

	Dispatcher.handleViewAction( { type, importerId } );
};
const lockImport = partial( setImportLock, true );
const unlockImport = partial( setImportLock, false );

const asArray = a => [].concat( a );

function receiveImporterStatus( importerStatus ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.RECEIVE_IMPORT_STATUS,
		importerStatus
	} );
}

export function cancelImport( siteId, importerId ) {
	lockImport( importerId );

	Dispatcher.handleViewAction( {
		type: actionTypes.CANCEL_IMPORT,
		importerId,
		siteId
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

export function failUpload( importerId, { message: error } ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.FAIL_UPLOAD,
		importerId,
		error
	} );
}

export function fetchState( siteId ) {
	apiStart();

	return wpcom.fetchImporterState( siteId )
		.then( apiSuccess )
		.then( asArray )
		.then( importers => importers.map( fromApi ) )
		.then( importers => importers.map( receiveImporterStatus ) )
		.catch( apiFailure );
}

export function finishUpload( importerId, importerStatus ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.FINISH_UPLOAD,
		importerId, importerStatus
	} );
}

export function mapAuthor( importerId, sourceAuthor, targetAuthor ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.MAP_AUTHORS,
		importerId,
		sourceAuthor,
		targetAuthor
	} );
}

export function resetImport( siteId, importerId ) {
	// We are done with this import session, so lock it away
	lockImport( importerId );

	Dispatcher.handleViewAction( {
		type: actionTypes.RESET_IMPORT,
		importerId,
		siteId
	} );

	apiStart();
	wpcom
		.updateImporter( siteId, expiryOrder( siteId, importerId ) )
		.then( apiSuccess )
		.then( fromApi )
		.then( receiveImporterStatus )
		.catch( apiFailure );
}

// Use when developing to force a new state into the store
export function setState( newState ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.DEV_SET_STATE,
		newState
	} );
}

export function startMappingAuthors( importerId ) {
	lockImport( importerId );

	Dispatcher.handleViewAction( {
		type: actionTypes.START_MAPPING_AUTHORS,
		importerId
	} );
}

export function setUploadProgress( importerId, data ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.SET_UPLOAD_PROGRESS,
		uploadLoaded: data.uploadLoaded,
		uploadTotal: data.uploadTotal,
		importerId
	} );
}

export function startImport( siteId, importerType ) {
	// Use a fake ID until the server returns the real one
	let importerId = `${ ID_GENERATOR_PREFIX }${ Math.round( Math.random() * 10000 ) }`;

	Dispatcher.handleViewAction( {
		type: actionTypes.START_IMPORT,
		importerId,
		importerType,
		siteId
	} );
}

export function startImporting( importerStatus ) {
	const { importerId, site: { ID: siteId } } = importerStatus;

	unlockImport( importerId );

	Dispatcher.handleViewAction( {
		type: actionTypes.START_IMPORTING,
		importerId
	} );

	wpcom.updateImporter( siteId, importOrder( importerStatus ) );
}

export function startUpload( importerStatus, file ) {
	let { importerId, site: { ID: siteId } } = importerStatus;

	wpcom
		.uploadExportFile( siteId, {
			importStatus: toApi( importerStatus ),
			file,

			onprogress: event => {
				setUploadProgress( importerId, {
					uploadLoaded: event.loaded,
					uploadTotal: event.total
				} );
			},

			onabort: () => cancelImport( siteId, importerId )
		} )
		.then( data => Object.assign( data, { siteId } ) )
		.then( fromApi )
		.then( partial( finishUpload, importerId ) )
		.catch( partial( failUpload, importerId ) );

	Dispatcher.handleViewAction( {
		type: actionTypes.START_UPLOAD,
		filename: file.name,
		importerId
	} );
}
