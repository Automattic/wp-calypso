/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getHelpCourses } from '../selectors';

describe( 'selectors', () => {
	describe( '#getHelpCourses()', () => {
		test( 'should return null for default state', () => {
			const state = deepFreeze( {
				help: {
					courses: {
						items: null,
					},
				},
			} );

			expect( getHelpCourses( state ) ).to.be.null;
		} );

		test( 'should return courses for given state', () => {
			const state = deepFreeze( {
				help: {
					courses: {
						items: [
							{
								title: 'title',
								description: 'description',
								schedule: [],
								videos: [],
							},
						],
					},
				},
			} );

			expect( getHelpCourses( state ) ).to.eql( state.help.courses.items );
		} );
	} );
} );
