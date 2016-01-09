/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
import noop from 'lodash/utility/noop';
const wpcom = require( 'lib/wp' ).undocumented();

/**
 * Internal dependencies
 */
import { actionTypes, appStates } from './constants';
import { fromApi, toApi } from './common';

const ID_GENERATOR_PREFIX = 'local-generated-id-';

const cancelOrder = ( siteId, importerId ) => toApi( { importerId, importerState: appStates.CANCEL_PENDING, site: { ID: siteId } } );
const apiStart = () => Dispatcher.handleViewAction( { type: actionTypes.API_REQUEST } );
const apiSuccess = data => {
	Dispatcher.handleViewAction( { type: actionTypes.API_SUCCESS } );

	return data;
};
const apiFailure = data => {
	Dispatcher.handleViewAction( { type: actionTypes.API_FAILURE } );

	return data;
};
const asArray = a => [].concat( a );

function apiUpdateImporter( importerStatus ) {
	apiSuccess();

	Dispatcher.handleViewAction( {
		type: actionTypes.RECEIVE_IMPORT_STATUS,
		importerStatus
	} );
}

export function cancelImport( siteId, importerId, uploadAborter = noop ) {
	uploadAborter();

	Dispatcher.handleViewAction( {
		type: actionTypes.CANCEL_IMPORT,
		importerId,
		siteId
	} );

	if ( importerId.includes( ID_GENERATOR_PREFIX ) ) {
		return;
	}

	apiStart();
	wpcom
		.updateImporter( siteId, cancelOrder( siteId, importerId ) )
		.then( importer => fromApi( importer ) )
		.then( apiUpdateImporter )
		.catch( apiFailure );
}

export function failUpload( importerId, error ) {
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
		.then( importers => importers.map( importerStatus => {
			Dispatcher.handleViewAction( {
				type: actionTypes.RECEIVE_IMPORT_STATUS,
				importerStatus
			} );
		} ) )
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
	Dispatcher.handleViewAction( {
		type: actionTypes.RESET_IMPORT,
		importerId,
		siteId
	} );
}

// Use when developing to force a new state into the store
export function setState( newState ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.DEV_SET_STATE,
		newState
	} );
}

export function startMappingAuthors( importerId ) {
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

	Dispatcher.handleViewAction( {
		type: actionTypes.START_IMPORTING,
		importerId
	} );

	wpcom.updateImporter( siteId, toApi( importerStatus ) );
}

export function startUpload( importerStatus, file ) {
	let { importerId, site: { ID: siteId } } = importerStatus;

	const uploader = wpcom.uploadExportFile( siteId, {
		importStatus: toApi( importerStatus ),
		file,

		onload: ( error, data ) => {
			if ( ! error ) {
				return finishUpload( importerId, data );
			}

			failUpload( importerId, error.message );
		},

		onprogress: event => {
			setUploadProgress( importerId, {
				uploadLoaded: event.loaded,
				uploadTotal: event.total
			} );
		},

		onabort: () => cancelImport( siteId, importerId )
	} );

	Dispatcher.handleViewAction( {
		type: actionTypes.START_UPLOAD,
		filename: file.name,
		importerId,
		uploadAborter: uploader.abort.bind( uploader )
	} );
}
