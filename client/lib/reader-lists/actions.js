// External dependencies
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

// Internal dependencies
import ReaderListsStore from 'lib/reader-lists/lists';
import ReaderListsSubscriptionsStore from 'lib/reader-lists/subscriptions';
import { action as actionTypes } from './constants';

var fetchingLists = {};

const ReaderListActions = {

	fetchSubscriptions: function() {
		if ( ReaderListsSubscriptionsStore.isFetching() ) {
			return;
		}

		ReaderListsSubscriptionsStore.setIsFetching( true );

		wpcom.undocumented().readLists( function( error, data ) {
			ReaderListsSubscriptionsStore.setIsFetching( false );

			Dispatcher.handleServerAction( {
				type: actionTypes.RECEIVE_READER_LISTS,
				data: data,
				error: error
			} );
		} );
	},

	follow: function( owner, slug ) {
		var query = { owner, slug };

		Dispatcher.handleViewAction( {
			type: actionTypes.FOLLOW_LIST,
			data: query
		} );

		wpcom.undocumented().followList( query, function( error, data ) {
			if ( error || ! ( data && data.following ) ) {
				Dispatcher.handleServerAction( {
					type: actionTypes.RECEIVE_FOLLOW_LIST_ERROR,
					data: {
						owner: query.owner,
						slug: query.slug,
						error: error,
						following: ( data && data.following )
					}
				} );
				return;
			}

			Dispatcher.handleServerAction( {
				type: actionTypes.RECEIVE_FOLLOW_LIST,
				data: {
					owner: query.owner,
					slug: query.slug,
					title: data.title
				},
				error: error
			} );
		} );
	},

	unfollow: function( owner, slug ) {
		var query = { owner, slug };

		Dispatcher.handleViewAction( {
			type: actionTypes.UNFOLLOW_LIST,
			data: query
		} );

		wpcom.undocumented().unfollowList( query, function( error, data ) {
			if ( error || ( data && data.following ) ) {
				Dispatcher.handleServerAction( {
					type: actionTypes.RECEIVE_UNFOLLOW_LIST_ERROR,
					data: {
						owner: query.owner,
						slug: query.slug,
						error: error,
						following: ( data && data.following )
					}
				} );
				return;
			}

			Dispatcher.handleServerAction( {
				type: actionTypes.RECEIVE_UNFOLLOW_LIST,
				data: {
					owner: query.owner,
					slug: query.slug,
					title: data.title
				},
				error: error
			} );
		} );
	},

	fetchList: function( owner, slug ) {
		const key = owner + '-' + slug;
		if ( fetchingLists[ key ] ) {
			return;
		}

		fetchingLists[ key ] = true;
		ReaderListsStore.setIsFetching( true );

		wpcom.undocumented().readList( {
			owner: owner,
			slug: slug
		}, function( error, data ) {
			delete fetchingLists[ key ];
			ReaderListsStore.setIsFetching( false );

			Dispatcher.handleServerAction( {
				type: actionTypes.RECEIVE_READER_LIST,
				data: data,
				error: error
			} );
		} );
	},

	create: function( title ) {
		if ( ! title ) {
			throw new Error( 'List title is required' );
		}

		Dispatcher.handleViewAction( {
			type: actionTypes.CREATE_READER_LIST,
			data: { title: title }
		} );

		wpcom.undocumented().readListsNew( title, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: actionTypes.RECEIVE_CREATE_READER_LIST,
				data: data,
				error: error
			} );
		} );
	},

	update: function( params ) {
		if ( ! params.owner || ! params.slug || ! params.title ) {
			throw new Error( 'List owner, slug and title are required' );
		}

		Dispatcher.handleViewAction( {
			type: actionTypes.UPDATE_READER_LIST,
			data: params
		} );

		wpcom.undocumented().readListsUpdate( params, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: actionTypes.RECEIVE_UPDATE_READER_LIST,
				data: data,
				error: error
			} );
		} );
	},

	dismissNotice: function( listId ) {
		if ( ! listId ) {
			throw new Error( 'List ID is required' );
		}

		Dispatcher.handleViewAction( {
			type: actionTypes.DISMISS_READER_LIST_NOTICE,
			listId: listId
		} );
	},
};

module.exports = ReaderListActions;
