// Reader Feed Subscription Store

// External dependencies
import { List, Map, fromJS } from 'immutable';
import debugModule from 'debug';
import get from 'lodash/object/get';
import map from 'lodash/collection/map';

// Internal dependencies
import { action as actionTypes, state as stateTypes, error as errorTypes } from './constants';
import { action as postStoreActionTypes } from 'lib/feed-post-store/constants';
import { createReducerStore } from 'lib/store';
import FeedSubscriptionHelper from './helper';

const debug = debugModule( 'calypso:reader-feed-subs' ); //eslint-disable-line no-unused-vars

const initialState = fromJS( {
	subscriptions: [],
	errors: [],
	perPage: 50,
	currentPage: 0,
	isLastPage: false,
	isFetching: false,
	subscriptionCount: 0,
} );

const subscriptionTemplate = Map( { // eslint-disable-line new-cap
	state: stateTypes.SUBSCRIBED
} );

const FeedSubscriptionStore = createReducerStore( ( state, payload ) => {
	switch ( payload.action.type ) {
		case actionTypes.FOLLOW_READER_FEED:
			return addSubscription( state, payload.action.data );

		case actionTypes.UNFOLLOW_READER_FEED:
			return removeSubscription( state, payload.action.data );

		case actionTypes.RECEIVE_FOLLOW_READER_FEED:
			return receiveFollowResponse( state, payload.action );

		case actionTypes.RECEIVE_FOLLOW_READER_FEED_ERROR:
			return receiveFollowError( state, payload.action );

		case actionTypes.DISMISS_FOLLOW_ERROR:
			return removeErrorsForSiteUrl( state, payload.action.URL );

		case postStoreActionTypes.RECEIVE_FEED_POST:
			if ( payload.action.data && ! payload.action.data.errors ) {
				return receivePost( state, payload.action.data );
			}

		case actionTypes.RECEIVE_FEED_SUBSCRIPTIONS:
			if ( payload.action.data && ! payload.action.data.errors ) {
				return receiveSubscriptions( state, payload.action.data );
			}

		case actionTypes.RESET_FEED_SUBSCRIPTIONS_STATE:
			return initialState;
	}

	return state;
}, initialState );

FeedSubscriptionStore.getSubscriptions = () => FeedSubscriptionStore.get().get( 'subscriptions' );
FeedSubscriptionStore.isFetching = () => FeedSubscriptionStore.get().get( 'isFetching' );
FeedSubscriptionStore.getSubscriptionCount = () => FeedSubscriptionStore.get().get( 'subscriptionCount' );
FeedSubscriptionStore.isLastPage = () => FeedSubscriptionStore.get().get( 'isLastPage' );
FeedSubscriptionStore.getCurrentPage = () => FeedSubscriptionStore.get().get( 'currentPage' );

FeedSubscriptionStore.clearSubscriptions = () => FeedSubscriptionStore.get().set( 'subscriptions', [] );

FeedSubscriptionStore.getLastError = function( key, value ) {
	const state = FeedSubscriptionStore.get();
	let preparedValue = value;
	if ( key === 'URL' ) {
		preparedValue = FeedSubscriptionHelper.prepareSiteUrl( value );
	}

	return state.get( 'errors' ).reverse().find( function( error ) {
		return ( error.get( key ) === preparedValue );
	} );
};

FeedSubscriptionStore.getLastErrorBySiteUrl = function( siteUrl ) {
	return FeedSubscriptionStore.getLastError( 'URL', siteUrl );
};

FeedSubscriptionStore.setPerPage = function( perPage ) {
	const state = FeedSubscriptionStore.get();
	return state.set( 'perPage', +perPage );
};

FeedSubscriptionStore.getSubscription = function( key, value ) {
	const state = FeedSubscriptionStore.get();

	let preparedValue = value;
	if ( key === 'URL' ) {
		preparedValue = FeedSubscriptionHelper.prepareSiteUrl( value );
	}

	return state.get( 'subscriptions' ).find( function( subscription ) {
		return ( subscription.get( key ) === preparedValue && subscription.get( 'state' ) === stateTypes.SUBSCRIBED );
	} );
};

