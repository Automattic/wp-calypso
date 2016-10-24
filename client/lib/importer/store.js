/**
 * External dependencies
 */
import Immutable from 'immutable';
import partial from 'lodash/partial';

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
const initialState = Immutable.fromJS( {
	count: 0,
	importers: {},
	importerLocks: {},
	api: {
		isHydrated: false,
		isFetching: false,
		retryCount: 0
	}
} );

const equals = ( a, b ) => a === b;
const increment = a => a + 1;

const removableStates = [ appStates.CANCEL_PENDING, appStates.DEFUNCT ];
const shouldRemove = importer => removableStates.some( partial( equals, importer.get( 'importerState' ) ) );

const adjustImporterLock = ( state, { action } ) => {
	switch ( action.type ) {
		case IMPORTS_IMPORT_LOCK:
			return state.setIn( [ 'importerLocks', action.importerId ], true );

		case IMPORTS_IMPORT_UNLOCK:
			return state.setIn( [ 'importerLocks', action.importerId ], false );

		default:
			return state;
	}
};

const ImporterStore = createReducerStore( function( state, payload ) {
	let { action } = payload,
		newState;

	switch ( action.type ) {
		case IMPORTS_STORE_RESET:
			// this is here to enable
			// unit-testing the store
			newState = initialState;
			break;

		case IMPORTS_FETCH:
			newState = state.setIn( [ 'api', 'isFetching' ], true );
			break;

		case IMPORTS_FETCH_FAILED:
			newState = state
				.setIn( [ 'api', 'isFetching' ], false )
				.updateIn( [ 'api', 'retryCount' ], increment );
			break;

		case IMPORTS_FETCH_COMPLETED:
			newState = state
				.setIn( [ 'api', 'isFetching' ], false )
				.setIn( [ 'api', 'isHydrated' ], true )
				.setIn( [ 'api', 'retryCount' ], 0 );
			break;

		case IMPORTS_IMPORT_CANCEL:
		case IMPORTS_IMPORT_RESET:
			// Remove the specified importer from the list of current importers
			newState = state.update( 'importers', importers => {
				return importers.filterNot( importer => importer.get( 'importerId' ) === action.importerId );
			} );
			break;

		case IMPORTS_UPLOAD_FAILED:
			newState = state
				.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.UPLOAD_FAILURE )
				.setIn( [ 'importers', action.importerId, 'errorData' ], { type: 'uploadError', description: action.error } );
			break;

		case IMPORTS_UPLOAD_COMPLETED:
			newState = state
				.deleteIn( [ 'importers' ], action.importerId )
				.setIn( [ 'importers', action.importerStatus.importerId ], Immutable.fromJS( action.importerStatus ) );
			break;

		case IMPORTS_AUTHORS_START_MAPPING:
			newState = state.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.MAP_AUTHORS );
			break;

		case IMPORTS_AUTHORS_SET_MAPPING:
			newState = state.updateIn( [ 'importers', action.importerId, 'customData', 'sourceAuthors' ], authors => (
				authors.map( author => {
					if ( action.sourceAuthor.id !== author.get( 'id' ) ) {
						return author;
					}

					return author.set( 'mappedTo', action.targetAuthor );
				} )
			) );
			break;

		case IMPORTS_IMPORT_RECEIVE:
			newState = state.setIn( [ 'api', 'isHydrated' ], true );

			if ( newState.getIn( [ 'importerLocks', action.importerStatus.importerId ], false ) ) {
				break;
			}

			if ( action.importerStatus.importerState === appStates.DEFUNCT ) {
				newState = newState
					.deleteIn( [ 'importers', action.importerStatus.importerId ] );
				break;
			}

			newState = newState
				.setIn( [ 'importers', action.importerStatus.importerId ], Immutable.fromJS( action.importerStatus ) )
				.update( 'importers', importers => importers.filterNot( shouldRemove ) );
			break;

		case IMPORTS_UPLOAD_SET_PROGRESS:
			newState = state.setIn( [ 'importers', action.importerId, 'percentComplete' ],
				action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) * 100
			);
			break;

		case IMPORTS_IMPORT_START:
			const newImporter = Immutable.fromJS( {
				importerId: action.importerId,
				type: action.importerType,
				importerState: appStates.READY_FOR_UPLOAD,
				site: { ID: action.siteId }
			} );

			newState = state
				.update( 'count', count => count + 1 )
				.setIn( [ 'importers', action.importerId ], newImporter );
			break;

		case IMPORTS_START_IMPORTING:
			newState = state
				.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.IMPORTING );
			break;

		case IMPORTS_UPLOAD_START:
			newState = state
				.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.UPLOADING )
				.setIn( [ 'importers', action.importerId, 'filename' ], action.filename );
			break;

		default:
			newState = state;
			break;
	}

	newState = adjustImporterLock( newState, payload );

	return newState;
}, initialState );

export function getState() {
	return ImporterStore.get().toJS();
}

export default ImporterStore;
