import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { HELP_COURSES_RECEIVE } from 'calypso/state/action-types';
import reducer, { items } from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to null', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( null );
		} );

		test( 'should store the items received', () => {
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
