/**
 * @vitest-environment jsdom
 */
import { queryClient, siteWordPressMigrationStatusQuery } from '@automattic/api-queries';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../../test-utils';
import { WordPressMigration } from '../index';
import type { Site, WordPressMigrationStatus } from '@automattic/api-core';

const { setShowHelpCenter } = vi.hoisted( () => ( { setShowHelpCenter: vi.fn() } ) );
vi.mock( '../../../../app/help-center', () => ( {
	useHelpCenter: () => ( { setShowHelpCenter } ),
} ) );

const site = {
	ID: 42,
	slug: 'example.wordpress.com',
	site_migration: { type: 'wordpress', status_v2: 'started' },
} as Site;
const base = '/wpcom/v2/sites/42/wordpress-migration';
const mockApi = () => nock( 'https://public-api.wordpress.com' );
const cancelButton = () => screen.queryByRole( 'button', { name: 'Cancel this migration' } );
const migration = (
	status: WordPressMigrationStatus[ 'status' ],
	extra?: Partial< WordPressMigrationStatus >
): WordPressMigrationStatus => ( {
	status,
	phase: null,
	source_url: 'https://source.example',
	progress: null,
	findings: [],
	started_at: null,
	completed_at: null,
	handed_off: false,
	notification_emails: [],
	...extra,
} );
const replyStatus = ( data: WordPressMigrationStatus ) =>
	mockApi()
		.get( base + '/status' )
		.query( true )
		.reply( 200, data );
const openDialog = async () => {
	await userEvent.click( await screen.findByRole( 'button', { name: 'Cancel this migration' } ) );
	return within( await screen.findByRole( 'dialog' ) );
};

beforeEach( () => {
	mockApi()
		.get( base + '/configure' )
		.query( true )
		.reply( 200, { available_source_connections: [] } );
} );
afterEach( () => {
	vi.useRealTimers();
	queryClient.clear();
	vi.clearAllMocks();
} );

test( 'an old cached status hides Cancel until the normal status refresh confirms it', async () => {
	queryClient.setQueryData(
		siteWordPressMigrationStatusQuery( site.ID ).queryKey,
		migration( 'paused' )
	);
	replyStatus( migration( 'paused', { can_cancel: true } ) );
	render( <WordPressMigration site={ site } />, { queryClient } );
	expect( screen.getByRole( 'heading', { name: 'Before we migrate your site' } ) ).toBeVisible();
	expect( cancelButton() ).not.toBeInTheDocument();
	const dialog = await openDialog();
	expect( dialog.getByRole( 'button', { name: 'Cancel migration' } ) ).toBeEnabled();

	replyStatus( migration( 'paused', { can_cancel: false } ) );
	await act( () => queryClient.refetchQueries( siteWordPressMigrationStatusQuery( site.ID ) ) );
	await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
	expect( cancelButton() ).not.toBeInTheDocument();
} );

test( 'a recoverable failure offers Cancel when the start cooldown expires', async () => {
	vi.useFakeTimers( {
		shouldAdvanceTime: true,
		toNotFake: [ 'nextTick', 'setImmediate', 'queueMicrotask' ],
	} );
	const failed = migration( 'failed', {
		findings: [
			{
				code: 'source_unreachable',
				severity: 'failure',
				resolution: 'retry',
				suggested_action: null,
				label: 'Source unavailable',
				message: 'Source unavailable',
			},
		],
	} );
	replyStatus( { ...failed, can_cancel: false } );
	render( <WordPressMigration site={ site } />, { queryClient } );
	expect(
		await screen.findByRole( 'button', { name: 'The site is online now, try again' } )
	).toBeVisible();
	expect( cancelButton() ).not.toBeInTheDocument();
	replyStatus( { ...failed, can_cancel: true } );
	act( () => vi.advanceTimersByTime( 35000 ) );
	expect( await screen.findByRole( 'button', { name: 'Cancel this migration' } ) ).toBeEnabled();
} );

test( 'cancels setup only after explicit confirmation and refreshes the migration', async () => {
	replyStatus( migration( 'not_started', { can_cancel: true } ) );
	render( <WordPressMigration site={ site } />, { queryClient } );
	const cancel = mockApi()
		.post( base + '/cancel' )
		.reply( 200, { status: 'cancelled' } );
	let dialog = await openDialog();
	await userEvent.click( dialog.getByRole( 'button', { name: 'Keep migrating' } ) );
	expect( cancel.isDone() ).toBe( false );
	dialog = await openDialog();
	const refresh = mockApi()
		.get( base + '/status' )
		.query( true )
		.reply( 503 );
	await userEvent.click( dialog.getByRole( 'button', { name: 'Cancel migration' } ) );
	await waitFor( () => expect( cancelButton() ).not.toBeInTheDocument() );
	expect( screen.queryByRole( 'heading' ) ).not.toBeInTheDocument();
	expect( cancel.isDone() ).toBe( true );
	await waitFor( () => expect( refresh.isDone() ).toBe( true ) );
} );

test.each( [ 'unlock_failed', 'conflict' ] as const )(
	'refreshes after %s and leaves Help available outside the confirmation',
	async ( outcome ) => {
		replyStatus( migration( 'paused', { can_cancel: true } ) );
		render( <WordPressMigration site={ site } />, { queryClient } );
		const dialog = await openDialog();
		mockApi()
			.post( base + '/cancel' )
			.reply(
				outcome === 'conflict' ? 409 : 200,
				outcome === 'conflict' ? { code: 'site_migration_cannot_cancel' } : { status: outcome }
			);
		// A failed unlock can leave the saved migration step unchanged.
		const refresh = replyStatus( migration( 'paused', { can_cancel: false } ) );
		await userEvent.click( dialog.getByRole( 'button', { name: 'Cancel migration' } ) );
		expect( await screen.findByText( 'We couldn’t cancel your migration.' ) ).toBeVisible();
		await waitFor( () => expect( refresh.isDone() ).toBe( true ) );
		await waitFor( () => expect( cancelButton() ).not.toBeInTheDocument() );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		await userEvent.click( screen.getByRole( 'button', { name: /Contact us/ } ) );
		expect( setShowHelpCenter ).toHaveBeenCalledWith( true );
	}
);
