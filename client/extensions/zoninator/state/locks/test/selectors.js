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
	getMaxLockPeriod,
	isBlocked,
	isExpired,
	isLocked,
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
		const expires = new Date();
		const state = tap( cloneDeep( emptyState ), stateTree => {
			stateTree.extensions.zoninator.locks = {
				items: {
					[ primarySiteId ]: {
						[ primaryZoneId ]: expires,
					},
				},
			};
		} );

		test( 'should return null if no state exists', () => {
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

			expect( lock ).to.deep.equal( expires );
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
		const expires = new Date();
		const state = tap( cloneDeep( emptyState ), stateTree => {
			stateTree.extensions.zoninator.locks = {
				items: {
					[ primarySiteId ]: {
						[ primaryZoneId ]: expires,
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
			const expired = isExpired(
				state,
				primarySiteId,
				primaryZoneId,
				new Date( expires.getTime() - 1000 )
			);

			expect( expired ).to.deep.equal( false );
		} );

		test( 'should return true if the expiry time has passed', () => {
			const expired = isExpired(
				state,
				primarySiteId,
				primaryZoneId,
				new Date( expires.getTime() + 1000 )
			);

			expect( expired ).to.deep.equal( true );
		} );
	} );

	describe( 'isLocked()', () => {
		const now = new Date();
		const state = tap( cloneDeep( emptyState ), stateTree => {
			stateTree.extensions.zoninator.locks = {
				items: {
					[ primarySiteId ]: {
						[ primaryZoneId ]: new Date( now.getTime() - 1000 ),
						[ secondaryZoneId ]: new Date( now.getTime() + 1000 ),
					},
				},
			};
		} );

		test( 'should return false if no state exists', () => {
			const locked = isLocked( emptyState, primarySiteId, primaryZoneId );

			expect( locked ).to.deep.equal( false );
		} );

		test( 'should return false if zone lock exists but is expired', () => {
			const locked = isLocked( state, primarySiteId, primaryZoneId );

			expect( locked ).to.deep.equal( false );
		} );

		test( "should return true is zone lock exists and hasn't expired", () => {
			const locked = isLocked( state, primarySiteId, secondaryZoneId );

			expect( locked ).to.deep.equal( true );
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
} );
