// Reader Feed Subscription Store

//const debug = require( 'debug' )( 'calypso:reader:feed-subs' );

// External Dependencies
const Dispatcher = require( 'dispatcher' ),
	reject = require( 'lodash/collection/reject' ),
	findLast = require( 'lodash/collection/findLast' ),
	get = require( 'lodash/object/get' ),
	last = require( 'lodash/array/last' ),
	Immutable = require( 'immutable' ),
	clone = require( 'lodash/lang/clone' ),
	map = require( 'lodash/collection/map' );

// Internal Dependencies
const Emitter = require( 'lib/mixins/emitter' ),
	ActionTypes = require( './constants' ).action,
	ErrorTypes = require( './constants' ).error,
	PostStoreActionTypes = require( 'lib/feed-post-store/constants' ).action,
	FeedSubscriptionHelper = require( './helper' ),
	States = require( './constants' ).state;

const subscriptionsTemplate = {
	list: Immutable.List(), // eslint-disable-line new-cap
	count: 0
};

var subscriptions = clone( subscriptionsTemplate ),
	errors = [],
	perPage = 50,
	currentPage = 0,
	isLastPage = false,
	isFetching = false,
	totalSubscriptions,
	subscriptionTemplate = Immutable.Map( { // eslint-disable-line new-cap
		state: States.SUBSCRIBED
	} );

