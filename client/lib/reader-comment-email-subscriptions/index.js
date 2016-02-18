// Reader Comment Email Subscription Store

//var debug = require( 'debug' )( 'calypso:reader:email-subs' );

// External Dependencies
const Dispatcher = require( 'dispatcher' ),
	reject = require( 'lodash/reject' ),
	findLast = require( 'lodash/findLast' ),
	get = require( 'lodash/get' ),
	last = require( 'lodash/last' ),
	Immutable = require( 'immutable' ),
	forEach = require( 'lodash/forEach' );

// Internal Dependencies
const Emitter = require( 'lib/mixins/emitter' ),
	ActionTypes = require( './constants' ).action,
	ErrorTypes = require( './constants' ).error,
	States = require( './constants' ).state,
	FeedSubscriptionActionTypes = require( 'lib/reader-feed-subscriptions/constants' ).action;

var subscriptions = {},
	errors = [],
	subscriptionTemplate = Immutable.Map( { // eslint-disable-line
		state: States.SUBSCRIBED
	} );

var CommentEmailSubscriptionStore = {

	// Tentatively add the new subscription
	// We haven't received confirmation from the API yet, but we want to update the UI
	receiveSubscribe: function( action ) {
		const subscription = {
			blog_id: action.blog_id
		};

		if ( addSubscription( subscription ) ) {
			CommentEmailSubscriptionStore.emit( 'change' );
		}
	},

	receiveUnsubscribe: function( action ) {
		// Tentatively remove the subscription
		// We haven't received confirmation from the API yet, but we want to update the UI
		if ( removeSubscription( action.blog_id ) ) {
			CommentEmailSubscriptionStore.emit( 'change' );
		}
	},

	receiveSubscribeResponse: function( action ) {
		var updatedSubscriptionInfo;

		if ( ! action.error && action.data && action.data.subscribed ) {
			// The subscribe worked - discard any existing errors for this site
			CommentEmailSubscriptionStore.removeErrorsForBlog( action.blog_id );

			// Remove the placeholder subscription and add the full subscription info
			if ( action.data.subscription ) {
				updatedSubscriptionInfo = action.data.subscription;
				updatedSubscriptionInfo.state = States.SUBSCRIBED;

				updateSubscription( action.data.subscription.blog_id, updatedSubscriptionInfo );

				CommentEmailSubscriptionStore.emit( 'add', updatedSubscriptionInfo );
			}

			CommentEmailSubscriptionStore.emit( 'change' );

			return;
		}

		errors.push( {
			blogId: action.blog_id,
			errorType: ErrorTypes.UNABLE_TO_SUBSCRIBE,
			timestamp: Date.now()
		} );

		// There was a problem - remove the subscription again
		if ( removeSubscription( action.blog_id ) ) {
			CommentEmailSubscriptionStore.emit( 'change' );
		}
	},

	receiveUnsubscribeResponse: function( action ) {
		if ( ! action.error && action.data && ! action.data.subscribed ) {
			// The unfollow worked - discard any existing errors for this site
			CommentEmailSubscriptionStore.removeErrorsForBlog( action.blog_id );
			CommentEmailSubscriptionStore.emit( 'change' );
			return;
		}

		errors.push( {
			blogId: action.blog_id,
			errorType: ErrorTypes.UNABLE_TO_UNSUBSCRIBE,
			timestamp: Date.now()
		} );

		// There was a problem - add the subscription again
		if ( addSubscription( { blog_id: action.blog_id } ) ) {
			CommentEmailSubscriptionStore.emit( 'change' );
		}
	},

	getSubscription: function( blogId ) {
		const sub = subscriptions[ blogId ];
		if ( sub && sub.get( 'state' ) === States.SUBSCRIBED ) {
			return sub;
		}
		return undefined;
	},

	getIsSubscribed: function( blogId ) {
		return !! CommentEmailSubscriptionStore.getSubscription( blogId );
	},

	getLastError: function() {
		return last( errors );
	},

	getLastErrorByBlog: function( blogId ) {
		return findLast( errors, { blogId: blogId } );
	},

	removeErrorsForBlog: function( blogId ) {
		var newErrors = reject( errors, { blogId: blogId } );

		if ( newErrors.length === errors.length ) {
			return false;
		}

		errors = newErrors;

		return true;
	},

	dismissError: function( error ) {
		this.removeErrorsForSiteUrl( error.data.URL );
		CommentEmailSubscriptionStore.emit( 'change' );
	},

	clearErrors: function() {
		errors = [];
	},

	clearSubscriptions: function() {
		subscriptions = {};
	},

	// Receive incoming subscriptions from feed subscription API response
	receiveFeedSubscriptions: function( action ) {
		var addedSubscriptionCount = 0,
			emailSubscription;

		if ( action.data && ( action.data.errors || ! action.data.subscriptions ) ) {
			return;
		}

		forEach( action.data.subscriptions, function( subscription ) {
			emailSubscription = get( subscription, 'delivery_methods.email' );
			if ( emailSubscription && emailSubscription.send_comments ) {
				addSubscription( {
					blog_id: subscription.blog_ID
				} );
				addedSubscriptionCount++;
			}
		} );

		if ( addedSubscriptionCount > 0 ) {
			CommentEmailSubscriptionStore.emit( 'change' );
		}
	},

	receiveFeedUnfollow: function( action ) {
		if ( action.blogId ) {
			removeSubscription( action.blogId );
			CommentEmailSubscriptionStore.emit( 'change' );
		}
	}
};

