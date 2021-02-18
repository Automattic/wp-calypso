/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import selectors from '../selectors';

const {
	getSyncStatus,
	getFullSyncRequest,
	isPendingSyncStart,
	isFullSyncing,
	getSyncProgressPercentage,
	isImmediateFullSync,
} = selectors;

const nonExistentId = '111111';
const requestedSiteId = '123456';
const successfulSiteId = '1234567';
const errorSiteId = '12345678';
const syncScheduledSiteID = '123455';
const oldSyncSiteId = '987654321';
const syncStartedSiteId = '87654321';
const syncInProgressSiteId = '7654321';
const immediateSyncId = '22222222';

const syncStatusSuccessful = {
	started: 1470085369,
	queue_finished: 1470085370,
	sent_started: 1470085392,
	finished: 1470087342,
	total: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 402,
		comments: 28,
		updates: 1,
	},
	queue: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 402,
		comments: 28,
		updates: 1,
	},
	sent: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 193,
	},
	config: {
		constants: true,
		functions: true,
		options: true,
		terms: true,
		themes: true,
		users: true,
		posts: true,
		comments: true,
		updates: true,
	},
	queue_size: 0,
	queue_lag: 0,
	full_queue_size: 239,
	full_queue_lag: 957.49082708359,
	is_scheduled: false,
	lastSuccessfulStatus: 1470087342000,
};

const syncStatusScheduled = {
	started: 1470085369,
	queue_finished: 1470085370,
	sent_started: 1470085392,
	finished: 1470087342,
	total: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 402,
		comments: 28,
		updates: 1,
	},
	queue: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 402,
		comments: 28,
		updates: 1,
	},
	sent: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 193,
	},
	config: {
		constants: true,
		functions: true,
		options: true,
		terms: true,
		themes: true,
		users: true,
		posts: true,
		comments: true,
		updates: true,
	},
	queue_size: 0,
	queue_lag: 0,
	full_queue_size: 239,
	full_queue_lag: 957.49082708359,
	is_scheduled: true,
	lastSuccessfulStatus: 1470087343000,
};

const syncStatusErrored = {
	isRequesting: false,
	error: {
		statusCode: 400,
	},
};

const syncStatusStarted = {
	started: 1470163982,
	queue_finished: 1470163982,
	total: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 404,
		comments: 27,
		updates: 1,
	},
	queue: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 404,
		comments: 27,
		updates: 1,
	},
	sent: [],
	config: {
		constants: true,
		functions: true,
		options: true,
		terms: true,
		themes: true,
		users: true,
		posts: true,
		comments: true,
		updates: true,
	},
	queue_size: 0,
	queue_lag: 0,
	full_queue_size: 464,
	full_queue_lag: 4.1990218162537,
	is_scheduled: false,
	lastSuccessfulStatus: 1470163983000,
};

const syncStatusInProgress = {
	started: 1470069379,
	queue_finished: 1470069380,
	sent_started: 1470069405,
	total: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 402,
		comments: 28,
		updates: 1,
	},
	queue: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 25,
		themes: 1,
		users: 1,
		posts: 402,
		comments: 28,
		updates: 1,
	},
	sent: {
		constants: 1,
		functions: 1,
		options: 1,
		terms: 2,
	},
	config: {
		constants: true,
		functions: true,
		options: true,
		terms: true,
		themes: true,
		users: true,
		posts: true,
		comments: true,
		updates: true,
	},
	queue_size: 0,
	queue_lag: 0,
	full_queue_size: 457,
	full_queue_lag: 33.257718086243,
	is_scheduled: false,
	lastSuccessfulStatus: 1470069406000,
};

const syncStatusImmediate = {
	started: 1579811550,
	config: {
		constants: true,
		functions: true,
		options: true,
		terms: true,
		themes: true,
		users: true,
		posts: true,
		comments: true,
		updates: true,
		term_relationships: true,
	},
	queue_size: 0,
	queue_lag: 0,
	is_scheduled: false,
	lastSuccessfulStatus: 1579811570143,
	progress: {
		constants: { total: 20, sent: 20, finished: true },
		functions: { total: 33, sent: 33, finished: true },
		options: { total: 142, sent: 0, finished: false },
		updates: { total: 3, sent: 0, finished: false },
		themes: { total: 1, sent: 0, finished: false },
		users: { total: '7', sent: 0, finished: false },
		terms: { total: '70', sent: 0, finished: false },
		posts: { total: '203', sent: 0, finished: false },
		comments: { total: '31', sent: 0, finished: false },
		term_relationships: { total: '253', sent: 0, finished: false },
	},
};

const fullSyncRequested = {
	isRequesting: true,
	lastRequested: 1467944517955,
};

const fullSyncRequestSuccessful = {
	isRequesting: true,
	scheduled: true,
	error: false,
	lastRequested: 1470087343001,
};

const fullSyncRequestOld = {
	isRequesting: true,
	scheduled: true,
	error: false,
	lastRequested: 1467926563435,
};

const fullSyncRequestErrored = {
	isRequesting: false,
	scheduled: false,
	lastRequested: 1467944517955,
	error: {
		statusCode: 400,
	},
};

