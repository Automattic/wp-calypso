/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { applyMiddleware, createStore } from 'redux';
import { REWIND_RESTORE } from 'calypso/state/action-types';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ErrorBanner from '../activity-log-banner/error-banner';
import ActivityLogItem from '../activity-log-item';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSite: () => ( { ID: 123, slug: 'example.wordpress.com' } ),
	getSiteSlug: () => 'example.wordpress.com',
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

const mockBackups = ( knownThreats ) =>
	nock( BASE )
		.get( `/wpcom/v3/sites/${ SITE_ID }/rewind/backups` )
		.query( true )
		.reply( 200, {
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
					object: { backup_period: '200', known_threats: knownThreats },
				},
			],
		} );

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

beforeEach( () => {
	page.mockClear();
} );

describe( 'Activity Log item restore', () => {
	it( 'sends a flagged backup to the restore page instead of restoring', async () => {
		mockBackups( counts( 3 ) );
		const { store, actions } = makeStore();
		renderItem( store );

		const confirm = screen.getByRole( 'button', { name: 'Confirm Restore' } );
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await userEvent.click( confirm );

		expect( page ).toHaveBeenCalledWith( RESTORE_PATH );
		expect( restoreActions( actions ) ).toHaveLength( 0 );
	} );

	it( 'restores an unflagged backup as before', async () => {
		mockBackups( counts( 0 ) );
		const { store, actions } = makeStore();
		renderItem( store );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Confirm Restore' } ) );

		expect( page ).not.toHaveBeenCalled();
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

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect( page ).toHaveBeenCalledWith( RESTORE_PATH );
		expect( rewindRestore ).not.toHaveBeenCalled();
	} );

	it( 'sends the user to the restore page while the counts are not loaded', async () => {
		nock( BASE ).get( `/wpcom/v3/sites/${ SITE_ID }/rewind/backups` ).query( true ).reply( 500 );
		const rewindRestore = jest.fn();
		renderBanner( rewindRestore );

		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

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
