/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { speak } from '@wordpress/a11y';
import nock from 'nock';
import { applyMiddleware, createStore } from 'redux';
import { REWIND_RESTORE } from 'calypso/state/action-types';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ErrorBanner from '../activity-log-banner/error-banner';
import ActivityLogItem from '../activity-log-item';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '@wordpress/a11y', () => ( {
	...jest.requireActual( '@wordpress/a11y' ),
	speak: jest.fn(),
} ) );
let mockSiteSlug = 'example.wordpress.com';
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSite: () => ( { ID: 123, slug: 'example.wordpress.com' } ),
	getSiteSlug: () => mockSiteSlug,
} ) );
jest.mock( 'calypso/state/selectors/get-rewind-state', () => ( {
	__esModule: true,
	default: () => ( { state: 'active', canAutoconfigure: false } ),
} ) );
jest.mock( 'calypso/state/selectors/get-requested-rewind', () => ( {
	__esModule: true,
	default: () => 'activity-1',
} ) );
jest.mock( 'calypso/state/selectors/get-requested-backup', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset', () => ( {
	__esModule: true,
	default: () => 0,
} ) );
jest.mock( 'calypso/state/selectors/get-site-timezone-value', () => ( {
	__esModule: true,
	default: () => 'UTC',
} ) );

const BASE = 'https://public-api.wordpress.com';
const SITE_ID = 123;
const REWIND_ID = '200.5';
const RESTORE_PATH = `/backup/example.wordpress.com/restore/${ REWIND_ID }`;

const counts = ( flagged ) => ( {
	malware: flagged,
	database: 0,
	vulnerable: 0,
	ignored: 0,
	flagged,
	fixed: 0,
} );

const backupsBody = ( knownThreats ) => ( {
	ok: true,
	totalItems: 1,
	totalPages: 1,
	page: 1,
	itemsPerPage: 100,
	backups: [
		{
			status: 'finished',
			is_rewindable: true,
			summary: '',
			object: {
				backup_period: '200',
				...( knownThreats ? { known_threats: knownThreats } : {} ),
			},
		},
	],
} );

const backupsRequest = () =>
	nock( BASE ).get( `/wpcom/v3/sites/${ SITE_ID }/rewind/backups` ).query( true );

const mockBackups = ( knownThreats ) => backupsRequest().reply( 200, backupsBody( knownThreats ) );

function mockPendingBackups() {
	let release;
	const released = new Promise( ( resolve ) => ( release = resolve ) );
	backupsRequest().reply( async () => {
		await released;
		return [ 200, backupsBody( counts( 0 ) ) ];
	} );
	return release;
}

function makeStore() {
	const actions = [];
	const recorder = () => ( next ) => ( action ) => {
		actions.push( action );
		return next( action );
	};
	const store = createStore( ( state = {} ) => state, {}, applyMiddleware( recorder ) );
	return { store, actions };
}

const activity = {
	activityId: 'activity-1',
	activityIcon: 'posts',
	activityIsRewindable: true,
	activityName: 'post__published',
	activityStatus: null,
	activityTitle: 'Post published',
	activityTs: 200000,
	activityDescription: [],
	actorName: 'Jane',
	actorType: 'Person',
	rewindId: REWIND_ID,
};

const renderItem = ( store ) =>
	renderWithProvider( <ActivityLogItem siteId={ SITE_ID } activity={ activity } />, { store } );

const restoreActions = ( actions ) => actions.filter( ( { type } ) => type === REWIND_RESTORE );

const FLAGGED_HINT =
	"This backup contains known security threats. You'll review them before restoring.";
const UNCHECKED_HINT =
	"This backup couldn't be checked for known security threats. You'll continue on the restore page.";
const PENDING_HINT = 'Checking this backup for known security threats…';

// Inert while the check runs, but still focusable so its description says why.
const expectPending = ( button ) => {
	expect( button ).toBeEnabled();
	expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
	expect( button ).toHaveAccessibleDescription( PENDING_HINT );
};

beforeEach( () => {
	page.mockClear();
	speak.mockClear();
	mockSiteSlug = 'example.wordpress.com';
} );

describe( 'Activity Log item restore', () => {
	it( 'sends a flagged backup to the restore page instead of restoring', async () => {
		mockBackups( counts( 3 ) );
		const { store, actions } = makeStore();
		renderItem( store );

		const confirm = screen.getByRole( 'button', { name: 'Confirm Restore' } );
		await waitFor( () => expect( confirm ).toHaveAccessibleDescription( FLAGGED_HINT ) );
		expect( confirm ).not.toHaveAttribute( 'aria-disabled' );
		await userEvent.click( confirm );

		expect( speak ).toHaveBeenCalledWith( FLAGGED_HINT, 'assertive' );
		expect( page ).toHaveBeenCalledWith( RESTORE_PATH );
		expect( restoreActions( actions ) ).toHaveLength( 0 );
	} );

	it( 'restores an unflagged backup as before', async () => {
		mockBackups( counts( 0 ) );
		const { store, actions } = makeStore();
		renderItem( store );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		const confirm = screen.getByRole( 'button', { name: 'Confirm Restore' } );
		expect( confirm ).not.toHaveAccessibleDescription();
		await userEvent.click( confirm );

		expect( page ).not.toHaveBeenCalled();
		expect( speak ).not.toHaveBeenCalled();
		expect( restoreActions( actions ) ).toEqual( [
			expect.objectContaining( {
				siteId: SITE_ID,
				timestamp: REWIND_ID,
				args: expect.objectContaining( { themes: true, sqls: true } ),
				acknowledgeThreats: false,
			} ),
		] );
	} );
} );

