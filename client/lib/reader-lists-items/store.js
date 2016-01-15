// Reader Lists Items Store

// External dependencies
import { List, fromJS } from 'immutable';
import debugModule from 'debug';

// Internal dependencies
import { action as actionTypes } from './constants';
import { createReducerStore } from 'lib/store';

const debug = debugModule( 'calypso:reader-lists-items' ); //eslint-disable-line no-unused-vars

const initialState = fromJS( {
	items: {},
	errors: [],
	currentPage: {},
	isLastPage: {},
	isFetching: false
} );
const defaultListItem = List();

function getListItems( state, listId ) {
	return state.get( 'items' ).get( +listId, defaultListItem ); // eslint-disable-line new-cap
}

function receiveItems( state, data ) {
	// Is it the last page?
	let isLastPage = state.get( 'isLastPage' );
	if ( data.number === 0 ) {
		isLastPage = isLastPage.set( data.list_ID, true );
	}

	// Add new items from response
	let items = state.get( 'items' );
	if ( data && data.items ) {
		const existingItems = getListItems( state, data.list_ID );
		items = items.setIn( [ data.list_ID ], existingItems.concat( fromJS( data.items ) ) );
	}

	// Set the current page
	let currentPage = state.get( 'currentPage' );
	currentPage = currentPage.set( data.list_ID, data.page );

	return state.withMutations( currentState => {
		currentState.set( 'isLastPage', isLastPage ).set( 'items', items ).set( 'currentPage', currentPage );
	} );
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
	return state.get( 'isLastPage' ).get( +listId, false );
};

ReaderListsItemsStore.getCurrentPage = function( listId ) {
	const state = ReaderListsItemsStore.get();
	return state.get( 'currentPage' ).get( +listId, 0 );
};

export default ReaderListsItemsStore;
