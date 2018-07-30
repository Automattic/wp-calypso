/** @format */

/**
 * Internal dependencies
 */
import getMostRecentPostComment from 'state/selectors/get-most-recent-post-comment';

describe( 'getMostRecentPostComment()', () => {
	test( 'should return null if there are no comments for the post', () => {
		const prevState = {
			comments: {
				items: {},
			},
		};
		const nextState = getMostRecentPostComment( prevState, 123, 456 );
		expect( nextState ).toEqual( null );
	} );

	test( 'should return the most recent post', () => {
		const prevState = {
			comments: {
				items: {
					'123-456': [
						{ ID: 1, date: '2018-06-30T01:56:28+00:00' },
						{ ID: 2, date: '2018-07-30T01:56:28+00:00' },
					],
				},
			},
		};
		const nextState = getMostRecentPostComment( prevState, 123, 456 );
		expect( nextState ).toEqual( { ID: 2, date: '2018-07-30T01:56:28+00:00' } );
	} );
} );