const testState = {
	jetpackSync: {
		syncStatus: {
			[ successfulSiteId ]: syncStatusSuccessful,
			[ errorSiteId ]: syncStatusErrored,
			[ syncScheduledSiteID ]: syncStatusScheduled,
			[ oldSyncSiteId ]: syncStatusSuccessful,
			[ syncStartedSiteId ]: syncStatusStarted,
			[ syncInProgressSiteId ]: syncStatusInProgress,
			[ immediateSyncId ]: syncStatusImmediate,
		},
		fullSyncRequest: {
			[ requestedSiteId ]: fullSyncRequested,
			[ successfulSiteId ]: fullSyncRequestSuccessful,
			[ errorSiteId ]: fullSyncRequestErrored,
			[ oldSyncSiteId ]: fullSyncRequestOld,
		},
	},
};

describe( 'selectors', () => {
	describe( '#getSyncStatus()', () => {
		test( 'should return undefined when state is {}', () => {
			const syncStatus = getSyncStatus( {}, nonExistentId );
			expect( syncStatus ).to.be.eql( undefined );
		} );

		test( 'should return undefined if site is not in state', () => {
			const syncStatus = getSyncStatus( testState, nonExistentId );
			expect( syncStatus ).to.be.eql( undefined );
		} );

		test( 'should return sync status for site if site in state', () => {
			const syncStatus = getSyncStatus( testState, successfulSiteId );
			expect( syncStatus ).to.be.eql( testState.jetpackSync.syncStatus[ successfulSiteId ] );
		} );
	} );

	describe( '#getFullSyncRequest()', () => {
		test( 'should return undefined when state is {}', () => {
			const fullSyncRequest = getFullSyncRequest( {}, nonExistentId );
			expect( fullSyncRequest ).to.be.eql( undefined );
		} );

		test( 'should return undefined if site is not in state', () => {
			const fullSyncRequest = getFullSyncRequest( testState, nonExistentId );
			expect( fullSyncRequest ).to.be.eql( undefined );
		} );

		test( 'should return full sync status for a site if in state', () => {
			const fullSyncRequest = getFullSyncRequest( testState, successfulSiteId );
			expect( fullSyncRequest ).to.be.eql(
				testState.jetpackSync.fullSyncRequest[ successfulSiteId ]
			);
		} );
	} );

	describe( '#isPendingSyncStart()', () => {
		test( 'should return true if a sync is scheduled', () => {
			const test = isPendingSyncStart( testState, syncScheduledSiteID );
			expect( test ).to.be.true;
		} );

		test( 'should return false if sync status and full sync request show not scheduled', () => {
			const test = isPendingSyncStart( testState, errorSiteId );
			expect( test ).to.be.false;
		} );

		test( 'should return true if a sync has been requested, but before sync status has updated', () => {
			const test = isPendingSyncStart( testState, successfulSiteId );
			expect( test ).to.be.true;
		} );

		test( 'should be false if a sync has been requested, but sync has already finished', () => {
			const test = isPendingSyncStart( testState, oldSyncSiteId );
			expect( test ).to.be.false;
		} );
	} );

	describe( '#isFullSyncing()', () => {
		test( 'should return false if no sync status for a site', () => {
			const test = isFullSyncing( testState, nonExistentId );
			expect( test ).to.be.false;
		} );

		test( 'should return false if syncing is has finished', () => {
			const test = isFullSyncing( testState, successfulSiteId );
			expect( test ).to.be.false;
		} );

		test( 'should return false if syncing is scheduled but not started', () => {
			const test = isFullSyncing( testState, syncScheduledSiteID );
			expect( test ).to.be.false;
		} );

		test( 'should return true if sync has started and not finished', () => {
			const test = isFullSyncing( testState, syncStartedSiteId );
			expect( test ).to.be.true;
		} );
	} );

	describe( '#getSyncProgressPercentage()', () => {
		test( 'should return 0 if no sync status for a site', () => {
			const test = getSyncProgressPercentage( testState, nonExistentId );
			expect( test ).to.be.eql( 0 );
		} );

		test( 'should return a non-zero integer if site has sent data to be synced', () => {
			const test = getSyncProgressPercentage( testState, syncInProgressSiteId );
			expect( test ).to.be.eql( 11 );
		} );
	} );

	describe( '#getImmediateSyncProgressPercentage', () => {
		test( 'should return accurate percent based on progress propety', () => {
			const test = getSyncProgressPercentage( testState, immediateSyncId );
			expect( test ).to.be.eql( 7 );
		} );
	} );

	describe( '#isImmediateFullSync', () => {
		test( 'should return false for sites running legacy sync', () => {
			expect( isImmediateFullSync( testState, successfulSiteId ) ).to.be.false;
			expect( isImmediateFullSync( testState, syncScheduledSiteID ) ).to.be.false;
			expect( isImmediateFullSync( testState, syncStartedSiteId ) ).to.be.false;
			expect( isImmediateFullSync( testState, syncInProgressSiteId ) ).to.be.false;
		} );
		test( 'should return true for sites running immediate sync', () => {
			expect( isImmediateFullSync( testState, immediateSyncId ) ).to.be.true;
		} );
	} );
} );