describe( 'Activity Log item restore while the check is not settled', () => {
	it( 'holds Confirm Restore while the counts load', async () => {
		const release = mockPendingBackups();
		const { store, actions } = makeStore();
		renderItem( store );

		const confirm = screen.getByRole( 'button', { name: 'Confirm Restore' } );
		expectPending( confirm );
		await userEvent.click( confirm );
		expect( page ).not.toHaveBeenCalled();
		expect( restoreActions( actions ) ).toHaveLength( 0 );

		release();
		await waitFor( () => expect( confirm ).not.toHaveAttribute( 'aria-disabled' ) );
		expect( confirm ).not.toHaveAccessibleDescription();
	} );

	it( 'treats a missing site slug as still loading', async () => {
		mockSiteSlug = null;
		mockBackups( counts( 0 ) );
		const { store, actions } = makeStore();
		renderItem( store );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		const confirm = screen.getByRole( 'button', { name: 'Confirm Restore' } );
		expectPending( confirm );
		await userEvent.click( confirm );
		expect( page ).not.toHaveBeenCalled();
		expect( restoreActions( actions ) ).toHaveLength( 0 );
	} );

	it( 'sends the user to the restore page when the counts fail to load', async () => {
		backupsRequest().reply( 500 );
		const { store, actions } = makeStore();
		renderItem( store );

		const confirm = screen.getByRole( 'button', { name: 'Confirm Restore' } );
		await waitFor( () => expect( confirm ).toHaveAccessibleDescription( UNCHECKED_HINT ) );
		await userEvent.click( confirm );

		expect( speak ).toHaveBeenCalledWith( UNCHECKED_HINT, 'assertive' );
		expect( page ).toHaveBeenCalledWith( RESTORE_PATH );
		expect( restoreActions( actions ) ).toHaveLength( 0 );
	} );

	it( 'restores directly when the backups carry no known-threats data', async () => {
		mockBackups( undefined );
		const { store, actions } = makeStore();
		renderItem( store );

		const confirm = screen.getByRole( 'button', { name: 'Confirm Restore' } );
		await waitFor( () => expect( confirm ).not.toHaveAttribute( 'aria-disabled' ) );
		await userEvent.click( confirm );

		expect( page ).not.toHaveBeenCalled();
		expect( restoreActions( actions ) ).toHaveLength( 1 );
	} );
} );

describe( 'Activity Log error banner retry', () => {
	const renderBanner = ( rewindRestore ) =>
		renderWithProvider(
			<ErrorBanner
				errorCode="error"
				failureReason="failed"
				closeDialog={ jest.fn() }
				siteId={ SITE_ID }
				requestedRestoreId={ REWIND_ID }
				rewindRestore={ rewindRestore }
			/>
		);

	it( 'sends a flagged backup to the restore page instead of retrying', async () => {
		mockBackups( counts( 3 ) );
		const rewindRestore = jest.fn();
		renderBanner( rewindRestore );

		const retry = screen.getByRole( 'button', { name: 'Try again' } );
		await waitFor( () => expect( retry ).toHaveAccessibleDescription( FLAGGED_HINT ) );
		await userEvent.click( retry );

		expect( speak ).toHaveBeenCalledWith( FLAGGED_HINT, 'assertive' );
		expect( page ).toHaveBeenCalledWith( RESTORE_PATH );
		expect( rewindRestore ).not.toHaveBeenCalled();
	} );

	it( 'holds Try again while the counts load', async () => {
		const release = mockPendingBackups();
		const rewindRestore = jest.fn();
		renderBanner( rewindRestore );

		const retry = screen.getByRole( 'button', { name: 'Try again' } );
		expectPending( retry );
		await userEvent.click( retry );
		expect( page ).not.toHaveBeenCalled();
		expect( rewindRestore ).not.toHaveBeenCalled();

		release();
		await waitFor( () => expect( retry ).not.toHaveAttribute( 'aria-disabled' ) );
		expect( retry ).not.toHaveAccessibleDescription();
	} );

	it( 'sends the user to the restore page when the counts fail to load', async () => {
		backupsRequest().reply( 500 );
		const rewindRestore = jest.fn();
		renderBanner( rewindRestore );

		const retry = screen.getByRole( 'button', { name: 'Try again' } );
		await waitFor( () => expect( retry ).toHaveAccessibleDescription( UNCHECKED_HINT ) );
		await userEvent.click( retry );

		expect( page ).toHaveBeenCalledWith( RESTORE_PATH );
		expect( rewindRestore ).not.toHaveBeenCalled();
	} );

	it( 'retries an unflagged backup as before', async () => {
		mockBackups( counts( 0 ) );
		const rewindRestore = jest.fn();
		renderBanner( rewindRestore );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect( page ).not.toHaveBeenCalled();
		expect( rewindRestore ).toHaveBeenCalledWith( SITE_ID, REWIND_ID );
	} );
} );
