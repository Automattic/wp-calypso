require( 'lib/react-test-env-setup' )();

// External dependencies
var expect = require( 'chai' ).expect,
	Dispatcher = require( 'dispatcher' ),
	sinon = require( 'sinon' );

// Internal dependencies
var TeamStore = require( '../index' ),
	ActionTypes = require( '../constants' ).action;

describe( 'team-store', function() {

	it( 'should have a dispatch token', function() {
		expect( TeamStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should not store received teams if there is an error', function() {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_TEAMS,
			data: [ { slug: 'blah' } ],
			error: new Error()
		} );

		var teams = TeamStore.get();
		expect( teams ).to.eq( null );
	} );

	it( 'should store received teams', function() {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_TEAMS,
			data: { teams: [ { slug: 'huskies', title: 'University of Washington' } ] },
			error: null
		} );

		var teams = TeamStore.get();
		expect( teams[ 0 ].slug ).to.eq( 'huskies' );
	} );

	it( 'should know if a recent error has occurred', function() {
		var clock, errorResponse;

		TeamStore._reset();

		// No errors yet
		expect( TeamStore.hasRecentError() ).to.eq( false );

		// Roll back the clock so we can create an error that's 5 minutes old
		clock = sinon.useFakeTimers( Date.now() - ( 5 * 60 * 1000 ) );

		errorResponse = {
			type: ActionTypes.RECEIVE_TEAMS,
			data: [ { slug: 'blah' } ],
			error: new Error()
		};

		Dispatcher.handleServerAction( errorResponse );

		// Restore the correct date
		clock.restore();

		// Old error, created five minutes ago
		expect( TeamStore.hasRecentError() ).to.eq( false );

		Dispatcher.handleServerAction( errorResponse );

		// New error, created just now
		expect( TeamStore.hasRecentError() ).to.eq( true );
	} );
} );
