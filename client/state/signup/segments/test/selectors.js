/** @format */

/**
 * Internal dependencies
 */
import { getSegments, getSegmentBySlug } from '../selectors';

describe( 'state/signup/segments/selectors', () => {
	const state = {
		signup: {
			segments: [
				{
					a: 1,
					slug: 'aaa',
				},
				{
					b: 2,
					slug: 'bbb',
				},
			],
		},
	};
	describe( 'getSegments()', () => {
		test( 'should default to null.', () => {
			expect( getSegments( {}, 'aaa' ) ).toBeNull();
		} );

		test( 'should return the stored segments data.', () => {
			expect( getSegments( state ) ).toEqual( state.signup.segments );
		} );

		test( 'should return merged segments data.', () => {
			const segmentDefinitions = {
				aaa: {
					title: 'a_a',
				},
				bbb: {
					title: 'b_b',
				},
				ccc: {
					title: 'c_c',
				}
			};
			expect( getSegments( state, segmentDefinitions ) ).toEqual( [
				{
					a: 1,
					slug: 'aaa',
					title: 'a_a',
				},
				{
					b: 2,
					slug: 'bbb',
					title: 'b_b',
				},
			] );
		} );
	} );

	describe( 'getSegmentBySlug()', () => {
		test( 'should default to undefined.', () => {
			expect( getSegmentBySlug( state, 'ccc' ) ).not.toBeDefined();
		} );

		test( 'should return collection object.', () => {
			expect( getSegmentBySlug( state, 'aaa' ) ).toEqual( state.signup.segments[ 0 ] );
		} );
	} );
} );
