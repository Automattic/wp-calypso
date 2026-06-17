import { MEMBERSHIPS_SETTINGS } from 'calypso/state/action-types';
import { refreshFreeTierDescriptionRendered } from '../actions';

const SITE_ID = 1;

const stateWithRendered = ( rendered ) => ( {
	memberships: {
		settings: {
			[ SITE_ID ]: { freeTierDescriptionRendered: rendered },
		},
	},
} );

describe( 'refreshFreeTierDescriptionRendered()', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	} );

	test( 'fires an immediate refetch, then stops once the rendered value updates', () => {
		const dispatch = jest.fn();
		let rendered = '<p>old</p>';
		const getState = jest.fn( () => stateWithRendered( rendered ) );

		refreshFreeTierDescriptionRendered( SITE_ID )( dispatch, getState );

		// Immediate refetch.
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( {
			siteId: SITE_ID,
			source: undefined,
			type: MEMBERSHIPS_SETTINGS,
		} );

		// Simulate the refetch landing a fresh server-rendered value.
		rendered = '<p>new</p>';
		jest.advanceTimersByTime( 1500 );

		// Value changed, so no further refetches are scheduled.
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		jest.advanceTimersByTime( 10000 );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'keeps retrying when settings had not loaded (null baseline), not stopping on a stale value', () => {
		const dispatch = jest.fn();
		// Settings hadn't loaded when the save happened, so the baseline is null.
		let rendered = null;
		const getState = jest.fn( () => stateWithRendered( rendered ) );

		refreshFreeTierDescriptionRendered( SITE_ID )( dispatch, getState );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );

		// The first refetch lands a (pre-sync) stale value. It differs from the null
		// baseline, but must NOT be treated as "updated" — keep polling.
		rendered = '<p>stale</p>';
		jest.advanceTimersByTime( 1500 );
		expect( dispatch ).toHaveBeenCalledTimes( 2 );

		jest.advanceTimersByTime( 3000 );
		expect( dispatch ).toHaveBeenCalledTimes( 3 );

		jest.advanceTimersByTime( 5000 );
		expect( dispatch ).toHaveBeenCalledTimes( 4 );
	} );

	test( 'retries with backoff and gives up after exhausting the budget', () => {
		const dispatch = jest.fn();
		// The rendered value never changes (e.g. sync never lands within the budget).
		const getState = jest.fn( () => stateWithRendered( '<p>old</p>' ) );

		refreshFreeTierDescriptionRendered( SITE_ID )( dispatch, getState );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );

		jest.advanceTimersByTime( 1500 );
		expect( dispatch ).toHaveBeenCalledTimes( 2 );

		jest.advanceTimersByTime( 3000 );
		expect( dispatch ).toHaveBeenCalledTimes( 3 );

		jest.advanceTimersByTime( 5000 );
		expect( dispatch ).toHaveBeenCalledTimes( 4 );

		// Budget exhausted — no further refetches.
		jest.advanceTimersByTime( 60000 );
		expect( dispatch ).toHaveBeenCalledTimes( 4 );
	} );
} );
