// Reader Lists Store

// External dependencies
import { fromJS } from 'immutable';
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

function receiveList( state, data ) {
	if ( ! data || ! data.list ) {
		return state;
	}

	const existingLists = state.get( 'lists' );
	const existingList = existingLists.get( +data.list.ID );
	let updatedList = null;

	if ( existingList ) {
		updatedList = existingList.mergeDeep( data.list );
	} else {
		updatedList = fromJS( data.list );
	}

	if ( existingList === updatedList ) {
		// no change, bail
		return state;
	}

	const updatedLists = existingLists.setIn( [ data.list.ID ], updatedList );

	return state.set( 'lists', updatedLists );
};

const ReaderListsStore = createReducerStore( ( state, payload ) => {
	switch ( payload.action.type ) {
		case actionTypes.RECEIVE_READER_LIST:
			return receiveList( state, payload.action.data );
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

export default ReaderListsStore;

