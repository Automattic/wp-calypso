// Reader Lists Feed Subscription Store

// External dependencies
import { List, Map, fromJS } from 'immutable';
import debugModule from 'debug';

// Internal dependencies
import { action as actionTypes } from './constants';
import { createReducerStore } from 'lib/store';

const debug = debugModule( 'calypso:reader-lists-feeds' ); //eslint-disable-line no-unused-vars

const initialState = {
	feeds: Map(), // eslint-disable-line new-cap
	errors: [],
	currentPage: {},
	isLastPage: {},
	isFetching: false
};
const defaultFeedList = List();

function getListFeeds( state, listId ) {
	return state.get( 'feeds' ).get( parseInt( listId ), defaultFeedList ); // eslint-disable-line new-cap
}

function receiveFeeds( state, data ) {
	// Is it the last page?
	let isLastPage = state.get( 'isLastPage' );
	if ( data.number === 0 ) {
		isLastPage = isLastPage.set( data.list_ID, true );
	}

	// Add new feeds from response
	let feeds = state.get( 'feeds' );
	if ( data && data.feeds ) {
		const existingFeeds = getListFeeds( state, data.list_ID );
		feeds = feeds.setIn( [ data.list_ID ], existingFeeds.concat( fromJS( data.feeds ) ) );
	}

	// Set the current page
	let currentPage = state.get( 'currentPage' );
	currentPage = currentPage.set( data.list_ID, data.page );

	return state.set( 'isLastPage', isLastPage ).set( 'feeds', feeds ).set( 'currentPage', currentPage );
};

const ReaderListsFeedsStore = createReducerStore( ( state, payload ) => {
	switch ( payload.action.type ) {
		case actionTypes.ACTION_RECEIVE_READER_LIST_FEEDS:
			return receiveFeeds( state, payload.action.data );

		case actionTypes.ACTION_RECEIVE_READER_LIST_FEEDS_ERROR:
			const errors = state.get( 'errors' );
			return state.set( 'errors', errors.push( payload.action.error ) );

		case actionTypes.ACTION_FETCH_READER_LIST_FEEDS:
			return state.set( 'isFetching', true );

		case actionTypes.ACTION_FETCH_READER_LIST_FEEDS_COMPLETE:
			return state.set( 'isFetching', false );
	}

	return state;
}, fromJS( initialState ) );

ReaderListsFeedsStore.getFeedsForList = function( listId ) {
	const state = ReaderListsFeedsStore.get();
	return getListFeeds( state, listId );
};

ReaderListsFeedsStore.isFetching = function() {
	const state = ReaderListsFeedsStore.get();
	return state.get( 'isFetching' );
};

ReaderListsFeedsStore.getLastError = function() {
	const state = ReaderListsFeedsStore.get();
	return state.has( 'errors' ) ? state.get( 'errors' ).last() : null;
};

ReaderListsFeedsStore.isLastPage = function( listId ) {
	const state = ReaderListsFeedsStore.get();
	return state.get( 'isLastPage' ).get( parseInt( listId ), false );
};

ReaderListsFeedsStore.getCurrentPage = function( listId ) {
	const state = ReaderListsFeedsStore.get();
	return state.get( 'currentPage' ).get( parseInt( listId ), 0 );
};

module.exports = ReaderListsFeedsStore;
