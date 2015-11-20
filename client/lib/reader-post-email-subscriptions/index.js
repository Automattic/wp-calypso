// Reader Post Email Subscription Store

// External Dependencies
const Dispatcher = require( 'dispatcher' ),
	reject = require( 'lodash/collection/reject' ),
	findLast = require( 'lodash/collection/findLast' ),
	get = require( 'lodash/object/get' ),
	last = require( 'lodash/array/last' ),
	Immutable = require( 'immutable' ),
	forEach = require( 'lodash/collection/forEach' );

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

var PostEmailSubscriptionStore = {

	// Tentatively add the new subscription
	// We haven't received confirmation from the API yet, but we want to update the UI
	receiveSubscribe: function( action ) {
		var deliveryFrequency = 'instantly';
		if ( action.delivery_frequency ) {
			deliveryFrequency = action.delivery_frequency;
		}

		const subscription = {
			blog_id: action.blog_id,
			delivery_frequency: deliveryFrequency
		};
		if ( addSubscription( subscription ) ) {
			PostEmailSubscriptionStore.emit( 'change' );
		}
	},

	receiveUnsubscribe: function( action ) {
		// Tentatively remove the subscription
		// We haven't received confirmation from the API yet, but we want to update the UI
		if ( removeSubscription( action.blog_id ) ) {
			PostEmailSubscriptionStore.emit( 'change' );
		}
	},

	receiveSubscribeResponse: function( action ) {
		var updatedSubscriptionInfo;

		if ( ! action.error && action.data && action.data.subscribed ) {
			// The subscribe worked - discard any existing errors for this site
			PostEmailSubscriptionStore.removeErrorsForBlog( action.blog_id );

			// Remove the placeholder subscription and add the full subscription info
			if ( action.data.subscription ) {
				updatedSubscriptionInfo = action.data.subscription;
				updatedSubscriptionInfo.state = States.SUBSCRIBED;

				updateSubscription( action.data.subscription.blog_id, updatedSubscriptionInfo );

				PostEmailSubscriptionStore.emit( 'add', updatedSubscriptionInfo );
			}

			PostEmailSubscriptionStore.emit( 'change' );

			return;
		}

		errors.push( {
			blogId: action.blog_id,
			errorType: ErrorTypes.UNABLE_TO_SUBSCRIBE,
			timestamp: Date.now()
		} );

		// There was a problem - remove the subscription again
		if ( removeSubscription( action.blog_id ) ) {
			PostEmailSubscriptionStore.emit( 'change' );
		}
	},

	receiveUnsubscribeResponse: function( action ) {
		if ( ! action.error && action.data && ! action.data.subscribed ) {
			// The unfollow worked - discard any existing errors for this site
			PostEmailSubscriptionStore.removeErrorsForBlog( action.blog_id );
			PostEmailSubscriptionStore.emit( 'change' );
			return;
		}

		errors.push( {
			blogId: action.blog_id,
			errorType: ErrorTypes.UNABLE_TO_UNSUBSCRIBE,
			timestamp: Date.now()
		} );

		// There was a problem - add the subscription again
		if ( addSubscription( { blog_id: action.blog_id } ) ) {
			PostEmailSubscriptionStore.emit( 'change' );
		}
	},

	receiveUpdateDeliveryFrequency: function( action ) {
		// Make sure the subscription exists before attempting to update the delivery frequency
		const subscription = {
			blog_id: action.blog_id,
			delivery_frequency: action.delivery_frequency
		};
		if ( ! PostEmailSubscriptionStore.getSubscription( action.blog_id ) ) {
			addSubscription( subscription );
		} else {
			updateSubscription( action.blog_id, subscription );
		}
	},

	receiveUpdateDeliveryFrequencyResponse: function( action ) {
		if ( ! action.error && action.data.success && action.data.subscribed ) {
			// The update worked - discard any existing errors for this site
			PostEmailSubscriptionStore.removeErrorsForBlog( action.blog_id );
			PostEmailSubscriptionStore.emit( 'change' );
			return;
		}

		errors.push( {
			blogId: action.blog_id,
			errorType: ErrorTypes.UNABLE_TO_UPDATE_DELIVERY_FREQUENCY,
			timestamp: Date.now()
		} );

		// There was a problem - restore the original delivery frequency
		const originalDeliveryFrequency = get( action, 'data.subscription.delivery_frequency' );
		if ( originalDeliveryFrequency ) {
			if ( updateSubscription( action.blog_id, { delivery_frequency: originalDeliveryFrequency } ) ) {
				PostEmailSubscriptionStore.emit( 'change' );
			}
		}
	},

	getSubscription: function( blogId ) {
		const subscription = subscriptions[ blogId ];
		if ( subscription && subscription.get( 'state' ) === States.SUBSCRIBED ) {
			return subscription;
		}
		return undefined;
	},

	getIsSubscribed: function( blogId ) {
		return !! PostEmailSubscriptionStore.getSubscription( blogId );
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
		PostEmailSubscriptionStore.emit( 'change' );
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
			postEmailSubscription;

		if ( action.data && ( action.data.errors || ! action.data.subscriptions ) ) {
			return;
		}

		forEach( action.data.subscriptions, function( subscription ) {
			postEmailSubscription = get( subscription, 'delivery_methods.email' );
			if ( postEmailSubscription && postEmailSubscription.send_posts ) {
				addSubscription( {
					blog_id: subscription.blog_ID,
					delivery_frequency: postEmailSubscription.post_delivery_frequency
				} );
				addedSubscriptionCount++;
			}
		} );

		if ( addedSubscriptionCount > 0 ) {
			PostEmailSubscriptionStore.emit( 'change' );
		}
	},

	receiveFeedUnfollow: function( action ) {
		if ( action.blogId ) {
			removeSubscription( action.blogId );
			PostEmailSubscriptionStore.emit( 'change' );
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
		return;
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
	if ( ! PostEmailSubscriptionStore.getSubscription( blogId ) ) {
		return true;
	}

	const newSubscriptionInfo = { state: States.UNSUBSCRIBED };

	updateSubscription( blogId, newSubscriptionInfo );

	return true;
}

Emitter( PostEmailSubscriptionStore ); // eslint-disable-line

// Increase the max number of listeners from 10 to 100
PostEmailSubscriptionStore.setMaxListeners( 200 );

PostEmailSubscriptionStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	if ( ! action ) {
		return;
	}

	switch ( action.type ) {
		case ActionTypes.SUBSCRIBE_TO_POST_EMAILS:
			PostEmailSubscriptionStore.receiveSubscribe( action );
			break;
		case ActionTypes.UNSUBSCRIBE_FROM_POST_EMAILS:
			PostEmailSubscriptionStore.receiveUnsubscribe( action );
			break;
		case ActionTypes.RECEIVE_SUBSCRIBE_TO_POST_EMAILS:
			PostEmailSubscriptionStore.receiveSubscribeResponse( action );
			break;
		case ActionTypes.RECEIVE_UNSUBSCRIBE_FROM_POST_EMAILS:
			PostEmailSubscriptionStore.receiveUnsubscribeResponse( action );
			break;
		case ActionTypes.UPDATE_POST_EMAIL_DELIVERY_FREQUENCY:
			PostEmailSubscriptionStore.receiveUpdateDeliveryFrequency( action );
			break;
		case ActionTypes.RECEIVE_UPDATE_POST_EMAIL_DELIVERY_FREQUENCY:
			PostEmailSubscriptionStore.receiveUpdateDeliveryFrequencyResponse( action );
			break;
		case FeedSubscriptionActionTypes.RECEIVE_FEED_SUBSCRIPTIONS:
			PostEmailSubscriptionStore.receiveFeedSubscriptions( action );
			break;
		case FeedSubscriptionActionTypes.RECEIVE_UNFOLLOW_READER_FEED:
			PostEmailSubscriptionStore.receiveFeedUnfollow( action );
			break;
	}
} );

module.exports = PostEmailSubscriptionStore;