FeedSubscriptionStore.getSubscriptionIndex = function( key, value ) {
	const state = FeedSubscriptionStore.get();

	let preparedValue = value;
	if ( key === 'URL' ) {
		preparedValue = FeedSubscriptionHelper.prepareSiteUrl( value );
	}

	const index = state.get( 'subscriptions' ).findIndex( function( subscription ) {
		return ( subscription.get( key ) === preparedValue );
	} );

	return index >= 0 ? index : null;
};

FeedSubscriptionStore.getIsFollowing = function( key, value ) {
	return !! ( this.getSubscription( key, value ) );
};

// Added for backwards compatibility
FeedSubscriptionStore.getIsFollowingBySiteUrl = function( url ) {
	return FeedSubscriptionStore.getIsFollowing( 'URL', url );
};

function addSubscription( state, subscription ) {
	if ( ! subscription ) {
		return;
	}

	const newSubscriptionInfo = fromJS( subscription );

	// Is this URL already in the subscription list (in any state, not just SUBSCRIBED)?
	const subscriptionKey = chooseBestSubscriptionKey( subscription );
	const existingSubscriptionIndex = FeedSubscriptionStore.getSubscriptionIndex( subscriptionKey, newSubscriptionInfo.get( subscriptionKey ) );
	if ( Number.isInteger( existingSubscriptionIndex ) ) {
		return updateSubscription( state, subscriptionTemplate.merge( subscription ) );
	}

	// Prepare URL, if we have one
	if ( subscription.URL ) {
		subscription.URL = FeedSubscriptionHelper.prepareSiteUrl( subscription.URL );
	}

	// Otherwise, create a new subscription
	const newSubscription = subscriptionTemplate.merge( subscription );
	const subscriptions = state.get( 'subscriptions' ).unshift( newSubscription );
	let subscriptionCount = state.get( 'subscriptionCount' );
	subscriptionCount++;

	return state.set( 'subscriptions', subscriptions ).set( 'subscriptionCount', subscriptionCount );
}

// Update an existing subscription with new information
function updateSubscription( state, newSubscriptionInfo ) {
	if ( ! newSubscriptionInfo ) {
		return state;
	}

	// Prepare URL, if we have one
	if ( newSubscriptionInfo.URL ) {
		newSubscriptionInfo.URL = FeedSubscriptionHelper.prepareSiteUrl( newSubscriptionInfo.URL );
	}

	const subscriptionKey = chooseBestSubscriptionKey( newSubscriptionInfo );
	const existingSubscriptionIndex = FeedSubscriptionStore.getSubscriptionIndex( subscriptionKey, newSubscriptionInfo.get( subscriptionKey ) );
	const existingSubscription = state.get( 'subscriptions' ).get( +existingSubscriptionIndex );
	if ( ! existingSubscription ) {
		return state;
	}

	// If it's a refollow (i.e. the store has handled an unsubscribe for this feed already), add is_refollow flag to the updated subscription object
	if ( existingSubscription.get( 'state' ) === stateTypes.UNSUBSCRIBED && typeof newSubscriptionInfo.get === 'function' && newSubscriptionInfo.get( 'state' ) === stateTypes.SUBSCRIBED ) {
		newSubscriptionInfo = newSubscriptionInfo.merge( { is_refollow: true } );
	}

	const updatedSubscription = existingSubscription.merge( newSubscriptionInfo );
	const updatedSubscriptionsList = state.get( 'subscriptions' ).setIn( [ existingSubscriptionIndex ], updatedSubscription );

	let subscriptionCount = state.get( 'subscriptionCount' );
	if ( subscriptionCount > 0 && existingSubscription.get( 'state' ) === stateTypes.UNSUBSCRIBED && updatedSubscription.get( 'state' ) === stateTypes.SUBSCRIBED ) {
		subscriptionCount++;
	}

	if ( subscriptionCount > 0 && existingSubscription.get( 'state' ) === stateTypes.SUBSCRIBED && updatedSubscription.get( 'state' ) === stateTypes.UNSUBSCRIBED ) {
		subscriptionCount--;
	}

	return state.set( 'subscriptions', updatedSubscriptionsList ).set( 'subscriptionCount', subscriptionCount );
}

