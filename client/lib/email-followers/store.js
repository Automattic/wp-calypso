/** @format */

/**
 * External dependencies
 */

import { omit } from 'lodash';
import deterministicStringify from 'json-stable-stringify';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:email-followers-store' );

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';

const _fetchingFollowersByNamespace = {}, // store fetching state (boolean)
	_followersBySite = {}, // store user objects
	_totalFollowersByNamespace = {}, // store total found for params
	_followersFetchedByNamespace = {}, // store fetch progress
	_pageByNamespace = {}, // store fetch progress
	_followerIDsByNamespace = {}, // store user order
	_removingFromSite = {};

const EmailFollowersStore = {
	// This data may help with infinite scrolling
	getPaginationData: function( fetchOptions ) {
		const namespace = getNamespace( fetchOptions );
		debug( 'getPaginationData:', namespace );
		return {
			fetchInitialized: _followersFetchedByNamespace.hasOwnProperty( namespace ),
			totalFollowers: _totalFollowersByNamespace[ namespace ] || 0,
			fetchingFollowers: _fetchingFollowersByNamespace[ namespace ] || false,
			followersCurrentPage: _pageByNamespace[ namespace ],
			numFollowersFetched: _followersFetchedByNamespace[ namespace ],
			fetchNameSpace: namespace,
		};
	},

	isRemoving: function( siteId ) {
		return _removingFromSite[ siteId ];
	},

	getFollowers: function( fetchOptions ) {
		const namespace = getNamespace( fetchOptions ),
			siteId = fetchOptions.siteId,
			followers = [];

		debug( 'getFollowers:', namespace );

		if ( ! _followersBySite[ siteId ] ) {
			_followersBySite[ siteId ] = {};
		}
		if ( ! _followerIDsByNamespace[ namespace ] ) {
			return false;
		}
		_followerIDsByNamespace[ namespace ].forEach( followerId => {
			if ( _followersBySite[ siteId ][ followerId ] ) {
				followers.push( _followersBySite[ siteId ][ followerId ] );
			}
		} );
		return followers;
	},

	emitChange: function() {
		this.emit( 'change' );
	},
};

function updateFollower( siteId, id, follower ) {
	if ( ! _followersBySite[ siteId ] ) {
		_followersBySite[ siteId ] = {};
	}
	if ( ! _followersBySite[ siteId ][ id ] ) {
		_followersBySite[ siteId ][ id ] = {};
	}

	// TODO: follower = FollowerUtils.normalizeFollower( follower );
	follower.avatar_URL = follower.avatar;
	_followersBySite[ siteId ][ id ] = Object.assign(
		{},
		_followersBySite[ siteId ][ id ],
		follower
	);
}

function updateFollowers( fetchOptions, followers, total ) {
	const namespace = getNamespace( fetchOptions ),
		page = fetchOptions.page;

	debug( 'updateFollowers:', namespace );

	// reset the order
	if ( ! page || page === 1 ) {
		_followerIDsByNamespace[ namespace ] = new Set();
	}

	followers.forEach( function( follower ) {
		_followerIDsByNamespace[ namespace ].add( follower.ID );
		updateFollower( fetchOptions.siteId, follower.ID, follower );
	} );

	_totalFollowersByNamespace[ namespace ] = total;
	_pageByNamespace[ namespace ] = page;
	_followersFetchedByNamespace[ namespace ] = _followerIDsByNamespace[ namespace ].size;
}

function getNamespace( fetchOptions ) {
	return deterministicStringify( omit( fetchOptions, [ 'page', 'max' ] ) );
}

function decrementPaginationData( siteId, followerId ) {
	Object.keys( _followerIDsByNamespace ).forEach( function( namespace ) {
		if (
			namespace.indexOf( 'siteId=' + siteId + '&' ) !== -1 &&
			_followerIDsByNamespace[ namespace ].has( followerId )
		) {
			_totalFollowersByNamespace[ namespace ]--;
			_followersFetchedByNamespace[ namespace ]--;
			_pageByNamespace[ namespace ]--;
		}
	} );
}

function incrementPaginationData( siteId, followerId ) {
	Object.keys( _followerIDsByNamespace ).forEach( function( namespace ) {
		if (
			namespace.indexOf( 'siteId=' + siteId + '&' ) !== -1 &&
			_followerIDsByNamespace[ namespace ].has( followerId )
		) {
			_totalFollowersByNamespace[ namespace ]++;
			_followersFetchedByNamespace[ namespace ]++;
			_pageByNamespace[ namespace ]++;
		}
	} );
}

function removeFollowerFromSite( siteId, followerId ) {
	if ( ! _followersBySite[ siteId ] || ! _followersBySite[ siteId ][ followerId ] ) {
		return;
	}
	delete _followersBySite[ siteId ][ followerId ];
	decrementPaginationData( siteId, followerId );
}

function removeFollowerFromNamespaces( siteId, followerId ) {
	Object.keys( _followerIDsByNamespace ).forEach( function( namespace ) {
		if (
			namespace.indexOf( 'siteId=' + siteId + '&' ) !== -1 &&
			_followerIDsByNamespace[ namespace ].has( followerId )
		) {
			delete _followerIDsByNamespace[ namespace ][ followerId ];
		}
	} );
}

EmailFollowersStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;
	let namespace;
	debug( 'register event Type', action.type, payload );

	switch ( action.type ) {
		case 'FETCHING_EMAIL_FOLLOWERS':
			namespace = getNamespace( action.fetchOptions );
			_fetchingFollowersByNamespace[ namespace ] = true;
			EmailFollowersStore.emitChange();
			break;
		case 'RECEIVE_EMAIL_FOLLOWERS':
			namespace = getNamespace( action.fetchOptions );
			_fetchingFollowersByNamespace[ namespace ] = false;
			if ( ! action.error ) {
				updateFollowers( action.fetchOptions, action.data.subscribers, action.data.total_email );
				EmailFollowersStore.emitChange();
			}
			break;
		case 'REMOVE_EMAIL_FOLLOWER':
			_removingFromSite[ action.siteId ] = true;
			removeFollowerFromSite( action.siteId, action.follower.ID );
			EmailFollowersStore.emitChange();
			break;
		case 'RECEIVE_REMOVE_EMAIL_FOLLOWER_SUCCESS':
			_removingFromSite[ action.siteId ] = false;
			removeFollowerFromNamespaces( action.siteId, action.follower.ID );
			EmailFollowersStore.emitChange();
			break;
		case 'RECEIVE_REMOVE_EMAIL_FOLLOWER_ERROR':
			_removingFromSite[ action.siteId ] = false;
			updateFollower( action.siteId, action.follower.ID, action.follower );
			incrementPaginationData( action.siteId, action.follower.ID );
			EmailFollowersStore.emitChange();
			break;
	}
} );

emitter( EmailFollowersStore );

export default EmailFollowersStore;
