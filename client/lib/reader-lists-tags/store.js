// Reader Lists Tag Subscription Store

// External dependencies
import { List, Map, fromJS } from 'immutable';
import debugModule from 'debug';

// Internal dependencies
import { action as actionTypes } from 'lib/reader-lists-tags/constants';
import { createReducerStore } from 'lib/store';

const debug = debugModule( 'calypso:reader-lists-tags' ); //eslint-disable-line no-unused-vars

const initialState = {
	tags: Map(), // eslint-disable-line new-cap
	errors: [],
	currentPage: {},
	isLastPage: {},
	isFetching: false
};
const defaultTagList = List();

function getListTags( state, listId ) {
	return state.get( 'tags' ).get( +listId, defaultTagList ); // eslint-disable-line new-cap
}

function receiveTags( state, data ) {
	// Is it the last page?
	let isLastPage = state.get( 'isLastPage' );
	if ( data.number === 0 ) {
		isLastPage = isLastPage.set( data.list_ID, true );
	}

	// Add new tags from response
	let tags = state.get( 'tags' );
	if ( data && data.tags ) {
		const existingTags = getListTags( state, data.list_ID );
		tags = tags.setIn( [ data.list_ID ], existingTags.concat( fromJS( data.tags ) ) );
	}

	// Set the current page
	let currentPage = state.get( 'currentPage' );
	currentPage = currentPage.set( data.list_ID, data.page );

	return state.set( 'isLastPage', isLastPage ).set( 'tags', tags ).set( 'currentPage', currentPage );
};

const ReaderListsTagsStore = createReducerStore( ( state, payload ) => {
	switch ( payload.action.type ) {
		case actionTypes.ACTION_RECEIVE_READER_LIST_TAGS:
			return receiveTags( state, payload.action.data );

		case actionTypes.ACTION_RECEIVE_READER_LIST_TAGS_ERROR:
			const errors = state.get( 'errors' );
			return state.set( 'errors', errors.push( payload.action.error ) );

		case actionTypes.ACTION_FETCH_READER_LIST_TAGS:
			return state.set( 'isFetching', true );

		case actionTypes.ACTION_FETCH_READER_LIST_TAGS_COMPLETE:
			return state.set( 'isFetching', false );
	}

	return state;
}, fromJS( initialState ) );

ReaderListsTagsStore.getTagsForList = function( listId ) {
	const state = ReaderListsTagsStore.get();
	return getListTags( state, listId );
};

ReaderListsTagsStore.isFetching = function() {
	const state = ReaderListsTagsStore.get();
	return state.get( 'isFetching' );
};

ReaderListsTagsStore.getLastError = function() {
	const state = ReaderListsTagsStore.get();
	return state.has( 'errors' ) ? state.get( 'errors' ).last() : null;
};

ReaderListsTagsStore.isLastPage = function( listId ) {
	const state = ReaderListsTagsStore.get();
	return state.get( 'isLastPage' ).get( +listId, false );
};

ReaderListsTagsStore.getCurrentPage = function( listId ) {
	const state = ReaderListsTagsStore.get();
	return state.get( 'currentPage' ).get( +listId, 0 );
};

module.exports = ReaderListsTagsStore;