function removeSubscription( state, subscription ) {
	if ( ! subscription ) {
		return;
	}

	const newSubscriptionInfo = fromJS( subscription ).merge( { state: stateTypes.UNSUBSCRIBED } );

	return updateSubscription( state, newSubscriptionInfo );
}

function chooseBestSubscriptionKey( subscription ) {
	// Subscription ID is the most reliable
	if ( subscription.ID && subscription.ID > 0 ) {
		return 'ID';
	}

	return 'URL';
}

function receiveFollowResponse( state, action ) {
	var updatedSubscriptionInfo;

	if ( action.data && action.data.subscribed && ! action.data.info ) {
		// The follow worked - discard any existing errors for this site
		state = removeErrorsForSiteUrl( state, action.data.URL );

		// Remove the placeholder subscription and add the full subscription info
		if ( action.data.subscription ) {
			updatedSubscriptionInfo = action.data.subscription;
			updatedSubscriptionInfo.state = stateTypes.SUBSCRIBED;

			return updateSubscription( state, fromJS( updatedSubscriptionInfo ) );

			// @todo another other way to do this?
			//FeedSubscriptionStore.emit( 'add', FeedSubscriptionStore.getSubscription( updatedSubscriptionInfo ) );
		}
	}

	return state;
}

function receiveFollowError( state, action ) {
	const errorInfo = get( action, 'data.info' );

	let errors = state.get( 'errors' );
	errors = errors.push( fromJS( {
		URL: action.url,
		errorType: errorTypes.UNABLE_TO_FOLLOW,
		info: errorInfo,
		timestamp: Date.now()
	} ) );

	// If the user is already subscribed, we don't want to remove the subscription again
	let stateAfterRemoval = state;
	if ( errorInfo !== 'already_subscribed' ) {
		stateAfterRemoval = removeSubscription( state, { URL: action.url } );
	}

	return stateAfterRemoval.set( 'errors', errors );
}

function removeErrorsForSiteUrl( state, siteUrl ) {
	const preparedUrl = FeedSubscriptionHelper.prepareSiteUrl( siteUrl );
	const updatedErrors = state.get( 'errors' ).filterNot( error => error.get( 'URL' ) === preparedUrl );
	return state.set( 'errors', updatedErrors );
}

function receiveSubscriptions( state, data ) {
	if ( ! data.subscriptions ) {
		return;
	}

	const currentSubscriptions = state.get( 'subscriptions' );
	let subscriptions = null;

	// All subscriptions we receive this way will be 'subscribed', so set the state accordingly
	const subscriptionsWithState = map( data.subscriptions, function( sub ) {
		return subscriptionTemplate.merge( sub );
	} );

	const newSubscriptions = List( subscriptionsWithState ); // eslint-disable-line new-cap

	// Is it the last page?
	let isLastPage = false;
	if ( data.number === 0 ) {
		isLastPage = true;
	}

	// Is it a new page of results?
	let currentPage = state.get( 'currentPage' );
	if ( currentPage > 0 && data.page > currentPage ) {
		subscriptions = currentSubscriptions.concat( newSubscriptions );
	} else {
		// Looks like the first results we've received...
		subscriptions = newSubscriptions;
	}

	// Set the current page
	currentPage = data.page;

	// Set total subscriptions for user on the first page only (we keep track of it in the store after that)
	let subscriptionCount = state.get( 'subscriptionCount' );
	if ( currentPage === 1 ) {
		subscriptionCount = data.total_subscriptions;
	}

	// @todo use withMutations?
	return state.set( 'subscriptions', subscriptions ).set( 'currentPage', currentPage ).set( 'isLastPage', isLastPage ).set( 'subscriptionCount', subscriptionCount );
};

function receivePost( state, post ) {
	if ( ! ( post ) ) {
		return;
	}

	const siteUrl = FeedSubscriptionHelper.prepareSiteUrl( post.site_URL );

	if ( ( post.is_following ) && ! FeedSubscriptionStore.getIsFollowing( 'URL', siteUrl ) ) {
		return addSubscription( state, { URL: siteUrl } );
	}

	return state;
};

export default FeedSubscriptionStore;
