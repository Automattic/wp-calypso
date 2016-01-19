// Reader Lists Items Store

// External dependencies
import { List, fromJS } from 'immutable';
import debugModule from 'debug';

// Internal dependencies
import { action as actionTypes } from './constants';
import { createReducerStore } from 'lib/store';

const debug = debugModule( 'calypso:reader-lists-items' ); //eslint-disable-line no-unused-vars

const initialState = fromJS( {
	lists: {},
	errors: [],
	isFetching: false
} );

const defaultListItems = List(); // eslint-disable-line new-cap

function getListItems( state, listId ) {
	return state.getIn( [ 'lists', +listId, 'items' ], defaultListItems );
}

function receiveItems( state, data ) {
	// Is it the last page?
	let isLastPage = false;
	if ( data.number === 0 ) {
		isLastPage = true;
	}

	// What's the current page?
	const currentPage = +data.page;

	// Add new items from response
	let items = getListItems( state, data.list_ID );
	if ( data && data.items ) {
		items = items.concat( fromJS( data.items ) );
	}

	const updatedList = fromJS( {
		items,
		currentPage,
		isLastPage
	} );

	const updatedLists = state.get( 'lists' ).setIn( [ data.list_ID ], updatedList );
	return state.set( 'lists', updatedLists );
};

const ReaderListsItemsStore = createReducerStore( ( state, payload ) => {
	switch ( payload.action.type ) {
		case actionTypes.ACTION_RECEIVE_READER_LIST_ITEMS:
			return receiveItems( state, payload.action.data );

		case actionTypes.ACTION_RECEIVE_READER_LIST_ITEMS_ERROR:
			const errors = state.get( 'errors' );
			return state.set( 'errors', errors.push( payload.action.error ) );

		case actionTypes.ACTION_FETCH_READER_LIST_ITEMS:
			return state.set( 'isFetching', true );

		case actionTypes.ACTION_FETCH_READER_LIST_ITEMS_COMPLETE:
			return state.set( 'isFetching', false );
	}

	return state;
}, fromJS( initialState ) );

ReaderListsItemsStore.getItemsForList = function( listId ) {
	const state = ReaderListsItemsStore.get();
	return getListItems( state, listId );
};

ReaderListsItemsStore.isFetching = function() {
	const state = ReaderListsItemsStore.get();
	return state.get( 'isFetching' );
};

ReaderListsItemsStore.getLastError = function() {
	const state = ReaderListsItemsStore.get();
	return state.has( 'errors' ) ? state.get( 'errors' ).last() : null;
};

ReaderListsItemsStore.isLastPage = function( listId ) {
	const state = ReaderListsItemsStore.get();
	return state.getIn( [ 'lists', +listId, 'isLastPage' ], false );
};

ReaderListsItemsStore.getCurrentPage = function( listId ) {
	const state = ReaderListsItemsStore.get();
	return state.getIn( [ 'lists', +listId, 'currentPage' ], false );
};

export default ReaderListsItemsStore;
