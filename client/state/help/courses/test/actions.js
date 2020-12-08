/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { receiveHelpCourses } from '../actions';
import { HELP_COURSES_RECEIVE } from 'calypso/state/action-types';

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
		test( 'should return an action object', () => {
			const action = receiveHelpCourses( sampleCourseList );

			expect( action ).to.eql( {
				type: HELP_COURSES_RECEIVE,
				courses: sampleCourseList,
			} );
		} );
	} );
} );
