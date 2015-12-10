// Reader Lists Tag Subscription Store

// External Dependencies
import { OrderedSet, fromJS } from 'immutable';
import Dispatcher from 'dispatcher';
import last from 'lodash/array/last';

// Internal Dependencies
import Emitter from 'lib/mixins/emitter';
import { action as ActionTypes } from 'lib/reader-lists-tags/constants';

var tags = OrderedSet(), // eslint-disable-line new-cap
	errors = [],
	currentPage = {},
	isLastPage = {},
	isFetching = false;

const ReaderListsTagsStore = {

	receiveTags: function( data ) {
		// Is it the last page?
		if ( data.number === 0 ) {
			isLastPage[ data.list_ID ] = true;
		}

		const previousTags = tags;
		if ( data && data.tags ) {
			// Add list_ID to each tag
			const newTags = data.tags.map( function( tag ) {
				tag.list_ID = data.list_ID;
				return tag;
			} );

			tags = tags.union( fromJS( newTags ) );
			if ( tags !== previousTags ) {
				ReaderListsTagsStore.emit( 'change' );
			}
		}

		// Set the current page
		currentPage[ data.list_ID ] = data.page;
	},

	getTagsForList: function( listId ) {
		return tags.filter( function( tag ) {
			return tag.get( 'list_ID' ) === parseInt( listId );
		} ).toJS();
	},

	getLastError: function() {
		return last( errors );
	},

	isFetching: function() {
		return isFetching;
	},

	setIsFetching: function( val ) {
		isFetching = val;
		ReaderListsTagsStore.emitChange();
	},

	isLastPage: function( listId ) {
		return isLastPage[ listId ] ? isLastPage[ listId ] : false;
	},

	getCurrentPage: function( listId ) {
		return currentPage[ listId ] ? currentPage[ listId ] : 0;
	}
};

Emitter( ReaderListsTagsStore ); // eslint-disable-line new-cap

// Increase the max number of listeners from 10 to 200
ReaderListsTagsStore.setMaxListeners( 200 );

ReaderListsTagsStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	if ( ! action ) {
		return;
	}

	switch ( action.type ) {
		case ActionTypes.ACTION_RECEIVE_READER_LIST_TAGS:
			ReaderListsTagsStore.receiveTags( action.data );
			break;
	}
} );

module.exports = ReaderListsTagsStore;
