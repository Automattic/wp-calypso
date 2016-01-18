// Reader Lists Store

// External dependencies
import { fromJS, Map } from 'immutable';
import get from 'lodash/object/get';
import debugModule from 'debug';

// Internal dependencies
import { action as actionTypes } from './constants';
import { createReducerStore } from 'lib/store';

const debug = debugModule( 'calypso:reader-lists-items' ); //eslint-disable-line no-unused-vars

const initialState = {
	lists: {},
	updatedLists: {},
	errors: [],
	isFetching: false
};

function receiveList( state, newList ) {
	if ( ! newList ) {
		return state;
	}

	const existingLists = state.get( 'lists' );
	const existingList = existingLists.get( +newList.ID );

	let updatedList = null;
	if ( existingList ) {
		updatedList = existingList.mergeDeep( newList );
	} else {
		updatedList = fromJS( newList );
	}

	if ( existingList === updatedList ) {
		// no change, bail
		return state;
	}

	const updatedLists = existingLists.setIn( [ +newList.ID ], updatedList );
	return state.set( 'lists', updatedLists );
};

function markUpdatedList( state, listId ) {
	const newUpdatedLists = state.get( 'updatedLists' ).setIn( [ +listId ], true );
	return state.set( 'updatedLists', newUpdatedLists );
}

const ReaderListsStore = createReducerStore( ( state, payload ) => {
	const data = get( payload, 'action.data' );

	switch ( payload.action.type ) {
		case actionTypes.RECEIVE_READER_LIST:
		case actionTypes.UPDATE_READER_LIST:
			return receiveList( state, data.list );

		case actionTypes.RECEIVE_READER_LISTS:
			if ( data && data.lists ) {
				data.lists.forEach( function( list ) {
					state = receiveList( state, list );
				} );
			}
			return state;

		case actionTypes.RECEIVE_CREATE_READER_LIST:
		case actionTypes.RECEIVE_UPDATE_READER_LIST:
			state = receiveList( state, data.list );
			state = markUpdatedList( state, data.list.ID );
			return state;

		case actionTypes.DISMISS_READER_LIST_NOTICE:
			return state.set( 'updatedLists', new Map() );
	}

	return state;
}, fromJS( initialState ) );

ReaderListsStore.getLists = function() {
	const state = ReaderListsStore.get();
	return state.get( 'lists' );
};

ReaderListsStore.isFetching = function() {
	const state = ReaderListsStore.get();
	return state.get( 'isFetching' );
};

ReaderListsStore.getLastError = function() {
	const state = ReaderListsStore.get();
	return state.has( 'errors' ) ? state.get( 'errors' ).last() : null;
};

ReaderListsStore.isUpdated = function( listId ) {
	const state = ReaderListsStore.get();
	return !! state.get( 'updatedLists' ).has( listId );
};

export default ReaderListsStore;

