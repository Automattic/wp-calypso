/** @format */

/**
 * Internal dependencies
 */
import { getSegments, getSegmentBySlug, getSegmentById } from '../selectors';

describe( 'state/signup/segments/selectors', () => {
	const state = {
		signup: {
			segments: [
				{
					a: 1,
					slug: 'aaa',
					id: 1,
				},
				{
					b: 2,
					slug: 'bbb',
					id: 2,
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
				},
			};
			const expected = state.signup.segments.map( item => ( {
				...item,
				...segmentDefinitions[ item.slug ],
			} ) );
			expect( getSegments( state, segmentDefinitions ) ).toEqual( expected );
		} );
	} );

	describe( 'getSegmentBySlug()', () => {
		test( 'should default to an empty object.', () => {
			expect( getSegmentBySlug( state, 'ccc' ) ).toEqual( {} );
		} );

		test( 'should return collection object by slug', () => {
			expect( getSegmentBySlug( state, 'aaa' ) ).toEqual( state.signup.segments[ 0 ] );
		} );
	} );

	describe( 'getSegmentById()', () => {
		test( 'should default to an empty object.', () => {
			expect( getSegmentById( state, 3 ) ).toEqual( {} );
		} );

		test( 'should return collection object by id', () => {
			expect( getSegmentById( state, 1 ) ).toEqual( state.signup.segments[ 0 ] );
		} );
	} );
} );
