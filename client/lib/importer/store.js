/** @format */
/**
 * External dependencies
 */
import { get, filter, includes, map, reject, set, setWith, unset } from 'lodash';

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
	IMPORTS_STORE_RESET,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_START,
} from 'state/action-types';
import { appStates } from 'state/imports/constants';
import { createReducerStore } from 'lib/store';

/**
 * Module variables
 */
const getInitialState = () => ( {
	count: 0,
	importers: {},
	importerLocks: {},
	api: {
		isHydrated: false,
		isFetching: false,
		retryCount: 0,
	},
} );

// Why is this here, could it not be part of the main switch?
const adjustImporterLock = ( state, { action } ) => {
	const newState = { ...state };

	switch ( action.type ) {
		case IMPORTS_IMPORT_LOCK:
			set( newState, [ 'importerLocks', action.importerId ], true );

		case IMPORTS_IMPORT_UNLOCK:
			set( newState, [ 'importerLocks', action.importerId ], false );

		default:
			return state;
	}
};

const ImporterStore = createReducerStore( function( state, payload ) {
	const { action } = payload;
	let newState = { ...state };

	switch ( action.type ) {
		case IMPORTS_STORE_RESET:
			// this is here to enable
			// unit-testing the store
			newState = getInitialState();
			break;

		case IMPORTS_FETCH:
			set( newState, 'api.isFetching', true );
			break;

		case IMPORTS_FETCH_FAILED:
			set( newState, 'api.isFetching', false );
			setWith( newState, 'api.retryCount', ( retryCount = 0 ) => retryCount + 1 );
			break;

		case IMPORTS_FETCH_COMPLETED:
			set( newState, 'api.isFetching', false );
			set( newState, 'api.isHydrated', true );
			set( newState, 'api.retryCount', 0 );

			break;

		case IMPORTS_IMPORT_CANCEL:
		case IMPORTS_IMPORT_RESET:
			setWith( newState, 'importers', importers =>
				reject( importers, { importerId: action.importerId } )
			);
			break;

		case IMPORTS_UPLOAD_FAILED:
			set(
				newState,
				[ 'importers', action.importerId, 'importerState' ],
				appStates.UPLOAD_FAILURE
			);
			set( newState, [ 'importers', action.importerId, 'errorData' ], {
				type: 'uploadError',
				description: action.error,
			} );

			break;

		case IMPORTS_UPLOAD_COMPLETED:
			unset( newState, [ 'importers', action.importerId ] );
			set( newState, [ 'importers', action.importerStatus.importerId ], action.importerStatus );
			break;

		case IMPORTS_AUTHORS_START_MAPPING:
			set( newState, [ 'importers', action.importerId, 'importerState' ], appStates.MAP_AUTHORS );
			break;

		case IMPORTS_AUTHORS_SET_MAPPING:
			const { importerId, sourceAuthor, targetAuthor } = action;
			setWith(
				newState,
				[ 'importers', importerId, 'customData', 'sourceAuthors' ],
				sourceAuthors =>
					map(
						sourceAuthors,
						author =>
							sourceAuthor.id === author.id
								? {
										...author,
										mappedTo: targetAuthor,
								  }
								: author
					)
			);
			break;

		case IMPORTS_IMPORT_RECEIVE:
			set( newState, 'api.isHydrated', true );

			if ( get( newState, [ 'importerLocks', action.importerStatus.importerId ], false ) ) {
				break;
			}

			// remove by id if the incoming instance is defunt
			// as mentioned later, this would be taken care of by the filtering function anyway
			if ( action.importerStatus.importerState === appStates.DEFUNCT ) {
				unset( newState, [ 'importers', action.importerStatus.importerId ] );
			}

			set( newState, [ 'importers', action.importerStatus.importerId ], action.importerStatus );

			// We filter through all importer instances and remove any that are defunt or cancelled
			// Do we really need the above 'delete if defunt' action then? Whats it's value?
			setWith( newState, 'importers', importers =>
				filter(
					{
						...importers,
						[ action.importerStatus.importerId ]: action.importerStatus,
					},
					importer =>
						includes( [ appStates.CANCEL_PENDING, appStates.DEFUNCT ], importer.importerState )
				)
			);

			break;

		case IMPORTS_UPLOAD_SET_PROGRESS:
			set(
				newState,
				[ 'importers', action.importerId, 'percentComplete' ],
				( action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) ) * 100
			);
			break;

		case IMPORTS_IMPORT_START:
			const newImporter = {
				importerId: action.importerId,
				type: action.importerType,
				importerState: appStates.READY_FOR_UPLOAD,
				site: { ID: action.siteId },
			};
			setWith( newState, 'count', ( count = 0 ) => count + 1 );
			set( newState, [ 'importers', action.importerId ], newImporter );
			break;

		case IMPORTS_START_IMPORTING:
			set( newState, [ 'importers', action.importerId, 'importerState' ], appStates.IMPORTING );
			break;

		case IMPORTS_UPLOAD_START:
			set( newState, [ 'importers', action.importerId, 'importerState' ], appStates.UPLOADING );
			set( newState, [ 'importers', action.importerId, 'filename' ], action.filename );
			break;
	}

	newState = adjustImporterLock( newState, payload );

	return newState;
}, getInitialState() );

export function getState() {
	return ImporterStore.get();
}

export default ImporterStore;
