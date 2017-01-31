
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' );

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

				return;
			}

			function checkForBatchErrorAndDispatch( actionType, key ) {
				let response = data[ key ];
				let batchError = undefined;

				if ( response && response.errors ) {
					batchError = response.errors;
					response = undefined;
				}

				Dispatcher.handleServerAction( {
					type: actionType,
					data: response,
					error: batchError
				} );
			}

			checkForBatchErrorAndDispatch( 'RECEIVE_READER_TAG_SUBSCRIPTIONS', '/read/tags' );
			checkForBatchErrorAndDispatch( 'RECEIVE_READER_LISTS', '/read/lists' );
			// have to set this after we dispatch, otherwise we may try to fetch again as a result of the dispatch.
			isFetching = false;
		} );
	}
};