var FeedSubscriptionStore = {

	// Tentatively add the new subscription
	// We haven't received confirmation from the API yet, but we want to update the UI
	receiveFollow: function( action ) {
		var subscription = { URL: action.data.url };
		if ( addSubscription( subscription ) ) {
			FeedSubscriptionStore.emit( 'change' );
		}
	},

	receiveUnfollow: function( action ) {
		// Tentatively remove the subscription
		// We haven't received confirmation from the API yet, but we want to update the UI
		if ( removeSubscription( { URL: action.data.url } ) ) {
			FeedSubscriptionStore.emit( 'change' );
		}
	},

	receiveFollowResponse: function( action ) {
		var updatedSubscriptionInfo;

		if ( ! action.error && action.data && action.data.subscribed && ! action.data.info ) {
			// The follow worked - discard any existing errors for this site
			FeedSubscriptionStore.removeErrorsForSiteUrl( action.url );

			// Remove the placeholder subscription and add the full subscription info
			if ( action.data.subscription ) {
				updatedSubscriptionInfo = action.data.subscription;
				updatedSubscriptionInfo.state = States.SUBSCRIBED;

				updateSubscription( action.url, updatedSubscriptionInfo );

				FeedSubscriptionStore.emit( 'add', this.getSubscription( action.url ) );
			}

			FeedSubscriptionStore.emit( 'change' );

			return;
		}

		const errorInfo = get( action, 'data.info' );

		errors.push( {
			URL: action.url,
			errorType: ErrorTypes.UNABLE_TO_FOLLOW,
			info: errorInfo,
			timestamp: Date.now()
		} );

		// If the user is already subscribed, we don't want to remove the subscription again
		if ( errorInfo !== 'already_subscribed' ) {
			removeSubscription( { URL: action.url } );
		}

		FeedSubscriptionStore.emit( 'change' );
	},

	receiveUnfollowResponse: function( action ) {
		if ( ! action.error && action.data && ! action.data.subscribed ) {
			// The unfollow worked - discard any existing errors for this site
			FeedSubscriptionStore.removeErrorsForSiteUrl( action.url );
			FeedSubscriptionStore.emit( 'remove', action.url );
			return;
		}

		errors.push( {
			URL: action.url,
			errorType: ErrorTypes.UNABLE_TO_UNFOLLOW,
			info: get( action, 'data.info' ),
			timestamp: Date.now()
		} );

		// There was a problem - add the subscription again
		if ( addSubscription( { URL: action.url } ) ) {
			FeedSubscriptionStore.emit( 'change' );
		}
	},

	receivePost: function( post ) {
		if ( ! ( post && post.site_URL ) ) {
			return;
		}

		const siteUrl = FeedSubscriptionHelper.prepareSiteUrl( post.site_URL );

		if ( ( post.is_following ) && ! this.getIsFollowingBySiteUrl( post.site_URL ) ) {
			addSubscription( { URL: siteUrl } );
		}

		FeedSubscriptionStore.emit( 'change' );
	},

	receiveSubscriptions: function( data ) {
		var currentSubscriptions = subscriptions,
			newSubscriptions,
			combinedSubscriptions;

		if ( ! data.subscriptions ) {
			return;
		}

		// All subscriptions we receive this way will be 'subscribed', so set the state accordingly
		const subscriptionsWithState = map( data.subscriptions, function( sub ) {
			return subscriptionTemplate.merge( sub );
		} );

		newSubscriptions = Immutable.List( subscriptionsWithState ); // eslint-disable-line new-cap

		// Is it the last page?
		if ( data.number === 0 ) {
			isLastPage = true;
		}

		// Is it a new page of results?
		if ( currentPage > 0 && data.page > currentPage ) {
			combinedSubscriptions = currentSubscriptions.list.concat( newSubscriptions );

			subscriptions = {
				count: combinedSubscriptions.size,
				list: combinedSubscriptions
			};
		} else {
			// Looks like the first results we've received...
			subscriptions = {
				count: newSubscriptions.size,
				list: newSubscriptions
			};
		}

		// Set the current page
		currentPage = data.page;

		// Set total subscriptions for user on the first page only (we keep track of it in the store after that)
		if ( currentPage === 1 ) {
			totalSubscriptions = data.total_subscriptions;
		}

		FeedSubscriptionStore.emit( 'change' );
	},

	getIsFollowingBySiteUrl: function( siteUrl ) {
		return !! ( this.getSubscription( siteUrl ) );
	},

	getSubscriptions: function() {
		return subscriptions;
	},

	getSubscription: function( siteUrl ) {
		const preparedSiteUrl = FeedSubscriptionHelper.prepareSiteUrl( siteUrl );
		return subscriptions.list.find( function( subscription ) {
			return ( subscription.get( 'URL' ) === preparedSiteUrl && subscription.get( 'state' ) === States.SUBSCRIBED );
		} );
	},

	getTotalSubscriptions: function() {
		return totalSubscriptions;
	},

	getLastError: function() {
		return last( errors );
	},

	isFetching: function() {
		return isFetching;
	},

	setIsFetching: function( val ) {
		isFetching = val;
		FeedSubscriptionStore.emitChange();
	},

	getLastErrorBySiteUrl: function( siteUrl ) {
		return findLast( errors, { URL: FeedSubscriptionHelper.prepareSiteUrl( siteUrl ) } );
	},

	removeErrorsForSiteUrl: function( siteUrl ) {
		var newErrors = reject( errors, { URL: FeedSubscriptionHelper.prepareSiteUrl( siteUrl ) } );

		if ( newErrors.length === errors.length ) {
			return false;
		}

		errors = newErrors;

		return true;
	},

	dismissError: function( error ) {
		this.removeErrorsForSiteUrl( error.data.URL );
		FeedSubscriptionStore.emit( 'change' );
	},

	clearErrors: function() {
		errors = [];
	},

	clearSubscriptions: function() {
		subscriptions = clone( subscriptionsTemplate );
	},

	isLastPage: function() {
		return isLastPage;
	},

	getCurrentPage: function() {
		return currentPage;
	},

	getPerPage: function() {
		return perPage;
	},

	setPerPage: function( newPerPage ) {
		perPage = newPerPage;
	}
};

