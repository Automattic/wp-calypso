/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getCommentsProgresses } from 'state/selectors';

const SITE_ID = 12345678;
const PROGRESS_ID = '123-foo-456-bar';

describe( 'getCommentsProgresses()', () => {
	const state = {
		ui: {
			comments: {
				progresses: {
					[ SITE_ID ]: {
						[ PROGRESS_ID ]: {
							count: 0,
							failed: false,
							status: 'approved',
							total: 10,
						},
					},
				},
			},
		},
	};

	test( 'should return an empty object when no progresses are tracked', () => {
		const emptyState = { ui: { comments: { progresses: {} } } };
		const progress = getCommentsProgresses( emptyState, SITE_ID );
		expect( progress ).to.eql( {} );
	} );

	test( 'should return an empty object when the requested site is not tracked', () => {
		const progress = getCommentsProgresses( state, 98765432 );
		expect( progress ).to.eql( {} );
	} );

	test( 'should return a tracked progress', () => {
		const progress = getCommentsProgresses( state, SITE_ID );
		expect( progress ).to.eql( {
			[ PROGRESS_ID ]: {
				count: 0,
				failed: false,
				status: 'approved',
				total: 10,
			},
		} );
	} );
} );
