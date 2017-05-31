/**
 * External dependencies
 */
import { assert } from 'chai';
/**
 * Internal dependencies
 */
import { calculateDelta } from '../utils';

describe( 'calculateDelta', () => {
	it( 'should return a correctly formed object', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 50 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.isObject( delta );
		assert.isString( delta.value );
		assert.isString( delta.since );
		assert.isArray( delta.classes );
	} );

	it( 'should return correct values', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 50, labelDay: 'a fortnight' };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.equal( delta.value, '50%' );
		assert.equal( delta.since, 'since a fortnight' );
		assert.include( delta.classes, 'is-favorable' );
		assert.include( delta.classes, 'is-increase' );
	} );

	it( 'should return correct sign and direction', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 100 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.include( delta.classes, 'is-unfavorable' );
		assert.include( delta.classes, 'is-decrease' );
		assert.lengthOf( delta.classes, 2 );
	} );

	it( 'should return correct sign and direction for properties where less is good', () => {
		const item = { total_refund: 75 };
		const previousItem = { total_refund: 100 };
		const delta = calculateDelta( item, previousItem, 'total_refund', 'day' );
		assert.include( delta.classes, 'is-favorable' );
		assert.include( delta.classes, 'is-decrease' );
		assert.lengthOf( delta.classes, 2 );
	} );

	it( 'should return correct sign and direction for value of 0', () => {
		const item = { doodads: 100 };
		const previousItem = { doodads: 100 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.include( delta.classes, 'is-neutral' );
		assert.lengthOf( delta.classes, 1 );
	} );
} );
