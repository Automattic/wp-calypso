// Internal Dependencies
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' ),
	ReaderListsStore = require( 'lib/reader-lists/subscriptions' );

var fetchingLists = {};

var ReaderListActions = {

	fetchSubscriptions: function() {
		if ( ReaderListsStore.isFetching() ) {
			return;
		}

		ReaderListsStore.setIsFetching( true );

		wpcom.undocumented().readLists( function( error, data ) {
			ReaderListsStore.setIsFetching( false );

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_READER_LISTS',
				data: data,
				error: error
			} );
		} );
	},

	follow: function( owner, slug ) {
		var query = { owner, slug };

		Dispatcher.handleViewAction( {
			type: 'FOLLOW_LIST',
			data: query
		} );

		wpcom.undocumented().followList( query, function( error, data ) {
			if ( error || ! ( data && data.following ) ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_FOLLOW_LIST_ERROR',
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
				type: 'RECEIVE_FOLLOW_LIST',
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
			type: 'UNFOLLOW_LIST',
			data: query
		} );

		wpcom.undocumented().unfollowList( query, function( error, data ) {
			if ( error || ( data && data.following ) ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_UNFOLLOW_LIST_ERROR',
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
				type: 'RECEIVE_UNFOLLOW_LIST',
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

		wpcom.undocumented().readList( {
			owner: owner,
			slug: slug
		}, function( error, data ) {
			delete fetchingLists[ key ];

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_READER_LIST',
				data: data,
				error: error
			} );
		} );
	},

	create: function( title ) {
		if ( ! title ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: 'CREATE_READER_LIST',
			data: { title: title }
		} );

		wpcom.undocumented().readListsNew( title, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_CREATE_READER_LIST',
				data: data,
				error: error
			} );
		} );
	}
};

module.exports = ReaderListActions;
