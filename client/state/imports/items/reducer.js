/** @format */
/**
 * External dependencies
 */
import { get, omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	IMPORTS_AUTHORS_SET_MAPPING,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_RECEIVE,
	IMPORTS_IMPORT_RESET,
	IMPORTS_IMPORT_START,
	IMPORTS_START_IMPORTING,
	IMPORTS_STORE_RESET,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_START,
} from 'state/action-types';
import { appStates } from 'state/imports/constants';
import { createReducer } from 'state/utils';
import setAuthorMapping from 'state/imports/items/set-author-mapping';
import setItemStatus from 'state/imports/items/set-item-status';
import receiveImportItem from 'state/imports/items/receive-item';

const INITIAL_STATE = Object.freeze( {} );

const importerItems = createReducer( INITIAL_STATE, {
	[ IMPORTS_AUTHORS_SET_MAPPING ]: setAuthorMapping,
	[ IMPORTS_AUTHORS_START_MAPPING ]: setItemStatus( appStates.MAP_AUTHORS ),
	[ IMPORTS_IMPORT_CANCEL ]: ( state, { importerId } ) => omit( state, importerId ),
	[ IMPORTS_IMPORT_RESET ]: ( state, { importerId } ) => omit( state, importerId ),
	[ IMPORTS_IMPORT_RECEIVE ]: receiveImportItem,
	// Note: IMPORTS_IMPORT_START doesn't actually start the importing,
	// rather it just opens the import UI and creates a fake import item
	// This could use revision, to make this more clear.
	[ IMPORTS_IMPORT_START ]: ( state, { importerId, importerType, siteId } ) => ( {
		...state,
		[ importerId ]: {
			importerId: importerId,
			type: importerType,
			importerState: appStates.READY_FOR_UPLOAD,
			site: { ID: siteId },
		},
	} ),
	[ IMPORTS_START_IMPORTING ]: setItemStatus( appStates.IMPORTING ),
	[ IMPORTS_STORE_RESET ]: () => INITIAL_STATE,
	[ IMPORTS_UPLOAD_FAILED ]: ( state, { error, importerId } ) => ( {
		...state,
		[ importerId ]: {
			...get( state, importerId, {} ),
			importerState: appStates.UPLOAD_FAILURE,
			errorData: {
				type: 'uploadError',
				description: error,
			},
		},
	} ),
	// Here we replace the locally generated importerId with the importerId & status coming in from the server
	// Note that the importerId is that of the existing import item
	// and importerStatus is the new state coming from the server
	[ IMPORTS_UPLOAD_COMPLETED ]: ( state, { importerId, importerStatus } ) => ( {
		...omit( state, importerId ),
		[ importerStatus.importerId ]: importerStatus,
	} ),
	[ IMPORTS_UPLOAD_SET_PROGRESS ]: ( state, { importerId, uploadLoaded, uploadTotal } ) => ( {
		...state,
		[ importerId ]: {
			...get( state, importerId, {} ),
			percentComplete: ( uploadLoaded / ( uploadTotal + Number.EPSILON ) ) * 100,
		},
	} ),
	[ IMPORTS_UPLOAD_START ]: ( state, { importerId, filename } ) => ( {
		...state,
		[ importerId ]: {
			...get( state, importerId, {} ),
			importerState: appStates.UPLOADING,
			filename,
		},
	} ),
} );

export default importerItems;
