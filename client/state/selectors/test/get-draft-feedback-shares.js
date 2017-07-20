/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getDraftFeedbackShares } from '../';

describe( 'getDraftFeedbackShares()', () => {
	const state = {
		draftFeedback: {
			site1: {
				post1: {
					emails: [
						'no-share-state@example.com',
						'enabled-without-comments@example.com',
						'enabled-with-comments@example.com',
						'disabled-without-comments@example.com',
						'disabled-with-comments@example.com',
					],
					shares: {
						'enabled-without-comments@example.com': {
							isEnabled: true,
							comments: [],
						},
						'enabled-with-comments@example.com': {
							isEnabled: true,
							comments: [ 'comment1', 'comment2', 'comment3' ],
						},
						'disabled-without-comments@example.com': {
							isEnabled: false,
							comments: [],
						},
						'disabled-with-comments@example.com': {
							isEnabled: false,
							comments: [ 'comment1', 'comment2', 'comment3' ],
						},
					},
				},
			},
		},
	};

	it( 'returns draft feedback shares', () => {
		const shares = getDraftFeedbackShares( state, 'site1', 'post1' );
		expect( shares ).to.eql( [
			{
				emailAddress: 'no-share-state@example.com',
				isEnabled: true,
				comments: [],
			},
			{
				emailAddress: 'enabled-without-comments@example.com',
				isEnabled: true,
				comments: [],
			},
			{
				emailAddress: 'enabled-with-comments@example.com',
				isEnabled: true,
				comments: [ 'comment1', 'comment2', 'comment3' ],
			},
			{
				emailAddress: 'disabled-without-comments@example.com',
				isEnabled: false,
				comments: [],
			},
			{
				emailAddress: 'disabled-with-comments@example.com',
				isEnabled: false,
				comments: [ 'comment1', 'comment2', 'comment3' ],
			},
		] );
	} );

	it( 'returns an empty array for non-existent feedback state', () => {
		const shares = getDraftFeedbackShares( state, 'non-existent-site', 'non-existent-post' );
		expect( shares ).to.be.an( 'array' ).that.is.empty;
	} );
} );
