// External dependencies
const expect = require( 'chai' ).expect,
	Dispatcher = require( 'dispatcher' );

// Internal dependencies
const TeamStore = require( '../index' ),
	ActionTypes = require( '../constants' ).action,
	useFakeTimers = require( 'test/helpers/use-sinon' ).useFakeTimers;

describe( 'store', function() {
	it( 'should have a dispatch token', function() {
		expect( TeamStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should not store received teams if there is an error', function() {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_TEAMS,
			data: [ { slug: 'blah' } ],
			error: new Error()
		} );

		const teams = TeamStore.get();
		expect( teams ).to.eq( null );
	} );

	it( 'should store received teams', function() {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_TEAMS,
			data: { teams: [ { slug: 'huskies', title: 'University of Washington' } ] },
			error: null
		} );

		const teams = TeamStore.get();
		expect( teams[ 0 ].slug ).to.eq( 'huskies' );
	} );

	context( 'recent errors', function() {
		useFakeTimers( Date.now().valueOf() );

		it( 'should know if a recent error has occurred', function() {
			var errorResponse;

			TeamStore._reset();

			// No errors yet
			expect( TeamStore.hasRecentError() ).to.eq( false );

			// Roll back the clock so we can create an error that's 5 minutes old
			this.clock.tick( -5 * 60 * 1000 );

			errorResponse = {
				type: ActionTypes.RECEIVE_TEAMS,
				data: [ { slug: 'blah' } ],
				error: new Error()
			};

			Dispatcher.handleServerAction( errorResponse );

			// roll the clock back forward
			this.clock.tick( 5 * 60 * 1000 );

			// Old error, created five minutes ago
			expect( TeamStore.hasRecentError() ).to.eq( false );

			Dispatcher.handleServerAction( errorResponse );

			// New error, created just now
			expect( TeamStore.hasRecentError() ).to.eq( true );
		} );
	} );
} );
