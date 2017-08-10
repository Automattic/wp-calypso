/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { HELP_COURSES_RECEIVE } from 'state/action-types';
import { receiveHelpCourses } from '../actions';

describe( 'actions', () => {
	const sampleCourseList = [
		{
			title: 'title',
			description: 'description',
			schedule: [],
			videos: [],
		},
	];

	describe( '#receiveHelpCourses()', () => {
		it( 'should return an action object', () => {
			const action = receiveHelpCourses( sampleCourseList );

			expect( action ).to.eql( {
				type: HELP_COURSES_RECEIVE,
				courses: sampleCourseList,
			} );
		} );
	} );
} );
