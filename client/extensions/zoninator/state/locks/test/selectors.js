/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getLock } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123;
	const primaryZoneId = 456;
	const secondarySiteId = 789;
	const secondaryZoneId = 987;

	describe( 'items()', () => {
		const primaryLock = {
			user: 'TestUser',
			time: new Date(),
		};

		const state = {
			extensions: {
				zoninator: {
					locks: {
						items: {
							[ primarySiteId ]: {
								[ primaryZoneId ]: primaryLock,
							},
						},
					},
				},
			},
		};

		test( 'should return null if no state exists', () => {
			const emptyState = {
				extensions: {
					zoninator: {
						locks: undefined,
					},
				},
			};

			const lock = getLock( emptyState, primarySiteId, primaryZoneId );

			expect( lock ).to.deep.equal( null );
		} );

		test( 'should return null if no state is attached for the given site ID', () => {
			const lock = getLock( state, secondarySiteId, primaryZoneId );

			expect( lock ).to.deep.equal( null );
		} );

		test( 'should return null if no state is attached for the given zone ID', () => {
			const lock = getLock( state, primarySiteId, secondaryZoneId );

			expect( lock ).to.deep.equal( null );
		} );

		test( 'should return a lock for the given site and zone IDs', () => {
			const lock = getLock( state, primarySiteId, primaryZoneId );

			expect( lock ).to.deep.equal( primaryLock );
		} );
	} );
} );
