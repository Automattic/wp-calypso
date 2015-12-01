import { assert } from 'chai';
import * as sinon from 'sinon';

import {
	add, remove,
	resetForTesting as reset,
	EVERY_SECOND,
	EVERY_FIVE_SECONDS,
	EVERY_TEN_SECONDS,
	EVERY_THIRTY_SECONDS,
	EVERY_MINUTE
} from '../runner';

const noop = () => null;
const nudgeObject = ( o, value ) => () => ( o.counter += value );

describe( 'Interval Runner', function() {
	before( function() {
		this.clock = sinon.useFakeTimers();
	} );

	after( function() {
		this.clock.restore();
	} );

	beforeEach( function() {
		reset();
	} );

	describe( 'Adding actions', function() {
		it( 'Should return the appropriate id', function() {
			const o = { counter: 0 };
			const id = add( EVERY_SECOND, nudgeObject( o, 42 ) );

			assert( 1 === id );
			assert( 0 === o.counter );

			this.clock.tick( 1000 );
			assert( 42 === o.counter );
		} );

		it( 'Should increment the next id after adding an action', function() {
			[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach( () => add( EVERY_SECOND, noop ) );

			assert( 10 === add( EVERY_FIVE_SECONDS, noop ) );
		} );

		it( 'Should add an action to the proper slot', function() {
			const o = { counter: 0 };
			add( EVERY_TEN_SECONDS, nudgeObject( o, 42 ) );

			// plus 1 second
			this.clock.tick( 1000 );
			assert( 0 === o.counter );

			// plus 5 seconds
			this.clock.tick( 1000 * 4 );
			assert( 0 === o.counter );

			// plus 10 seconds
			this.clock.tick( 1000 * 5 );
			assert( 42 === o.counter );
		} );

		it( 'Should add two actions of the same interval to the same slot', function() {
			const o = { counter: 0 };

			add( EVERY_TEN_SECONDS, nudgeObject( o, 3 ) );
			add( EVERY_FIVE_SECONDS, nudgeObject( o, 5 ) );
			add( EVERY_TEN_SECONDS, nudgeObject( o, 7 ) );

			assert( 0 === o.counter );

			// plus 5 seconds
			this.clock.tick( 1000 * 5 );
			assert( 5 === o.counter );

			// plus 10 seconds
			this.clock.tick( 1000 * 5 );
			assert( 5 + 5 + 3 + 7 === o.counter );
		} );
	} );

	describe( 'Removing actions', function() {
		it( 'Should remove an action by id', function() {
			const o = { counter: 0 };
			const id = add( EVERY_SECOND, nudgeObject( o, 42 ) );

			this.clock.tick( 1000 );
			assert( 42 === o.counter );

			remove( id );
			this.clock.tick( 1000 );
			assert( 42 === o.counter );
		} );

		it( 'Should not decrement the next id after removing an action', function() {
			add( EVERY_SECOND, noop );
			add( EVERY_FIVE_SECONDS, noop );

			const id = add( EVERY_TEN_SECONDS, noop );
			remove( id );

			assert( 4 === add( EVERY_THIRTY_SECONDS, noop ) );
		} );
	} );

	describe( 'Running actions', function() {
		it( 'Should run all actions for a given period when called', function() {
			const o = { counter: 0 };

			add( EVERY_SECOND, nudgeObject( o, 3 ) );
			add( EVERY_SECOND, nudgeObject( o, 5 ) );

			this.clock.tick( 1000 );

			assert( 3 + 5 === o.counter );
		} );

		it( 'Should only execute actions for the given period', function() {
			const o = { counter: 0 };

			add( EVERY_SECOND, nudgeObject( o, 3 ) );
			add( EVERY_MINUTE, nudgeObject( o, 5 ) );

			// plus 1 second
			this.clock.tick( 1000 );
			assert( 3 === o.counter );

			// plus 1 minute
			this.clock.tick( 1000 * 59 );
			assert( 3 * 60 + 5 === o.counter );
		} );

		it( 'Should only execute actions that remain after removal', function() {
			const o = { counter: 0 };

			const id = add( EVERY_SECOND, nudgeObject( o, 3 ) );

			this.clock.tick( 1000 );
			assert( 3 === o.counter );

			this.clock.tick( 1000 );
			assert( 6 === o.counter );

			remove( id );
			this.clock.tick( 1000 );
			assert( 6 === o.counter );
		} );
	} );
} );
