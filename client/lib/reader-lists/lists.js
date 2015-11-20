var decodeEntities = require( 'lib/formatting' ).decodeEntities,
	dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' ),
	isEqual = require( 'lodash/lang/isEqual' );

var lists = {}, ListStore;

function keyForList( owner, slug ) {
	return owner + '-' + slug;
}

function getListURL( list ) {
	return '/read/list/' + encodeURIComponent( list.owner ) + '/' + encodeURIComponent( list.slug ) + '/';
}

ListStore = {
	get( owner, slug ) {
		return lists[ keyForList( owner, slug ) ];
	}
};

emitter( ListStore );

function receiveList( newList ) {
	var existing = ListStore.get( newList.owner, newList.slug );

	newList.URL = getListURL( newList );
	newList.title = decodeEntities( newList.title );

	if ( ! isEqual( existing, newList ) ) {
		lists[ keyForList( newList.owner, newList.slug ) ] = newList;
		ListStore.emit( 'change' );
	}
}

function markPending( owner, slug ) {
	var key = keyForList( owner, slug ),
		list = lists[ key ];

	if ( ! list ) {
		list = {
			owner: owner,
			slug: slug,
			title: slug,
			ID: null,
			_state: 'pending'
		};
		lists[ key ] = list;
		ListStore.emit( 'change' );
	}
}

ListStore.dispatchToken = dispatcher.register( function( payload ) {
	const action = payload.action;

	if ( ! action || action.error ) {
		return;
	}

	switch ( action.type ) {
		case 'RECEIVE_READER_LIST':
			if ( action.data && action.data.list ) {
				receiveList( action.data.list );
			}
			break;
		case 'RECEIVE_READER_LISTS':
			if ( action.data && action.data.lists ) {
				action.data.lists.forEach( receiveList );
			}
			break;
		case 'RECEIVE_CREATE_READER_LIST':
			receiveList( action.data );
			break;
		case 'FOLLOW_LIST':
			markPending( action.data.owner, action.data.slug );
			break;
		case 'RECEIVE_FOLLOW_LIST':
			receiveList( action.data );
			break;
	}
} );

module.exports = ListStore;
