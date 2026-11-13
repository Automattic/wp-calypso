/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { render } from '../../../test-utils';
import {
	DKIM_POLL_INTERVAL,
	DKIM_POLL_TIMEOUT,
	useDkimRecordChecks,
} from '../../hooks/use-dkim-record-checks';
import DkimMissingNotice from '../dkim-missing-notice';
import type { TitanDkimStatus } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const PATH = '/wpcom/v2/emails/titan/dkim-status';
const DOMAIN = 'example.com';
const CHECKED_AT = '2026-11-10T21:00:00+00:00';
const NEW_CHECKED_AT = '2026-11-11T09:00:00+00:00';
const TITLE = `Add the DKIM record for ${ DOMAIN }`;
const TRY_LATER =
	'We have not found the record yet. DNS changes can take a few hours to show, so try again later.';

const record = ( domain: string ) => ( {
	name: `titan._domainkey.${ domain }`,
	type: 'TXT' as const,
	data: `v=DKIM1; k=rsa; p=${ 'A'.repeat( 300 ) }`,
} );

const entry = ( overrides: Partial< TitanDkimStatus > = {} ): TitanDkimStatus => ( {
	domain: DOMAIN,
	status: 'missing',
	checked_at: CHECKED_AT,
	record: record( overrides.domain ?? DOMAIN ),
	...overrides,
} );

const mockStatus = ( body: TitanDkimStatus[] ) => nock( API ).get( PATH ).reply( 200, body );

const mockForce = ( body: TitanDkimStatus[] ) =>
	nock( API ).get( PATH ).query( { force: 'true' } ).reply( 200, body );

const checkAgainButton = () => screen.getByRole( 'button', { name: 'Check again' } );

const recordRows = () =>
	screen
		.getAllByRole( 'row' )
		.slice( 1 )
		.map( ( row ) =>
			Array.from( row.querySelectorAll( 'td' ) ).map( ( cell ) => cell.textContent )
		);

// Wires the hook to the notice the way the Emails page does.
function DkimNotice( { enabled = true }: { enabled?: boolean } ) {
	const checks = useDkimRecordChecks( enabled );
	return checks.entries.length ? <DkimMissingNotice { ...checks } /> : null;
}

