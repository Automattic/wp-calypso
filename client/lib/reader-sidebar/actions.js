
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' ),
	RECEIVE_TEAMS = require( 'lib/reader-teams/constants' ).action.RECEIVE_TEAMS;

var isFetching = false;

module.exports = {

	fetch: function() {
		if ( isFetching ) {
			return;
		}

		let batch = wpcom.batch();

		batch.add( '/read/tags' );
		batch.add( '/read/lists' );
		batch.add( '/read/teams' );

		isFetching = true;

		batch.run( { apiVersion: '1.2' }, function( error, data ) {
			if ( error ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_READER_TAG_SUBSCRIPTIONS',
					data: null,
					error: error
				} );

				Dispatcher.handleServerAction( {
					type: 'RECEIVE_READER_LISTS',
					data: null,
					error: error
				} );

				Dispatcher.handleServerAction( {
					type: RECEIVE_TEAMS,
					data: null,
					error: error
				} );

				return;
			}

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_READER_TAG_SUBSCRIPTIONS',
				data: data[ '/read/tags' ],
				error: error
			} );

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_READER_LISTS',
				data: data[ '/read/lists' ],
				error: error
			} );

			Dispatcher.handleServerAction( {
				type: RECEIVE_TEAMS,
				data: data[ '/read/teams' ],
				error: error
			} );

			// have to set this after we dispatch, otherwise we may try to fetch again as a result of the dispatch.
			isFetching = false;
		} );
	}
};
