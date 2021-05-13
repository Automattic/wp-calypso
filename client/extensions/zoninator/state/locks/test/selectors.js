/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { blocked, created, expires, maxLockPeriod } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123;
	const primaryZoneId = 456;
	const secondarySiteId = 789;
	const secondaryZoneId = 987;

	const emptyState = {
		extensions: {
			zoninator: {
				locks: undefined,
			},
		},
	};

	const state = {
		extensions: {
			zoninator: {
				locks: {
					[ 123 ]: {
						[ 456 ]: {
							blocked: true,
							expires: 1000,
							created: 100,
							maxLockPeriod: 2000,
						},
					},
				},
			},
		},
	};

	describe( 'blocked()', () => {
		test( 'should return false if no state exists', () => {
			const isBlocked = blocked( emptyState, primarySiteId, primaryZoneId );

			expect( isBlocked ).to.deep.equal( false );
		} );

		test( 'should return false if no state is attached for the given site ID', () => {
			const isBlocked = blocked( state, secondarySiteId, primaryZoneId );

			expect( isBlocked ).to.deep.equal( false );
		} );

		test( 'should return false if no state is attached for the given zone ID', () => {
			const isBlocked = blocked( state, primarySiteId, secondaryZoneId );

			expect( isBlocked ).to.deep.equal( false );
		} );

		test( 'should return the blocked status value for the given site and zone IDs', () => {
			const isBlocked = blocked( state, primarySiteId, primaryZoneId );

			expect( isBlocked ).to.deep.equal( true );
		} );
	} );

	describe( 'created()', () => {
		test( 'should return 0 if no state exists', () => {
			const time = created( emptyState, primarySiteId, primaryZoneId );

			expect( time ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given site ID', () => {
			const time = created( state, secondarySiteId, primaryZoneId );

			expect( time ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given zone ID', () => {
			const time = created( state, primarySiteId, secondaryZoneId );

			expect( time ).to.deep.equal( 0 );
		} );

		test( 'should return the time a lock was created for the given site and zone IDs', () => {
			const time = created( state, primarySiteId, primaryZoneId );

			expect( time ).to.deep.equal( 100 );
		} );
	} );

	describe( 'expires()', () => {
		test( 'should return 0 if no state exists', () => {
			const time = expires( emptyState, primarySiteId, primaryZoneId );

			expect( time ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given site ID', () => {
			const time = expires( state, secondarySiteId, primaryZoneId );

			expect( time ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given zone ID', () => {
			const time = expires( state, primarySiteId, secondaryZoneId );

			expect( time ).to.deep.equal( 0 );
		} );

		test( 'should return an expiration time for the given site and zone IDs', () => {
			const time = expires( state, primarySiteId, primaryZoneId );

			expect( time ).to.deep.equal( 1000 );
		} );
	} );

	describe( 'maxLockPeriod()', () => {
		test( 'should return 0 if no state exists', () => {
			const timeout = maxLockPeriod( emptyState, primarySiteId, primaryZoneId );

			expect( timeout ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given site ID', () => {
			const timeout = maxLockPeriod( state, secondarySiteId, primaryZoneId );

			expect( timeout ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given zone ID', () => {
			const timeout = maxLockPeriod( state, primarySiteId, secondaryZoneId );

			expect( timeout ).to.deep.equal( 0 );
		} );

		test( 'should return the max lock period for the given site and zone IDs', () => {
			const timeout = maxLockPeriod( state, primarySiteId, primaryZoneId );

			expect( timeout ).to.deep.equal( 2000 );
		} );
	} );
} );
