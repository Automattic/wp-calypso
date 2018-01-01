/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { cloneDeep, tap } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getLock,
	getLockTimeCreated,
	getMaxLockPeriod,
	isBlocked,
	isExpired,
	isRequesting,
} from '../selectors';

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

	describe( 'getLock()', () => {
		const state = tap( cloneDeep( emptyState ), stateTree => {
			stateTree.extensions.zoninator.locks = {
				items: {
					[ primarySiteId ]: {
						[ primaryZoneId ]: 1000,
					},
				},
			};
		} );

		test( 'should return 0 if no state exists', () => {
			const lock = getLock( emptyState, primarySiteId, primaryZoneId );

			expect( lock ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given site ID', () => {
			const lock = getLock( state, secondarySiteId, primaryZoneId );

			expect( lock ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given zone ID', () => {
			const lock = getLock( state, primarySiteId, secondaryZoneId );

			expect( lock ).to.deep.equal( 0 );
		} );

		test( 'should return a lock for the given site and zone IDs', () => {
			const lock = getLock( state, primarySiteId, primaryZoneId );

			expect( lock ).to.deep.equal( 1000 );
		} );
	} );

	describe( 'isBlocked()', () => {
		const state = tap( cloneDeep( emptyState ), stateTree => {
			stateTree.extensions.zoninator.locks = {
				blocked: {
					[ primarySiteId ]: {
						[ primaryZoneId ]: true,
					},
				},
			};
		} );

		test( 'should return false if no state exists', () => {
			const blocked = isBlocked( emptyState, primarySiteId, primaryZoneId );

			expect( blocked ).to.deep.equal( false );
		} );

		test( 'should return false if no state is attached for the given site ID', () => {
			const blocked = isBlocked( state, secondarySiteId, primaryZoneId );

			expect( blocked ).to.deep.equal( false );
		} );

		test( 'should return false if no state is attached for the given zone ID', () => {
			const blocked = isBlocked( state, primarySiteId, secondaryZoneId );

			expect( blocked ).to.deep.equal( false );
		} );

		test( 'should return the blocked status value for the given site and zone IDs', () => {
			const blocked = isBlocked( state, primarySiteId, primaryZoneId );

			expect( blocked ).to.deep.equal( true );
		} );
	} );

	describe( 'isExpired()', () => {
		const state = tap( cloneDeep( emptyState ), stateTree => {
			stateTree.extensions.zoninator.locks = {
				items: {
					[ primarySiteId ]: {
						[ primaryZoneId ]: new Date().getTime(),
					},
				},
			};
		} );

		test( 'should return false if no state exists', () => {
			const expired = isExpired( emptyState, primarySiteId, primaryZoneId );

			expect( expired ).to.deep.equal( false );
		} );

		test( 'should return false if no state is attached for the given site ID', () => {
			const expired = isExpired( state, secondarySiteId, primaryZoneId );

			expect( expired ).to.deep.equal( false );
		} );

		test( 'should return false if no state is attached for the given zone ID', () => {
			const expired = isExpired( state, primarySiteId, secondaryZoneId );

			expect( expired ).to.deep.equal( false );
		} );

		test( "should return false if the expiry time hasn't passed yet", () => {
			const unexpiredState = tap( cloneDeep( state ), stateTree => {
				stateTree.extensions.zoninator.locks.items[ primarySiteId ][ primaryZoneId ] =
					new Date().getTime() + 1000;
			} );

			const expired = isExpired( unexpiredState, primarySiteId, primaryZoneId );

			expect( expired ).to.deep.equal( false );
		} );

		test( 'should return true if the expiry time has passed', () => {
			const expiredState = tap( cloneDeep( state ), stateTree => {
				stateTree.extensions.zoninator.locks.items[ primarySiteId ][ primaryZoneId ] =
					new Date().getTime() - 1000;
			} );

			const expired = isExpired( expiredState, primarySiteId, primaryZoneId );

			expect( expired ).to.deep.equal( true );
		} );
	} );

	describe( 'isRequesting()', () => {
		const state = tap( cloneDeep( emptyState ), stateTree => {
			stateTree.extensions.zoninator.locks = {
				requesting: {
					[ primarySiteId ]: {
						[ primaryZoneId ]: true,
					},
				},
			};
		} );

		test( 'should return false if no state exists', () => {
			const requesting = isRequesting( emptyState, primarySiteId, primaryZoneId );

			expect( requesting ).to.deep.equal( false );
		} );

		test( 'should return false if no state is attached for the given site ID', () => {
			const requesting = isRequesting( state, secondarySiteId, primaryZoneId );

			expect( requesting ).to.deep.equal( false );
		} );

		test( 'should return false if no state is attached for the given zone ID', () => {
			const requesting = isRequesting( state, primarySiteId, secondaryZoneId );

			expect( requesting ).to.deep.equal( false );
		} );

		test( 'should return requesting status for the given site and zone IDs', () => {
			const requesting = isRequesting( state, primarySiteId, primaryZoneId );

			expect( requesting ).to.deep.equal( true );
		} );
	} );

	describe( 'getMaxLockPeriod()', () => {
		const state = tap( cloneDeep( emptyState ), stateTree => {
			stateTree.extensions.zoninator.locks = {
				maxLockPeriod: {
					[ primarySiteId ]: 600,
				},
			};
		} );

		test( 'should return -1 if no state exists', () => {
			const maxLockPeriod = getMaxLockPeriod( emptyState, primarySiteId );

			expect( maxLockPeriod ).to.deep.equal( -1 );
		} );

		test( 'should return -1 if no state is attached for the given site ID', () => {
			const maxLockPeriod = getMaxLockPeriod( state, secondarySiteId );

			expect( maxLockPeriod ).to.deep.equal( -1 );
		} );

		test( 'should return the max lock period for the given site ID', () => {
			const maxLockPeriod = getMaxLockPeriod( state, primarySiteId );

			expect( maxLockPeriod ).to.deep.equal( 600 );
		} );
	} );

	describe( 'getLockTimeCreated()', () => {
		const state = tap( cloneDeep( emptyState ), stateTree => {
			stateTree.extensions.zoninator.locks = {
				created: {
					[ primarySiteId ]: {
						[ primaryZoneId ]: 600,
					},
				},
			};
		} );

		test( 'should return 0 if no state exists', () => {
			const timeCreated = getLockTimeCreated( emptyState, primarySiteId, primaryZoneId );

			expect( timeCreated ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given site ID', () => {
			const timeCreated = getLockTimeCreated( state, secondarySiteId, primaryZoneId );

			expect( timeCreated ).to.deep.equal( 0 );
		} );

		test( 'should return 0 if no state is attached for the given zone ID', () => {
			const timeCreated = getLockTimeCreated( state, primarySiteId, secondaryZoneId );

			expect( timeCreated ).to.deep.equal( 0 );
		} );

		test( 'should return the time a lock was created for the given site and zone IDs', () => {
			const timeCreated = getLockTimeCreated( state, primarySiteId, primaryZoneId );

			expect( timeCreated ).to.deep.equal( 600 );
		} );
	} );
} );
