/**
 * External Dependencies
 */
import { assert } from 'chai';

/**
 * Internal Dependencies
 */
import { calcPuckSize, calcPuckOffset } from '../helpers/dimensions';

describe( 'scroll-container helpers', () => {
	describe( 'calcPuckSize', () => {
		it( 'should return a minimum size of zero', () => {
			const size = calcPuckSize( -100, 1, 0 );
			assert.isAtLeast( size, 0 );
		} );

		it( 'should return a maximum size of the total visible size', () => {
			const size = calcPuckSize( 100, 99, 0 );
			assert.isAtMost( size, 100 );
		} );

		// eslint-disable-next-line max-len
		it( 'should ensure that the porpotion of visible space to puck size is the same as the proportion of visible space to total space', () => {
			const visibleSpace = 100;
			const totalSpace = 1000;
			const size = calcPuckSize( visibleSpace, totalSpace, 0 );
			assert.strictEqual( size, 10 );
		} );

		it( "should remove the track's margin from the visible space when accounting for the puck size", () => {
			const visibleSpace = 104;
			const totalSpace = 1000;
			const size = calcPuckSize( visibleSpace, totalSpace, 2 );
			assert.strictEqual( size, 10 );
		} );
	} );

	describe( 'calcPuckOffset', () => {
		it( 'should return a minimum offset of zero', () => {
			const offset = calcPuckOffset( -100, 1, -100, 0 );
			assert.isAtLeast( offset, 0 );
		} );

		it( 'should return a maximum offset of the visible size minus the puck size', () => {
			const visibleSpace = 10;
			const totalSpace = 100;
			const scrollAmount = 100;
			const size = calcPuckSize( visibleSpace, totalSpace, 0 );
			const offset = calcPuckOffset( visibleSpace, totalSpace, scrollAmount, 0 );
			assert.isAtMost( offset, visibleSpace - size );
		} );

		it( 'should return an offset that is proportional to the amound scrolled', () => {
			const visibleSpace = 100;
			const totalSpace = 1000;
			const scrollAmount = 250;
			const offset = calcPuckOffset( visibleSpace, totalSpace, scrollAmount, 0 );
			assert.strictEqual( offset, 25 );
		} );

		it( "should remove the track's margin from the visible space when accounting for the puck offset", () => {
			const visibleSpace = 100;
			const totalSpace = 1000;
			const scrollAmount = 250;
			const offset = calcPuckOffset( visibleSpace, totalSpace, scrollAmount, 5 );
			assert.strictEqual( offset, 23 );
		} );
	} );
} );
