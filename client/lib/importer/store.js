/**
 * External dependencies
 */
import Immutable from 'immutable';
import partial from 'lodash/function/partial';

/**
 * Internal dependencies
 */
import { actionTypes, appStates } from './constants';
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
		case actionTypes.LOCK_IMPORT:
			return state.setIn( [ 'importerLocks', action.importerId ], true );

		case actionTypes.UNLOCK_IMPORT:
			return state.setIn( [ 'importerLocks', action.importerId ], false );

		default:
			return state;
	}
}

const ImporterStore = createReducerStore( function( state, payload ) {
	let { action } = payload,
		newState;

	switch ( action.type ) {
		case actionTypes.RESET_STORE:
			return initialState;

		case actionTypes.DEV_SET_STATE:
			// Convert the importer list into an object
			action.newState.importers = action.newState.importers
					.reduce( ( total, importer ) => Object.assign( total, { [ importer.id ]: importer } ), {} );

			newState = Immutable.fromJS( action.newState );
			newState = Immutable.is( state, newState ) ? state : newState;
			break;

		case actionTypes.API_REQUEST:
			newState = state.setIn( [ 'api', 'isFetching' ], true );
			break;

		case actionTypes.API_FAILURE:
			newState = state
				.setIn( [ 'api', 'isFetching' ], false )
				.updateIn( [ 'api', 'retryCount' ], increment );
			break;

		case actionTypes.API_SUCCESS:
			newState = state
				.setIn( [ 'api', 'isFetching' ], false )
				.setIn( [ 'api', 'isHydrated' ], true )
				.setIn( [ 'api', 'retryCount' ], 0 );
			break;

		case actionTypes.CANCEL_IMPORT:
		case actionTypes.RESET_IMPORT:
			// Remove the specified importer from the list of current importers
			newState = state.update( 'importers', importers => {
				return importers.filterNot( importer => importer.get( 'importerId' ) === action.importerId );
			} );
			break;

		case actionTypes.FAIL_UPLOAD:
			newState = state
				.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.UPLOAD_FAILURE )
				.setIn( [ 'importers', action.importerId, 'errorData' ], { type: 'uploadError', description: action.error } );
			break;

		case actionTypes.FINISH_UPLOAD:
			newState = state
				.deleteIn( [ 'importers' ], action.importerId )
				.setIn( [ 'importers', action.importerStatus.importerId ], Immutable.fromJS( action.importerStatus ) );
			break;

		case actionTypes.START_MAPPING_AUTHORS:
			newState = state.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.MAP_AUTHORS );
			break;

		case actionTypes.MAP_AUTHORS:
			newState = state.updateIn( [ 'importers', action.importerId, 'customData', 'sourceAuthors' ], authors => (
				authors.map( author => {
					if ( action.sourceAuthor.id !== author.get( 'id' ) ) {
						return author;
					}

					return author.set( 'mappedTo', action.targetAuthor );
				} )
			) );
			break;

		case actionTypes.RECEIVE_IMPORT_STATUS:
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

		case actionTypes.SET_UPLOAD_PROGRESS:
			newState = state.setIn( [ 'importers', action.importerId, 'percentComplete' ],
				action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) * 100
			);
			break;

		case actionTypes.START_IMPORT:
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

		case actionTypes.START_IMPORTING:
			newState = state
				.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.IMPORTING );
			break;

		case actionTypes.START_UPLOAD:
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
