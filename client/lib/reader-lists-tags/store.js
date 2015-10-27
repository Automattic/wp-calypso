import Dispatcher from 'dispatcher';
import { OrderedSet, fromJS } from 'immutable';
import debugModule from 'debug';

import Emitter from 'lib/mixins/emitter';
import { ACTION_RECEIVE_READER_LIST_TAGS, ACTION_RECEIVE_READER_LIST_TAGS_ERROR } from './constants';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:reader-lists-tags-store' );

var tags = OrderedSet(),
	page = 1;

const store = {
	get( listId ) {
		return tags.filter( function( tag ) {
			return tag.get( 'list_ID' ) === listId;
		} ).toJS();
	},
	getPage() {
		return page;
	}
};

function receiveTags( data ) {
	const previousTags = tags;
	if ( data && data.tags ) {
		// Add list_ID to each tag
		const newTags = data.tags.map( function( tag ) {
			tag.list_ID = data.list_ID;
			return tag;
		} );

		tags = tags.union( fromJS( newTags ) );
		if ( tags !== previousTags ) {
			page++;
			store.emit( 'change' );
		}
	}
}

function receiveError( /*error*/ ) {

}

Emitter( store ); // eslint-disable-line new-cap

store.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload && payload.action;

	switch ( action.type ) {
		case ACTION_RECEIVE_READER_LIST_TAGS:
			receiveTags( action.data );
			break;
		case ACTION_RECEIVE_READER_LIST_TAGS_ERROR:
			receiveError( action.error );
			break;
	}
} );

export default store;
