
// External Dependencies
var Immutable = require( 'immutable' ),
	pick = require( 'lodash/pick' );

// Internal Dependencies
var ActionType = require( './constants' ).action,
	State = require( './constants' ).state,
	Dispatcher = require( 'dispatcher' ),
	Emitter = require( 'lib/mixins/emitter' ),
	decodeEntities = require( 'lib/formatting' ).decodeEntities;

var feeds = {},
	FeedStore = {
		get: function( feedId ) {
			return feeds[ feedId ];
		}
	},
	FeedRecord = Immutable.Record( { // eslint-disable-line new-cap
		feed_ID: null,
		blog_ID: null,
		name: '',
		URL: '',
		feed_URL: '',
		subscribers_count: 0,
		state: State.PENDING,
		error: undefined
	} );

function setFeed( feedId, feed ) {
	if ( feed !== feeds[ feedId ] ) {
		feeds[ feedId ] = feed;
		FeedStore.emit( 'change' );
	}
}

function receiveError( feedId, error ) {
	receiveFeed( feedId, {
		state: State.ERROR,
		error: error
	} );
}

function receiveFeed( feedId, attributes ) {
	var feed = feeds[ feedId ];
	if ( ! feed ) {
		feed = new FeedRecord( { feed_ID: feedId } );
	}
	attributes = pick( attributes, [
		'feed_ID',
		'blog_ID',
		'name',
		'URL',
		'feed_URL',
		'subscribers_count',
		'state',
		'error'
	] );
	if ( attributes.name ) {
		attributes.name = decodeEntities( attributes.name );
	}
	if ( ! attributes.state ) {
		attributes.state = State.COMPLETE;
	}
	feed = feed.merge( attributes );
	setFeed( feedId, feed );
}

Emitter( FeedStore ); // eslint-disable-line new-cap

FeedStore.setMaxListeners( 100 );

FeedStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload && payload.action;

	if ( ! action ) {
		return;
	}

	switch ( action.type ) {
		case ActionType.RECEIVE_FETCH:
			if ( action.error ) {
				receiveError( action.feedId, action.error );
			} else {
				receiveFeed( action.feedId, action.data );
			}
			break;
	}
} );

module.exports = FeedStore;
