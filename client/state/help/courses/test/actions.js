import { expect } from 'chai';
import { HELP_COURSES_RECEIVE } from 'calypso/state/action-types';
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
		test( 'should return an action object', () => {
			const action = receiveHelpCourses( sampleCourseList );

			expect( action ).to.eql( {
				type: HELP_COURSES_RECEIVE,
				courses: sampleCourseList,
			} );
		} );
	} );
} );
