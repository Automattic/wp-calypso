// Reader List Store

// External Dependencies
var Dispatcher = require( 'dispatcher' ),
	find = require( 'lodash/collection/find' ),
	reject = require( 'lodash/collection/reject' ),
	isEqual = require( 'lodash/lang/isEqual' );

// Internal Dependencies
var emitter = require( 'lib/mixins/emitter' ),
	ListStore = require( './lists' );

var lists = null,
	errors = [],
	ReaderListStore,
	isFetching = false;

function mapApiToId( list ) {
	return {
		owner: list.owner,
		slug: list.slug
	};
}

function sortList() {
	lists.sort( function( a, b ) {
		var aTitle = ListStore.get( a.owner, a.slug ).title,
			bTitle = ListStore.get( b.owner, b.slug ).title;
		return aTitle.localeCompare( bTitle );
	} );
}

ReaderListStore = {
	get: function() {
		return lists && lists.map( function( list ) {
			return ListStore.get( list.owner, list.slug );
		} );
	},

	findByOwnerAndSlug: function( owner, slug ) {
		return find( lists, { owner: owner, slug: slug } );
	},

	isSubscribed: function( owner, slug ) {
		return !! this.findByOwnerAndSlug( owner, slug );
	},

	receiveLists: function( newLists ) {
		newLists = newLists.map( mapApiToId );
		if ( ! isEqual( newLists, lists ) ) {
			lists = newLists;
			ReaderListStore.emit( 'change' );
		}
	},

	followList: function( newList ) {
		newList = mapApiToId( newList );

		if ( find( lists, newList ) ) {
			return newList;
		}

		lists.push( newList );
		sortList();
		ReaderListStore.emit( 'change' );
		return newList;
	},

	unfollowList: function( data ) {
		var key = mapApiToId( data ),
			newList = reject( lists, key );

		if ( newList.length !== lists.length ) {
			lists = newList;
			sortList();
			ReaderListStore.emit( 'change' );
		}
	},

	receiveCreateReaderList: function( newList ) {
		newList = ReaderListStore.followList( newList );
		ReaderListStore.emit( 'create', newList );
	},

	isFetching: function() {
		return isFetching;
	},

	setIsFetching: function( val ) {
		isFetching = val;
		ReaderListStore.emitChange();
	}
};

emitter( ReaderListStore );

ReaderListStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	if ( ! action ) {
		return;
	}

	Dispatcher.waitFor( [ ListStore.dispatchToken ] );

	if ( action.error ) {
		errors.push( action.error );
		return;
	}

	switch ( action.type ) {
		case 'RECEIVE_READER_LISTS':
			ReaderListStore.receiveLists( action.data.lists );
			break;

		case 'FOLLOW_LIST':
		case 'RECEIVE_FOLLOW_LIST':
			ReaderListStore.followList( action.data );
			break;

		case 'RECEIVE_FOLLOW_LIST_ERROR':
			ReaderListStore.unfollowList( action.data );
			break;

		case 'UNFOLLOW_LIST':
		case 'RECEIVE_UNFOLLOW_LIST':
			ReaderListStore.unfollowList( action.data );
			break;

		case 'RECEIVE_UNFOLLOW_LIST_ERROR':
			ReaderListStore.followList( action.data );
			break;

		case 'RECEIVE_CREATE_READER_LIST':
			ReaderListStore.receiveCreateReaderList( action.data );
			break;
	}
} );

module.exports = ReaderListStore;