function addSubscription( subscription ) {
	if ( ! subscription || ! subscription.URL ) {
		return;
	}

	// Is this URL already in the subscription list (in any state, not just SUBSCRIBED)?
	const preparedSiteUrl = FeedSubscriptionHelper.prepareSiteUrl( subscription.URL );
	const existingSubscription = subscriptions.list.find( function( sub ) {
		return sub.get( 'URL' ) === preparedSiteUrl;
	} );

	if ( existingSubscription ) {
		return updateSubscription( preparedSiteUrl, subscriptionTemplate );
	}

	// Otherwise, create a new subscription
	subscription.URL = preparedSiteUrl;
	const newSubscription = subscriptionTemplate.merge( subscription );
	subscriptions.list = subscriptions.list.unshift( newSubscription );
	subscriptions.count++;

	if ( totalSubscriptions > 0 ) {
		totalSubscriptions++;
	}

	return true;
}

// Update an existing subscription with new information
function updateSubscription( url, newSubscriptionInfo ) {
	if ( ! url || ! newSubscriptionInfo ) {
		return;
	}

	const preparedSiteUrl = FeedSubscriptionHelper.prepareSiteUrl( url );
	const subscriptionIndex = subscriptions.list.findIndex( function( item ) {
		return item.get( 'URL' ) === preparedSiteUrl;
	} );

	if ( isNaN( subscriptionIndex ) ) {
		return;
	}

	const existingSubscription = subscriptions.list.get( subscriptionIndex );

	// If it's a refollow (i.e. the store has handled an unsubscribe for this feed already), add is_refollow flag to the updated subscription object
	if ( existingSubscription.get( 'state' ) === States.UNSUBSCRIBED && typeof newSubscriptionInfo.get === 'function' && newSubscriptionInfo.get( 'state' ) === States.SUBSCRIBED ) {
		newSubscriptionInfo = newSubscriptionInfo.merge( { is_refollow: true } );
	}

	const updatedSubscription = existingSubscription.merge( newSubscriptionInfo );
	const updatedSubscriptionsList = subscriptions.list.set( subscriptionIndex, updatedSubscription );

	if ( updatedSubscriptionsList === subscriptions.list ) {
		return false;
	}

	subscriptions.list = updatedSubscriptionsList;

	if ( totalSubscriptions > 0 && existingSubscription.get( 'state' ) === States.UNSUBSCRIBED && updatedSubscription.get( 'state' ) === States.SUBSCRIBED ) {
		totalSubscriptions++;
	}

	return true;
}

function removeSubscription( subscription ) {
	if ( ! subscription || ! subscription.URL ) {
		return;
	}

	const newSubscriptionInfo = { state: States.UNSUBSCRIBED };

	updateSubscription( subscription.URL, newSubscriptionInfo );

	if ( totalSubscriptions > 0 ) {
		totalSubscriptions--;
	}

	return true;
}

Emitter( FeedSubscriptionStore ); // eslint-disable-line

// Increase the max number of listeners from 10 to 100
FeedSubscriptionStore.setMaxListeners( 100 );

FeedSubscriptionStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	if ( ! action ) {
		return;
	}

	switch ( action.type ) {
		case ActionTypes.FOLLOW_READER_FEED:
			FeedSubscriptionStore.receiveFollow( action );
			break;
		case ActionTypes.UNFOLLOW_READER_FEED:
			FeedSubscriptionStore.receiveUnfollow( action );
			break;
		case ActionTypes.RECEIVE_FOLLOW_READER_FEED:
			FeedSubscriptionStore.receiveFollowResponse( action );
			break;
		case ActionTypes.RECEIVE_UNFOLLOW_READER_FEED:
			FeedSubscriptionStore.receiveUnfollowResponse( action );
			break;
		case ActionTypes.DISMISS_FOLLOW_ERROR:
			FeedSubscriptionStore.dismissError( action );
			break;
		case PostStoreActionTypes.RECEIVE_FEED_POST:
			if ( action.data && ! action.data.errors ) {
				FeedSubscriptionStore.receivePost( action.data );
			}
			break;
		case ActionTypes.RECEIVE_FEED_SUBSCRIPTIONS:
			if ( action.data && ! action.data.errors ) {
				FeedSubscriptionStore.receiveSubscriptions( action.data );
			}
			break;
	}
} );

module.exports = FeedSubscriptionStore;
