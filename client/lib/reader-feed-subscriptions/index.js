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
	forEach = require( 'lodash/forEach' );

// Internal Dependencies
const Emitter = require( 'lib/mixins/emitter' ),
	ActionTypes = require( './constants' ).action,
	ErrorTypes = require( './constants' ).error,
	States = require( './constants' ).state,
	FeedActionTypes = require( 'lib/feed-store/constants' ).action;

import { prepareComparableUrl, prepareSiteUrl } from './helper';

const subscriptionsTemplate = {
	list: Immutable.List(), // eslint-disable-line new-cap
	count: 0
};

let subscriptions = clone( subscriptionsTemplate ),
	errors = [],
	perPage = 50,
	currentPage = 0,
	isLastPage = false,
	isFetching = false,
	totalSubscriptions = 0,
	subscriptionTemplate = Immutable.Map( { // eslint-disable-line new-cap
		state: States.SUBSCRIBED
	} );

const FeedSubscriptionStore = {

	// Tentatively add the new subscription
	// We haven't received confirmation from the API yet, but we want to update the UI
	receiveFollow: function( action ) {
		const subscription = { URL: action.data.url };
		debug( 'receiveFollow: ' + action.data.url );
		if ( addSubscription( subscription ) ) {
			FeedSubscriptionStore.emit( 'change' );
		}
	},

	receiveUnfollow: function( action ) {
		// Tentatively remove the subscription
		// We haven't received confirmation from the API yet, but we want to update the UI
		const siteUrl = prepareSiteUrl( action.data.url );
		debug( 'receiveUnfollow: ' + siteUrl );
		if ( removeSubscription( { URL: siteUrl } ) ) {
			FeedSubscriptionStore.emit( 'change' );
		}
	},

	receiveFollowResponse: function( action ) {
		let updatedSubscriptionInfo;

		const siteUrl = prepareSiteUrl( action.url );
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
			URL: siteUrl,
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
		if ( ! ( data && data.subscriptions ) ) {
			return;
		}

		// All subscriptions we receive this way will be 'subscribed', so set the state accordingly
		const subscriptionsWithState = map( data.subscriptions, function( sub ) {
			sub.URL = prepareSiteUrl( sub.URL );
			sub.comparableUrl = prepareComparableUrl( sub.URL );
			return subscriptionTemplate.merge( sub );
		} );

		// Is it the last page?
		if ( data.number === 0 || data.page === 40 ) {
			isLastPage = true;
		}

		subscriptions.list = subscriptions.list.asMutable();
		forEach( subscriptionsWithState, function( subscription ) {
			_acceptSubscription( subscription, false );
		} );
		subscriptions.list = subscriptions.list.sort( function( a, b ) {
			const aDate = a.get( 'date_subscribed' ),
				bDate = b.get( 'date_subscribed' );

			if ( aDate > bDate ) {
				return -1;
			}

			if ( aDate < bDate ) {
				return 1;
			}

			return b.get( 'feed_ID' ) - a.get( 'feed_ID' );
		} );

		subscriptions.list = subscriptions.list.asImmutable();

		// Set the current page
		currentPage = data.page;

		if ( currentPage === 1 ) {
			totalSubscriptions = data.total_subscriptions;
		}
		subscriptions.count = subscriptions.list.count();

		FeedSubscriptionStore.emit( 'change' );
	},

	getIsFollowingBySiteUrl: function( siteUrl ) {
		return !! ( this.getSubscription( siteUrl ) );
	},

	getSubscriptions: function() {
		return subscriptions;
	},

	getSubscription: function( siteUrl ) {
		const comparableUrl = prepareComparableUrl( siteUrl );
		return subscriptions.list.find( function( subscription ) {
			return ( subscription.get( 'comparableUrl' ) === comparableUrl && subscription.get( 'state' ) === States.SUBSCRIBED );
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
		return findLast( errors, { URL: prepareSiteUrl( siteUrl ) } );
	},

	removeErrorsForSiteUrl: function( siteUrl ) {
		const newErrors = reject( errors, { URL: prepareSiteUrl( siteUrl ) } );

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

function _acceptSubscription( subscription, addToTop = true ) {
	let subs = subscriptions.list;
	const existingIndex = subs.findIndex( value => value.get( 'comparableUrl' ) === subscription.get( 'comparableUrl' ) );
	if ( existingIndex !== -1 ) {
		// update the existing subscription by merging together
		subs = subs.mergeIn( [ existingIndex ], subscription );
		if ( subs !== subscriptions.list ) {
			subscriptions.list = subs;
			return true;
		}
		return false;
	}

	// new subscription
	subscriptions.list = subs[ addToTop ? 'unshift' : 'push' ]( subscription );
	return true;
}

function addSubscription( subscription, addToTop = true ) {
	if ( ! subscription || ! subscription.URL ) {
		return;
	}

	// Is this URL already in the subscription list (in any state, not just SUBSCRIBED)?
	const preparedSiteUrl = prepareSiteUrl( subscription.URL );
	const comparableUrl = prepareComparableUrl( subscription.URL );
	const existingSubscription = subscriptions.list.find( function( sub ) {
		return sub.get( 'comparableUrl' ) === comparableUrl;
	} );

	if ( existingSubscription ) {
		return updateSubscription( preparedSiteUrl, subscriptionTemplate );
	}

	// Otherwise, create a new subscription
	subscription.URL = preparedSiteUrl;
	subscription.comparableUrl = comparableUrl;
	const newSubscription = subscriptionTemplate.merge( subscription );
	_acceptSubscription( newSubscription, addToTop );
	subscriptions.count++;
	totalSubscriptions++;

	return true;
}

// Update an existing subscription with new information
function updateSubscription( url, newSubscriptionInfo ) {
	if ( ! url || ! newSubscriptionInfo ) {
		return;
	}

	const comparableUrl = prepareComparableUrl( url );
	const subscriptionIndex = subscriptions.list.findIndex( function( item ) {
		return item.get( 'comparableUrl' ) === comparableUrl;
	} );

	if ( subscriptionIndex === -1 ) {
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
		newSubscriptionInfo = newSubscriptionInfo
			.set( 'URL', prepareSiteUrl( newSubscriptionInfoUrl ) )
			.set( 'comparableUrl', prepareComparableUrl( newSubscriptionInfoUrl ) );
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
	const action = payload.action;

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
