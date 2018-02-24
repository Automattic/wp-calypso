/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingPostRevisions } from 'state/selectors';

describe( 'isRequestingPostRevisions()', () => {
	test(
		'should return false if siteId was not specified or the specified siteId was not found' +
			' in the post revisions requesting state',
		() => {
			const state = {
				posts: {
					revisions: {
						requesting: {
							12345: {
								67: true,
							},
						},
					},
				},
			};

			expect( isRequestingPostRevisions( state ) ).to.be.false;
			expect( isRequestingPostRevisions( state, 56789, 67 ) ).to.be.false;
		}
	);

	test(
		'should return false if postId was not specified or the specified postId was not found' +
			' in the post revisions requesting state',
		() => {
			const state = {
				posts: {
					revisions: {
						requesting: {
							12345: {
								67: true,
							},
						},
					},
				},
			};

			expect( isRequestingPostRevisions( state, 12345 ) ).to.be.false;
			expect( isRequestingPostRevisions( state, 12345, 97 ) ).to.be.false;
		}
	);

	test( 'should return false when revisions are not being requested for a specified post', () => {
		const state = {
			posts: {
				revisions: {
					requesting: {
						12345: {
							67: false,
						},
					},
				},
			},
		};

		expect( isRequestingPostRevisions( state, 12345, 67 ) ).to.be.false;
	} );

	test( 'should return true when revisions are being requested for a specified post', () => {
		const state = {
			posts: {
				revisions: {
					requesting: {
						12345: {
							67: true,
						},
					},
				},
			},
		};

		expect( isRequestingPostRevisions( state, 12345, 67 ) ).to.be.true;
	} );
} );
