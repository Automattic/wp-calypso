/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
const wpcom = require( 'lib/wp' ).undocumented();

/**
 * Internal dependencies
 */
import { actionTypes } from './constants';
import { toApi } from './common';

export function cancelImport( importerId ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.CANCEL_IMPORT,
		importerId
	} );
}

export function failUpload( importerId, error ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.FAIL_UPLOAD,
		importerId,
		error
	} );
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

export function resetImport( importerId ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.RESET_IMPORT,
		importerId
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

export function startImport( importerType ) {
	// Dev-only: this will come from an API call
	let importerId = `${ Math.round( Math.random() * 10000 ) }`;

	Dispatcher.handleViewAction( {
		type: actionTypes.START_IMPORT,
		importerId,
		importerType
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
	let { id: importerId, site: { ID: siteId } } = importerStatus;

	Dispatcher.handleViewAction( {
		type: actionTypes.START_UPLOAD,
		filename: file.name,
		importerId
	} );

	wpcom.uploadExportFile( siteId, {
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

		onabort: () => cancelImport( importerId )
	} );
}
