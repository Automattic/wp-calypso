/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ComposerModal } from '../composer-modal';
import { ComposerProvider, useComposer } from '../composer-provider';

function makePreview() {
	return {
		uri: 'at://p',
		cid: 'pcid',
		author: {
			did: 'did:plc:alice',
			handle: 'alice.bsky.social',
			display_name: 'Alice',
			avatar: null,
		},
		text: 'Excited to share!',
		html: '<p>Excited to share!</p>',
	};
}

function TriggerAndModal() {
	const { openComposer } = useComposer();
	return (
		<>
			<button
				onClick={ () =>
					openComposer( {
						kind: 'reply',
						root: { uri: 'at://r', cid: 'rcid' },
						parent: { uri: 'at://p', cid: 'pcid' },
						previewPost: makePreview(),
					} )
				}
			>
				open
			</button>
			<ComposerModal />
		</>
	);
}

function Harness( props: { connectionId: number } ) {
	return (
		<ComposerProvider connectionId={ props.connectionId }>
			<TriggerAndModal />
		</ComposerProvider>
	);
}

describe( '<ComposerModal>', () => {
	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads state.reader.follows.
		// Replace it with a no-op action creator so dispatch() doesn't throw,
		// while still letting spies observe call-site arguments.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders nothing when mode is null', () => {
		renderWithProvider( <Harness connectionId={ 42 } /> );
		expect( screen.queryByRole( 'dialog' ) ).toBeNull();
	} );

	it( 'opens with reply title and pinned context when triggered', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		expect( await screen.findByRole( 'dialog', { name: /reply/i } ) ).toBeVisible();
		expect( screen.getByText( /Excited to share/ ) ).toBeVisible();
		await waitFor( () => expect( screen.getByRole( 'textbox' ) ).toHaveFocus() );
	} );

	it( 'submits and closes on Post click', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
	} );

	it( 'shows discard-confirm when closing with unsaved text', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.keyboard( '{Escape}' );
		expect( await screen.findByRole( 'button', { name: /discard/i } ) ).toBeVisible();
	} );

	it( 'closes immediately when Escape is pressed with empty text', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.keyboard( '{Escape}' );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
	} );

	it( 'maps 502 to the upstream-unavailable copy', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		expect( await screen.findByText( /taking longer than usual/i ) ).toBeVisible();
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'hi' );
	} );

	it( 'maps 401 to a Reconnect link with target=_blank', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 401, { error: 'atmosphere_auth_required' } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		const reconnect = await screen.findByRole( 'link', { name: /reconnect/i } );
		expect( reconnect ).toHaveAttribute( 'href', '/reader/atmosphere/connect' );
		expect( reconnect ).toHaveAttribute( 'target', '_blank' );
		expect( reconnect ).toHaveAttribute( 'rel', expect.stringContaining( 'noopener' ) );
	} );

	it( 'fires _reply_composer_opened on open and _reply_published on success', async () => {
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );

		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_reply_composer_opened',
				expect.objectContaining( {
					connection_id: 42,
					parent_uri: 'at://p',
					root_uri: 'at://r',
				} )
			)
		);

		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_reply_published',
				expect.objectContaining( {
					connection_id: 42,
					parent_uri: 'at://p',
					root_uri: 'at://r',
				} )
			)
		);
	} );

	// jsdom does not implement the browser focus-trap that
	// `@wordpress/components` Modal uses (it relies on real focusable-
	// element traversal, which jsdom only partially models — the first
	// Tab from the textarea lands on `document.body` instead of
	// wrapping). Real browsers handle this correctly, and Playwright
	// E2E coverage backs it up. Keeping the test in source as `.skip`
	// so the intent is documented for the next time the modal wrapper
	// changes.
	it.skip( 'traps focus inside the dialog', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );

		const dialog = await screen.findByRole( 'dialog' );

		for ( let i = 0; i < 3; i++ ) {
			await user.tab();
			expect( document.activeElement ).not.toBe( document.body );
			expect( dialog.contains( document.activeElement ) ).toBe( true );
		}
	} );

	it( 'exposes the count via aria-describedby on the textarea', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );

		const textbox = screen.getByRole( 'textbox' );
		const id = textbox.getAttribute( 'aria-describedby' );
		expect( id ).toBeTruthy();
		const count = document.getElementById( id! );
		expect( count ).toBeVisible();
	} );

	it( 'media button is aria-disabled and tab-reachable inside the dialog', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );

		const media = screen.getByRole( 'button', { name: /add media/i } );
		expect( media ).toHaveAttribute( 'aria-disabled', 'true' );
		// The native HTML `disabled` attribute would remove the button
		// from the tab order. We use aria-disabled so screen-reader
		// users can reach the placeholder while it remains inert.
		expect( media ).not.toBeDisabled();
	} );

	it( 'Cmd+Enter on empty text does not POST (matches the disabled Post button)', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		// Focus is on the textarea (asserted elsewhere); fire the shortcut.
		await user.keyboard( '{Meta>}{Enter}{/Meta}' );

		// Network was never hit; modal stays open.
		expect( scope.isDone() ).toBe( false );
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		nock.cleanAll();
	} );

	it( 'Cmd+Enter when text exceeds the limit does not POST', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		// 301 chars of plain ASCII = 301 graphemes (LIMIT is 300).
		await user.type( screen.getByRole( 'textbox' ), 'a'.repeat( 301 ) );
		await user.keyboard( '{Meta>}{Enter}{/Meta}' );

		expect( scope.isDone() ).toBe( false );
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		nock.cleanAll();
	}, 15_000 );

	it( 'Keep Editing returns to the draft with text preserved', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.keyboard( '{Escape}' );

		await user.click( await screen.findByRole( 'button', { name: /keep editing/i } ) );
		// Composer modal still mounted, draft preserved.
		expect( screen.getByRole( 'dialog', { name: /reply/i } ) ).toBeVisible();
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'hi' );
		// Discard confirm gone.
		expect( screen.queryByRole( 'button', { name: /^discard$/i } ) ).toBeNull();
	} );

	it( 'Discard closes both modals and clears the draft', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.keyboard( '{Escape}' );

		await user.click( await screen.findByRole( 'button', { name: /^discard$/i } ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );

		// Reopening the composer starts from a clean draft.
		await user.click( screen.getByText( 'open' ) );
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( '' );
	} );

	it( 'recovers after a bad_request error: edit, resubmit, success closes the modal', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 400, { error: 'atmosphere_bad_request' } );
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		// First submit: error banner appears, modal stays open.
		expect( await screen.findByText( /shorten/i ) ).toBeVisible();
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();

		// Edit and resubmit.
		await user.type( screen.getByRole( 'textbox' ), ' more' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		// Modal closes after the successful retry.
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
	} );
} );
