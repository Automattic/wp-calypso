// Reader Tag Subscription Store

// External Dependencies
var Dispatcher = require( 'dispatcher' ),
	isEqual = require( 'lodash/isEqual' ),
	map = require( 'lodash/map' ),
	reject = require( 'lodash/reject' ),
	find = require( 'lodash/find' );

// Internal Dependencies
var emitter = require( 'lib/mixins/emitter' ),
	TagStore = require( './tags' ),
	TagSubscriptionStore;

var subscriptions = null;

function sortSubscriptions( a, b ) {
	if ( a.slug > b.slug ) {
		return 1;
	}
	if ( a.slug < b.slug ) {
		return -1;
	}

	return 0;
}

TagSubscriptionStore = {
	get: function() {
		return subscriptions && subscriptions.map( sub => {
			return TagStore.get( sub.slug ) || sub;
		} );
	},

	isSubscribed: function( slug ) {
		return !! find( subscriptions, { slug: slug } );
	},

	getSubscription: function( slug ) {
		return find( subscriptions, { slug: slug } );
	},

	receiveSubscriptions: function( newSubscriptions ) {
		newSubscriptions = map( newSubscriptions, ( sub ) => {
			return {
				ID: sub.ID,
				slug: sub.slug.toLowerCase()
			};
		} );

		newSubscriptions.sort( sortSubscriptions );

		if ( ! isEqual( newSubscriptions, subscriptions ) ) {
			subscriptions = newSubscriptions;
			TagSubscriptionStore.emit( 'change' );
		}
	},

	receiveFollowComplete: function( tagId ) {
		var tag = find( subscriptions, { ID: tagId } );

		if ( tag ) {
			TagSubscriptionStore.emit( 'add', tag );
		}
	},

	receiveFollowTag: function( newTag ) {
		if ( subscriptions === null ) {
			subscriptions = [];
		}

		subscriptions.push( {
			ID: 'pending',
			slug: newTag.slug.toLowerCase()
		} );

		subscriptions.sort( sortSubscriptions );

		TagSubscriptionStore.emit( 'change' );
	},

	receiveUnfollowTag: function( slug ) {
		var newSubscriptions = reject( subscriptions, { slug: slug } );

		if ( newSubscriptions.length !== subscriptions.length ) {
			subscriptions = newSubscriptions;
			TagSubscriptionStore.emit( 'change' );
		}
	}
};

emitter( TagSubscriptionStore );

TagSubscriptionStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	if ( ! action ) {
		return;
	}

	Dispatcher.waitFor( [ TagStore.dispatchToken ] );

	switch ( action.type ) {
		case 'FOLLOW_READER_TAG':
			TagSubscriptionStore.receiveFollowTag( action.data );
			break;
		case 'UNFOLLOW_READER_TAG':
			TagSubscriptionStore.receiveUnfollowTag( action.data.slug );
			break;
		case 'RECEIVE_READER_TAG_SUBSCRIPTIONS':
		case 'RECEIVE_UNFOLLOW_READER_TAG':
			if ( action.error ) {
				return;
			}
			TagSubscriptionStore.receiveSubscriptions( action.data.tags );
			break;
		case 'RECEIVE_FOLLOW_READER_TAG':
			if ( action.error ) {
				TagSubscriptionStore.receiveUnfollowTag( action.newSlug );
				return;
			}
			TagSubscriptionStore.receiveSubscriptions( action.data.tags );
			TagSubscriptionStore.receiveFollowComplete( action.data.added_tag );
			break;
	}
} );

module.exports = TagSubscriptionStore;
