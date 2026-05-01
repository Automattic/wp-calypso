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
} );