function addSubscription( subscription ) {
	if ( ! subscription || ! subscription.blog_id ) {
		return;
	}

	// Is this URL already in the subscription list (in any state, not just SUBSCRIBED)?
	const existingSubscription = subscriptions[ subscription.blog_id ];

	if ( existingSubscription ) {
		return updateSubscription( subscription.blog_id, subscriptionTemplate );
	}

	// Otherwise, create a new subscription
	const newSubscription = subscriptionTemplate.merge( subscription );
	subscriptions[ subscription.blog_id ] = newSubscription;
	return true;
}

// Update an existing subscription with new information
function updateSubscription( blogId, newSubscriptionInfo ) {
	if ( ! blogId || ! newSubscriptionInfo ) {
		return;
	}

	const existingSubscription = subscriptions[ blogId ];
	if ( ! existingSubscription ) {
		return false;
	}
	const updatedSubscription = existingSubscription.merge( newSubscriptionInfo );

	if ( updatedSubscription === existingSubscription ) {
		return false;
	}

	subscriptions[ blogId ] = updatedSubscription;
	return true;
}

function removeSubscription( blogId ) {
	if ( ! blogId ) {
		return;
	}

	// Sanity check - is the user actually subscribed to the blog?
	if ( ! CommentEmailSubscriptionStore.getSubscription( blogId ) ) {
		return false;
	}

	subscriptions[ blogId ] = null;
	return true;
}

Emitter( CommentEmailSubscriptionStore ); // eslint-disable-line

// Increase the max number of listeners from 10 to 100
CommentEmailSubscriptionStore.setMaxListeners( 200 );

CommentEmailSubscriptionStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	if ( ! action ) {
		return;
	}

	switch ( action.type ) {
		case ActionTypes.SUBSCRIBE_TO_COMMENT_EMAILS:
			CommentEmailSubscriptionStore.receiveSubscribe( action );
			break;
		case ActionTypes.UNSUBSCRIBE_FROM_COMMENT_EMAILS:
			CommentEmailSubscriptionStore.receiveUnsubscribe( action );
			break;
		case ActionTypes.RECEIVE_SUBSCRIBE_TO_COMMENT_EMAILS:
			CommentEmailSubscriptionStore.receiveSubscribeResponse( action );
			break;
		case ActionTypes.RECEIVE_UNSUBSCRIBE_FROM_COMMENT_EMAILS:
			CommentEmailSubscriptionStore.receiveUnsubscribeResponse( action );
			break;
		case FeedSubscriptionActionTypes.RECEIVE_FEED_SUBSCRIPTIONS:
			CommentEmailSubscriptionStore.receiveFeedSubscriptions( action );
			break;
		case FeedSubscriptionActionTypes.RECEIVE_UNFOLLOW_READER_FEED:
			CommentEmailSubscriptionStore.receiveFeedUnfollow( action );
			break;
	}
} );

module.exports = CommentEmailSubscriptionStore;
