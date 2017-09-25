/**
 * External dependencies
 */
import { isEqual, last } from 'lodash';

/**
 * Internal dependencies
 */
import { action as actionTypes } from './constants';
import dispatcher from 'dispatcher';
import { decodeEntities } from 'lib/formatting';
import emitter from 'lib/mixins/emitter';

let lists = {},
	errors = [],
	updatedLists = {},
	isFetching = false,
	ListStore;

function keyForList( owner, slug ) {
	return decodeURIComponent( owner ) + '-' + decodeURIComponent( slug );
}

function getListURL( list ) {
	return '/read/list/' + encodeURIComponent( list.owner ) + '/' + encodeURIComponent( list.slug );
}

ListStore = {
	get( owner, slug ) {
		return lists[ keyForList( owner, slug ) ];
	},

	getLastError() {
		return last( errors );
	},

	isUpdated( listId ) {
		return !! updatedLists[ listId ];
	},

	isFetching() {
		return isFetching;
	},

	setIsFetching( val ) {
		isFetching = val;
	},
};

emitter( ListStore );

function receiveList( newList ) {
	const existing = ListStore.get( newList.owner, newList.slug );

	newList.URL = getListURL( newList );
	newList.title = decodeEntities( newList.title );

	if ( ! isEqual( existing, newList ) ) {
		lists[ keyForList( newList.owner, newList.slug ) ] = newList;
		ListStore.emit( 'change' );
	}
}

function markUpdatedList( newList ) {
	updatedLists[ newList.ID ] = true;
	ListStore.emit( 'change' );
}

function markPending( owner, slug ) {
	let key = keyForList( owner, slug ),
		list = lists[ key ];

	if ( ! list ) {
		list = {
			owner: owner,
			slug: slug,
			title: slug,
			ID: null,
			_state: 'pending',
		};
		lists[ key ] = list;
		ListStore.emit( 'change' );
	}
}

function clearUpdatedLists() {
	updatedLists = {};
	ListStore.emit( 'change' );
}

ListStore.dispatchToken = dispatcher.register( function( payload ) {
	const action = payload.action;

	if ( ! action ) {
		return;
	}

	if ( action.error ) {
		errors.push( action.error );
		return;
	}

	switch ( action.type ) {
		case actionTypes.RECEIVE_READER_LIST:
			if ( action.data && action.data.list ) {
				receiveList( action.data.list );
			}
			break;
		case actionTypes.RECEIVE_READER_LISTS:
			if ( action.data && action.data.lists ) {
				action.data.lists.forEach( receiveList );
			}
			break;
		case actionTypes.UPDATE_READER_LIST:
			receiveList( action.data );
			break;
		case actionTypes.RECEIVE_CREATE_READER_LIST:
		case actionTypes.RECEIVE_UPDATE_READER_LIST:
			receiveList( action.data );
			markUpdatedList( action.data );
			break;
		case actionTypes.FOLLOW_LIST:
			markPending( action.data.owner, action.data.slug );
			break;
		case actionTypes.RECEIVE_FOLLOW_LIST:
			receiveList( action.data );
			break;
		case actionTypes.DISMISS_READER_LIST_NOTICE:
			clearUpdatedLists();
			break;
	}
} );

export default ListStore;
