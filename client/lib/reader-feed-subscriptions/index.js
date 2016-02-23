// Reader Feed Subscription Store

const debug = require( 'debug' )( 'calypso:reader:feed-subs' );

// External Dependencies
const Dispatcher = require( 'dispatcher' ),
	reject = require( 'lodash/reject' ),
	findLast = require( 'lodash/findLast' ),
	get = require( 'lodash/get' ),
	last = require( 'lodash/last' ),
	Immutable = require( 'immutable' ),
	clone = require( 'lodash/clone' ),
	map = require( 'lodash/map' ),
	forEach = require( 'lodash/foreach' );

// Internal Dependencies
const Emitter = require( 'lib/mixins/emitter' ),
	ActionTypes = require( './constants' ).action,
	ErrorTypes = require( './constants' ).error,
	FeedSubscriptionHelper = require( './helper' ),
	States = require( './constants' ).state,
	FeedActionTypes = require( 'lib/feed-store/constants' ).action;

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
	totalSubscriptions = 0,
	subscriptionTemplate = Immutable.Map( { // eslint-disable-line new-cap
		state: States.SUBSCRIBED
	} );

var FeedSubscriptionStore = {

	// Tentatively add the new subscription
	// We haven't received confirmation from the API yet, but we want to update the UI
	receiveFollow: function( action ) {
		var subscription = { URL: action.data.url };
		debug( 'receiveFollow: ' + action.data.url );
		if ( addSubscription( subscription ) ) {
			FeedSubscriptionStore.emit( 'change' );
		}
	},

	receiveUnfollow: function( action ) {
		// Tentatively remove the subscription
		// We haven't received confirmation from the API yet, but we want to update the UI
		const siteUrl = FeedSubscriptionHelper.prepareSiteUrl( action.data.url );
		debug( 'receiveUnfollow: ' + siteUrl );
		if ( removeSubscription( { URL: siteUrl } ) ) {
			FeedSubscriptionStore.emit( 'change' );
		}
	},

	receiveFollowResponse: function( action ) {
		var updatedSubscriptionInfo;

		const siteUrl = FeedSubscriptionHelper.prepareSiteUrl( action.url );
		debug( 'receiveFollowResponse: ' + siteUrl );

		if ( ! action.error && action.data && action.data.subscribed && ! action.data.info ) {
			// The follow worked - discard any existing errors for this site
			FeedSubscriptionStore.removeErrorsForSiteUrl( siteUrl );

			// Remove the placeholder subscription and add the full subscription info
			if ( action.data.subscription ) {
				updatedSubscriptionInfo = action.data.subscription;
				updatedSubscriptionInfo.state = States.SUBSCRIBED;

				updateSubscription( siteUrl, updatedSubscriptionInfo );
				debug( 'updateSubscription ' + siteUrl );
				debug( updatedSubscriptionInfo );
				FeedSubscriptionStore.emit( 'add', this.getSubscription( siteUrl ) );
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
			removeSubscription( { URL: siteUrl } );
		}

		FeedSubscriptionStore.emit( 'change' );
	},

	receiveUnfollowResponse: function( action ) {
		if ( ! action.error && action.data && ! action.data.subscribed ) {
			debug( 'receiveUnfollowResponse: ' + action.url );
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

	receiveSubscriptions: function( data ) {
		if ( ! data.subscriptions ) {
			return;
		}

		// All subscriptions we receive this way will be 'subscribed', so set the state accordingly
		const subscriptionsWithState = map( data.subscriptions, function( sub ) {
			sub.URL = FeedSubscriptionHelper.prepareSiteUrl( sub.URL );
			return subscriptionTemplate.merge( sub );
		} );

		// Is it the last page?
		if ( data.number === 0 ) {
			isLastPage = true;
		}

		forEach( subscriptionsWithState, function( subscription ) {
			addSubscription( subscription.toJS(), false );
		} );

		// Set the current page
		currentPage = data.page;

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
		totalSubscriptions = 0;
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

function addSubscription( subscription, addToTop = true ) {
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
	if ( addToTop ) {
		subscriptions.list = subscriptions.list.unshift( newSubscription );
	} else {
		subscriptions.list = subscriptions.list.push( newSubscription );
	}
	subscriptions.count++;
	totalSubscriptions++;

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

	// Ensure we're working with an Immutable object
	newSubscriptionInfo = Immutable.fromJS( newSubscriptionInfo );

	// If it's a refollow (i.e. the store has handled an unsubscribe for this feed already), add is_refollow flag to the updated subscription object
	if ( existingSubscription.get( 'state' ) === States.UNSUBSCRIBED && newSubscriptionInfo.get( 'state' ) === States.SUBSCRIBED ) {
		newSubscriptionInfo = newSubscriptionInfo.merge( { is_refollow: true } );
	}

	// Used the incoming URL if there is one - it might be different to the original subscribed URL after feed autodiscovery
	const newSubscriptionInfoUrl = newSubscriptionInfo.get( 'URL' );
	if ( newSubscriptionInfoUrl ) {
		debug( 'New subscription URL is ' + newSubscriptionInfoUrl );
		newSubscriptionInfo = newSubscriptionInfo.set( 'URL', FeedSubscriptionHelper.prepareSiteUrl( newSubscriptionInfoUrl ) );
	}

	const updatedSubscription = existingSubscription.merge( newSubscriptionInfo );
	const updatedSubscriptionsList = subscriptions.list.set( subscriptionIndex, updatedSubscription );

	if ( updatedSubscriptionsList === subscriptions.list ) {
		return false;
	}

	subscriptions.list = updatedSubscriptionsList;

	if ( existingSubscription.get( 'state' ) === States.UNSUBSCRIBED && updatedSubscription.get( 'state' ) === States.SUBSCRIBED ) {
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
		case ActionTypes.RECEIVE_FEED_SUBSCRIPTIONS:
			if ( action.data && ! action.data.errors ) {
				FeedSubscriptionStore.receiveSubscriptions( action.data );
			}
			break;
		case FeedActionTypes.RECEIVE_FETCH:
			if ( action.data && action.data.is_following ) {
				// Use the feed URL in as the primary URL
				const subscription = Object.assign( {}, action.data, { URL: action.data.feed_URL } );
				addSubscription( subscription );
			}
			break;
	}
} );

export default FeedSubscriptionStore;
