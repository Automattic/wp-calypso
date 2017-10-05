/** @format */
/**
 * External dependencies
 */
import * as sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	add,
	remove,
	resetForTesting as reset,
	EVERY_SECOND,
	EVERY_FIVE_SECONDS,
	EVERY_TEN_SECONDS,
	EVERY_THIRTY_SECONDS,
	EVERY_MINUTE,
} from '../runner';

const noop = () => null;
const nudgeObject = ( o, value ) => () => ( o.counter += value );

describe( 'Interval Runner', function() {
	let clock;

	before( function() {
		clock = sinon.useFakeTimers();
	} );

	after( function() {
		clock.restore();
	} );

	beforeEach( function() {
		reset();
	} );

	describe( 'Adding actions', function() {
		it( 'Should return the appropriate id', function() {
			const o = { counter: 0 };
			const id = add( EVERY_SECOND, nudgeObject( o, 42 ) );

			expect( id ).toBe( 1 );
			expect( o.counter ).toBe( 0 );

			clock.tick( 1000 );
			expect( o.counter ).toBe( 42 );
		} );

		it( 'Should increment the next id after adding an action', function() {
			[ 1, 2, 3, 4, 5, 6, 7, 8, 9 ].forEach( () => add( EVERY_SECOND, noop ) );

			expect( add( EVERY_FIVE_SECONDS, noop ) ).toBe( 10 );
		} );

		it( 'Should add an action to the proper slot', function() {
			const o = { counter: 0 };
			add( EVERY_TEN_SECONDS, nudgeObject( o, 42 ) );

			// plus 1 second
			clock.tick( 1000 );
			expect( o.counter ).toBe( 0 );

			// plus 5 seconds
			clock.tick( 1000 * 4 );
			expect( o.counter ).toBe( 0 );

			// plus 10 seconds
			clock.tick( 1000 * 5 );
			expect( o.counter ).toBe( 42 );
		} );

		it( 'Should add two actions of the same interval to the same slot', function() {
			const o = { counter: 0 };

			add( EVERY_TEN_SECONDS, nudgeObject( o, 3 ) );
			add( EVERY_FIVE_SECONDS, nudgeObject( o, 5 ) );
			add( EVERY_TEN_SECONDS, nudgeObject( o, 7 ) );

			expect( o.counter ).toBe( 0 );

			// plus 5 seconds
			clock.tick( 1000 * 5 );
			expect( o.counter ).toBe( 5 );

			// plus 10 seconds
			clock.tick( 1000 * 5 );
			expect( o.counter ).toBe( 5 + 5 + 3 + 7 );
		} );
	} );

	describe( 'Removing actions', function() {
		it( 'Should remove an action by id', function() {
			const o = { counter: 0 };
			const id = add( EVERY_SECOND, nudgeObject( o, 42 ) );

			clock.tick( 1000 );
			expect( o.counter ).toBe( 42 );

			remove( id );
			clock.tick( 1000 );
			expect( o.counter ).toBe( 42 );
		} );

		it( 'Should not decrement the next id after removing an action', function() {
			add( EVERY_SECOND, noop );
			add( EVERY_FIVE_SECONDS, noop );

			const id = add( EVERY_TEN_SECONDS, noop );
			remove( id );

			expect( add( EVERY_THIRTY_SECONDS, noop ) ).toBe( 4 );
		} );
	} );

	describe( 'Running actions', function() {
		it( 'Should run all actions for a given period when called', function() {
			const o = { counter: 0 };

			add( EVERY_SECOND, nudgeObject( o, 3 ) );
			add( EVERY_SECOND, nudgeObject( o, 5 ) );

			clock.tick( 1000 );

			expect( o.counter ).toBe( 3 + 5 );
		} );

		it( 'Should only execute actions for the given period', function() {
			const o = { counter: 0 };

			add( EVERY_SECOND, nudgeObject( o, 3 ) );
			add( EVERY_MINUTE, nudgeObject( o, 5 ) );

			// plus 1 second
			clock.tick( 1000 );
			expect( o.counter ).toBe( 3 );

			// plus 1 minute
			clock.tick( 1000 * 59 );
			expect( o.counter ).toBe( 3 * 60 + 5 );
		} );

		it( 'Should only execute actions that remain after removal', function() {
			const o = { counter: 0 };

			const id = add( EVERY_SECOND, nudgeObject( o, 3 ) );

			clock.tick( 1000 );
			expect( o.counter ).toBe( 3 );

			clock.tick( 1000 );
			expect( o.counter ).toBe( 6 );

			remove( id );
			clock.tick( 1000 );
			expect( o.counter ).toBe( 6 );
		} );
	} );
} );
