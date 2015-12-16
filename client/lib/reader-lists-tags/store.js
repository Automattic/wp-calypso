// Reader Lists Tag Subscription Store

// External dependencies
import { OrderedSet, fromJS } from 'immutable';

// Internal dependencies
import { action as actionTypes } from 'lib/reader-lists-tags/constants';
import { createReducerStore } from 'lib/store';

const initialState = {
	tags: OrderedSet(), // eslint-disable-line new-cap
	errors: [],
	currentPage: {},
	isLastPage: {},
	isFetching: false
};

const ReaderListsTagsStore = createReducerStore( ( state, payload ) => {
	switch ( payload.action.type ) {
		case actionTypes.ACTION_RECEIVE_READER_LIST_TAGS:
			return ReaderListsTagsStore.receiveTags( payload.action.data );

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
	return state.get( 'tags' ).filter( function( tag ) {
		return tag.get( 'list_ID' ) === parseInt( listId );
	} ).toJS();
};

ReaderListsTagsStore.receiveTags = function( data ) {
	const state = ReaderListsTagsStore.get();

	// Is it the last page?
	let isLastPage = state.get( 'isLastPage' );
	if ( data.number === 0 ) {
		isLastPage = isLastPage.set( data.list_ID, true );
	}

	// Add new tags from response
	let tags = state.get( 'tags' );
	if ( data && data.tags ) {
		// Add list_ID to each tag
		const newTags = data.tags.map( function( tag ) {
			tag.list_ID = data.list_ID;
			return tag;
		} );

		tags = tags.union( fromJS( newTags ) );
	}

	// Set the current page
	let currentPage = state.get( 'currentPage' );
	currentPage = currentPage.set( data.list_ID, data.page );

	return state.set( 'isLastPage', isLastPage ).set( 'tags', tags ).set( 'currentPage', currentPage );
};

ReaderListsTagsStore.isFetching = function() {
	const state = ReaderListsTagsStore.get();
	return state.get( 'isFetching' );
};

ReaderListsTagsStore.getLastError = function() {
	const state = ReaderListsTagsStore.get();
	return state.has( 'errors' ) ? state.get( 'errors' ).last().toJS() : null;
};

ReaderListsTagsStore.isLastPage = function( listId ) {
	const state = ReaderListsTagsStore.get();
	const isLastPage = state.get( 'isLastPage' ).toJS();
	return isLastPage[ listId ] ? isLastPage[ listId ] : false;
};

ReaderListsTagsStore.getCurrentPage = function( listId ) {
	const state = ReaderListsTagsStore.get();
	const currentPage = state.get( 'currentPage' ).toJS();
	return currentPage[ listId ] ? currentPage[ listId ] : 0;
};

module.exports = ReaderListsTagsStore;
