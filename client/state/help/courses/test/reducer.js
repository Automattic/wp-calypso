/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { HELP_COURSES_RECEIVE } from 'state/action-types';
import reducer, { items } from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items' ] );
	} );

	describe( '#items()', () => {
		it( 'should default to null', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( null );
		} );

		it( 'should store the items received', () => {
			const courses = deepFreeze( [
				{
					title: 'title',
					description: 'description',
					schedule: [],
					videos: [],
				},
			] );

			const state = items(
				{},
				{
					type: HELP_COURSES_RECEIVE,
					courses,
				}
			);

			expect( state ).to.eql( courses );
		} );
	} );
} );