describe( '<DkimMissingNotice>', () => {
	test( 'shows a notice only for domains whose DKIM record is missing', async () => {
		const scope = mockStatus( [
			entry( { domain: 'found.com', status: 'found' } ),
			entry( { domain: 'wpcom.com', status: 'not_applicable', record: null } ),
			entry( { domain: 'failed.com', status: 'unknown', record: null } ),
			entry(),
		] );
		render( <DkimNotice /> );

		expect( await screen.findByText( TITLE ) ).toBeVisible();
		expect( scope.isDone() ).toBe( true );
		expect( screen.getAllByRole( 'button', { name: 'Check again' } ) ).toHaveLength( 1 );
		expect( screen.queryByText( /found\.com|wpcom\.com|failed\.com/ ) ).not.toBeInTheDocument();
	} );

	test( 'shows the record in a modal', async () => {
		const user = userEvent.setup();
		mockStatus( [ entry() ] );
		render( <DkimNotice /> );

		await user.click( await screen.findByRole( 'button', { name: 'View record' } ) );
		expect( screen.getByRole( 'dialog', { name: 'DKIM record' } ) ).toBeVisible();
		expect( recordRows() ).toEqual( [ [ DOMAIN, record( DOMAIN ).name, record( DOMAIN ).data ] ] );
	} );

	test( 'copies the record value', async () => {
		const user = userEvent.setup();
		mockStatus( [ entry() ] );
		render( <DkimNotice /> );

		await user.click( await screen.findByRole( 'button', { name: 'View record' } ) );
		await user.click(
			screen.getByRole( 'button', { name: `Copy the record value for ${ DOMAIN }` } )
		);
		expect( await navigator.clipboard.readText() ).toBe( record( DOMAIN ).data );
		expect( screen.getByRole( 'button', { name: 'Copied' } ) ).toBeVisible();
	} );

	test( 'lists every domain with a missing record in one notice', async () => {
		const user = userEvent.setup();
		mockStatus( [ entry(), entry( { domain: 'other.com' } ) ] );
		render( <DkimNotice /> );

		expect( await screen.findByText( 'Add the DKIM records for 2 domains' ) ).toBeVisible();
		expect( screen.getAllByRole( 'button', { name: 'Check again' } ) ).toHaveLength( 1 );
		await user.click( screen.getByRole( 'button', { name: 'View records' } ) );
		expect( recordRows() ).toEqual( [
			[ DOMAIN, record( DOMAIN ).name, record( DOMAIN ).data ],
			[ 'other.com', record( 'other.com' ).name, record( 'other.com' ).data ],
		] );
	} );

	test( 'shows nothing when the request fails', async () => {
		const scope = nock( API ).get( PATH ).reply( 500, { code: 'error', message: 'Oops' } );
		render( <DkimNotice /> );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( screen.queryByRole( 'button', { name: 'Check again' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not fetch when disabled', () => {
		const scope = mockStatus( [ entry() ] );
		render( <DkimNotice enabled={ false } /> );

		expect( scope.isDone() ).toBe( false );
	} );

	describe( 'with polling', () => {
		beforeEach( () => jest.useFakeTimers() );
		afterEach( () => jest.useRealTimers() );

		// Small steps let each faked network reply land before the next poll is due.
		const advance = async ( ms: number ) => {
			for ( let elapsed = 0; elapsed < ms; elapsed += 100 ) {
				await act( () => jest.advanceTimersByTimeAsync( 100 ) );
			}
		};

		const neverChecked = entry( { status: 'unknown', checked_at: null, record: null } );

		test( 'polls a never-checked domain until its first check has a result', async () => {
			const first = mockStatus( [ neverChecked ] );
			render( <DkimNotice /> );
			await waitFor( () => expect( first.isDone() ).toBe( true ) );

			// Polling starts once the first response lands, so each poll is a little past the interval.
			const stillPending = mockStatus( [ neverChecked ] );
			const checked = mockStatus( [ entry() ] );
			await advance( DKIM_POLL_INTERVAL + 500 );
			expect( stillPending.isDone() ).toBe( true );
			expect( screen.queryByText( TITLE ) ).not.toBeInTheDocument();

			await advance( DKIM_POLL_INTERVAL + 500 );
			expect( checked.isDone() ).toBe( true );
			expect( await screen.findByText( TITLE ) ).toBeVisible();

			const extraPoll = mockStatus( [ entry() ] );
			await advance( DKIM_POLL_INTERVAL * 2 );
			expect( extraPoll.isDone() ).toBe( false );
		} );

		test( 'stops polling a never-checked domain when the time runs out', async () => {
			const first = mockStatus( [ neverChecked ] );
			render( <DkimNotice /> );
			await waitFor( () => expect( first.isDone() ).toBe( true ) );

			const polls = nock( API ).get( PATH ).times( 100 ).reply( 200, [ neverChecked ] );
			let pollCount = 0;
			polls.on( 'request', () => pollCount++ );
			await advance( DKIM_POLL_TIMEOUT + DKIM_POLL_INTERVAL );

			const pollsAtTimeout = pollCount;
			expect( pollsAtTimeout ).toBeGreaterThan( 0 );
			await advance( DKIM_POLL_INTERVAL * 3 );
			expect( pollCount ).toBe( pollsAtTimeout );
		} );

		test( 'does not poll a domain whose last check failed', async () => {
			const first = mockStatus( [ entry( { status: 'unknown', record: null } ) ] );
			render( <DkimNotice /> );
			await waitFor( () => expect( first.isDone() ).toBe( true ) );

			const extraPoll = mockStatus( [] );
			await advance( DKIM_POLL_INTERVAL * 2 );
			expect( extraPoll.isDone() ).toBe( false );
		} );

		const clickCheckAgain = async () => {
			const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
			await user.click( await screen.findByRole( 'button', { name: 'Check again' } ) );
		};

		test( 'sends force=true, polls, and hides the notice once the record is found', async () => {
			mockStatus( [ entry() ] );
			render( <DkimNotice /> );

			const force = mockForce( [ entry() ] );
			const unchanged = mockStatus( [ entry() ] );
			const found = mockStatus( [ entry( { status: 'found', checked_at: NEW_CHECKED_AT } ) ] );
			await clickCheckAgain();

			await waitFor( () => expect( force.isDone() ).toBe( true ) );
			expect( checkAgainButton() ).toHaveAttribute( 'aria-disabled', 'true' );

			await advance( DKIM_POLL_INTERVAL );
			expect( unchanged.isDone() ).toBe( true );
			expect( screen.getByText( TITLE ) ).toBeVisible();

			await advance( DKIM_POLL_INTERVAL );
			expect( found.isDone() ).toBe( true );
			await waitFor( () => expect( screen.queryByText( TITLE ) ).not.toBeInTheDocument() );
			expect( select( noticesStore ).getNotices() ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( { content: `We found the DKIM record for ${ DOMAIN }.` } ),
				] )
			);

			const extraPoll = mockStatus( [] );
			await advance( DKIM_POLL_INTERVAL * 2 );
			expect( extraPoll.isDone() ).toBe( false );
		} );

		test( 'keeps the notice and asks to try later when the record is still missing', async () => {
			mockStatus( [ entry() ] );
			render( <DkimNotice /> );

			mockForce( [ entry() ] );
			const stillMissing = mockStatus( [ entry( { checked_at: NEW_CHECKED_AT } ) ] );
			await clickCheckAgain();

			await advance( DKIM_POLL_INTERVAL );
			expect( stillMissing.isDone() ).toBe( true );
			expect( await screen.findByText( TRY_LATER ) ).toBeVisible();
			expect( screen.getByText( TITLE ) ).toBeVisible();
			expect( checkAgainButton() ).not.toHaveAttribute( 'aria-disabled', 'true' );
		} );

		test( 'waits for every missing domain to get a new result', async () => {
			const other = 'other.com';
			mockStatus( [ entry(), entry( { domain: other } ) ] );
			render( <DkimNotice /> );

			const force = mockForce( [ entry(), entry( { domain: other } ) ] );
			const firstDone = mockStatus( [
				entry( { status: 'found', checked_at: NEW_CHECKED_AT } ),
				entry( { domain: other } ),
			] );
			const bothDone = mockStatus( [
				entry( { status: 'found', checked_at: NEW_CHECKED_AT } ),
				entry( { domain: other, checked_at: NEW_CHECKED_AT } ),
			] );
			await clickCheckAgain();
			await waitFor( () => expect( force.isDone() ).toBe( true ) );

			await advance( DKIM_POLL_INTERVAL );
			expect( firstDone.isDone() ).toBe( true );
			expect( await screen.findByText( `Add the DKIM record for ${ other }` ) ).toBeVisible();
			expect( checkAgainButton() ).toHaveAttribute( 'aria-disabled', 'true' );

			await advance( DKIM_POLL_INTERVAL );
			expect( bothDone.isDone() ).toBe( true );
			expect( await screen.findByText( TRY_LATER ) ).toBeVisible();
			expect( checkAgainButton() ).not.toHaveAttribute( 'aria-disabled', 'true' );
			expect( select( noticesStore ).getNotices() ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( { content: `We found the DKIM record for ${ DOMAIN }.` } ),
				] )
			);
		} );

		test( 'announces a found domain when another one times out', async () => {
			const other = 'other.com';
			mockStatus( [ entry(), entry( { domain: other } ) ] );
			render( <DkimNotice /> );

			mockForce( [ entry(), entry( { domain: other } ) ] );
			nock( API )
				.get( PATH )
				.times( 100 )
				.reply( 200, [
					entry( { status: 'found', checked_at: NEW_CHECKED_AT } ),
					entry( { domain: other } ),
				] );
			await clickCheckAgain();

			await advance( DKIM_POLL_TIMEOUT );
			expect( await screen.findByText( TRY_LATER ) ).toBeVisible();
			expect( screen.getByText( `Add the DKIM record for ${ other }` ) ).toBeVisible();
			expect( select( noticesStore ).getNotices() ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( { content: `We found the DKIM record for ${ DOMAIN }.` } ),
				] )
			);
		} );

		test( 'stops polling and asks to try later when the time runs out', async () => {
			mockStatus( [ entry() ] );
			render( <DkimNotice /> );

			mockForce( [ entry() ] );
			const polls = nock( API ).get( PATH ).times( 100 ).reply( 200, [ entry() ] );
			let pollCount = 0;
			polls.on( 'request', () => pollCount++ );
			await clickCheckAgain();

			await advance( DKIM_POLL_TIMEOUT );
			expect( await screen.findByText( TRY_LATER ) ).toBeVisible();
			expect( checkAgainButton() ).not.toHaveAttribute( 'aria-disabled', 'true' );
			expect( pollCount ).toBeGreaterThanOrEqual( DKIM_POLL_TIMEOUT / DKIM_POLL_INTERVAL - 1 );

			const pollsAtTimeout = pollCount;
			await advance( DKIM_POLL_INTERVAL * 3 );
			expect( pollCount ).toBe( pollsAtTimeout );
		} );
	} );
} );
