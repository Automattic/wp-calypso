/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as noticeActions from 'calypso/state/notices/actions';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ComposerModal } from '../composer-modal';
import { ComposerProvider, useComposer } from '../composer-provider';
import { useImageUploads } from '../media/use-image-uploads';
import type { ComposerImage } from '../media/types';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

jest.mock( '../media/use-image-uploads', () => ( {
	useImageUploads: jest.fn(),
} ) );

const mockUseImageUploads = useImageUploads as jest.MockedFunction< typeof useImageUploads >;

function makeUploadedImage( id: string ): ComposerImage {
	return {
		kind: 'uploaded',
		localId: id,
		previewUrl: `blob:${ id }`,
		alt: '',
		aspectRatio: { width: 100, height: 100 },
		blob: { ref: { $link: id }, mimeType: 'image/jpeg', size: 100 } as never,
	};
}

function makeImageUploadsState(
	overrides: Partial< ReturnType< typeof useImageUploads > > = {}
): ReturnType< typeof useImageUploads > {
	return {
		images: [],
		addFiles: jest.fn(),
		removeImage: jest.fn(),
		clearAll: jest.fn(),
		retryImage: jest.fn(),
		setAlt: jest.fn(),
		isAllUploaded: true,
		isAnyPending: false,
		...overrides,
	};
}

function makePreview() {
	return {
		uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb',
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
						root: {
							uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/aaaaaaaaaaaaa',
							cid: 'rcid',
						},
						parent: {
							uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb',
							cid: 'pcid',
						},
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

function TriggerAndModalQuote() {
	const { openComposer } = useComposer();
	return (
		<>
			<button
				onClick={ () =>
					openComposer( {
						kind: 'quote',
						quote: {
							uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb',
							cid: 'pcid',
						},
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

function HarnessQuote( props: { connectionId: number } ) {
	return (
		<ComposerProvider connectionId={ props.connectionId }>
			<TriggerAndModalQuote />
		</ComposerProvider>
	);
}

function Harness( props: { connectionId: number } ) {
	return (
		<ComposerProvider connectionId={ props.connectionId }>
			<TriggerAndModal />
		</ComposerProvider>
	);
}

function TriggerAndModalInvalidUri() {
	const { openComposer } = useComposer();
	return (
		<>
			<button
				onClick={ () =>
					openComposer( {
						kind: 'reply',
						root: { uri: 'at://garbage', cid: 'rcid' },
						parent: { uri: 'at://garbage', cid: 'pcid' },
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

function HarnessInvalidUri( props: { connectionId: number } ) {
	return (
		<ComposerProvider connectionId={ props.connectionId }>
			<TriggerAndModalInvalidUri />
		</ComposerProvider>
	);
}

function TriggerAndModalStandalone( props: {
	entryPoint: 'timeline_inline' | 'profile_inline' | 'fab';
} ) {
	const { openComposer } = useComposer();
	return (
		<>
			<button
				onClick={ () =>
					openComposer( {
						kind: 'standalone',
						entry_point: props.entryPoint,
					} )
				}
			>
				open
			</button>
			<ComposerModal />
		</>
	);
}

function HarnessStandalone( props: {
	connectionId: number;
	entryPoint: 'timeline_inline' | 'profile_inline' | 'fab';
} ) {
	return (
		<ComposerProvider connectionId={ props.connectionId }>
			<TriggerAndModalStandalone entryPoint={ props.entryPoint } />
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
		jest.spyOn( noticeActions, 'successNotice' );
		( page as unknown as jest.Mock ).mockReset();
		mockUseImageUploads.mockReturnValue( makeImageUploadsState() );
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

	it.each( [
		[ 'atmosphere_text_too_long', 400, /your post is too long\. try shortening it\./i ] as const,
		[
			'atmosphere_reply_disabled',
			403,
			/the author has restricted who can reply to this post\./i,
		] as const,
		[ 'atmosphere_quote_disabled', 403, /this post can't be quoted\./i ] as const,
		[ 'atmosphere_target_unavailable', 404, /this post is no longer available\./i ] as const,
	] )( 'maps %s (HTTP %i) to its dedicated copy', async ( errorCode, status, copyMatcher ) => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( status, { error: errorCode } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		expect( await screen.findByText( copyMatcher ) ).toBeVisible();
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		// Text preserved so the user can edit and resubmit.
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'hi' );
	} );

	it( 'shows the bad_request copy after a /posts media rejection', async () => {
		// The slice-8a backend collapses every media-body validation
		// failure into the generic `atmosphere_bad_request` wire code (see
		// `reader-atmosphere/AGENTS.md` — "the wire stays stable"), so the
		// composer renders its existing `bad_request` copy rather than a
		// media-specific message.
		mockUseImageUploads.mockReturnValue(
			makeImageUploadsState( { images: [ makeUploadedImage( 'a' ) ] } )
		);

		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 400, { error: 'atmosphere_bad_request', message: 'Invalid media payload.' } );

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		expect( await screen.findByText( /we couldn't post this/i ) ).toBeVisible();
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
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
					parent_uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb',
					root_uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/aaaaaaaaaaaaa',
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
					parent_uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb',
					root_uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/aaaaaaaaaaaaa',
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

	it( 'media button opens the file picker when clicked', async () => {
		const addFiles = jest.fn();
		mockUseImageUploads.mockReturnValue( makeImageUploadsState( { addFiles } ) );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );

		const media = screen.getByRole( 'button', { name: 'Add media' } );
		// The hidden file input is a sibling of the button. Spy on its
		// .click() — the integration we care about is button → input.click().
		// Scope to the footer-left wrapper since <ImageGrid> can also render
		// a hidden file input once images are attached.
		const dialog = screen.getByRole( 'dialog' );
		const input = dialog.querySelector(
			'.atmosphere-composer__footer-left input[type="file"]'
		) as HTMLInputElement | null;
		expect( input ).not.toBeNull();
		const inputClickSpy = jest.spyOn( input as HTMLInputElement, 'click' );

		await user.click( media );
		expect( inputClickSpy ).toHaveBeenCalledTimes( 1 );

		// And once the input fires onChange (via userEvent.upload), addFiles
		// is invoked with the picked files. This proves the second half of
		// the wiring without depending on the browser's actual picker.
		const file = new File( [ 'x' ], 'a.jpg', { type: 'image/jpeg' } );
		await user.upload( input as HTMLInputElement, [ file ] );
		expect( addFiles ).toHaveBeenCalledTimes( 1 );
		expect( addFiles.mock.calls[ 0 ][ 0 ] ).toHaveLength( 1 );
		expect( addFiles.mock.calls[ 0 ][ 0 ][ 0 ].name ).toBe( 'a.jpg' );
	} );

	it( 'media button is disabled at 4 images and reads "Maximum 4 images"', async () => {
		mockUseImageUploads.mockReturnValue(
			makeImageUploadsState( {
				images: [
					makeUploadedImage( 'a' ),
					makeUploadedImage( 'b' ),
					makeUploadedImage( 'c' ),
					makeUploadedImage( 'd' ),
				],
			} )
		);

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );

		const media = screen.getByRole( 'button', { name: 'Maximum 4 images' } );
		expect( media ).toHaveAttribute( 'aria-disabled', 'true' );
		// We use aria-disabled (not the native HTML `disabled` attribute) so
		// screen-reader users can still focus the button and hear the label.
		expect( media ).not.toBeDisabled();
	} );

	it( 'renders the ImageGrid below the textarea when images are attached', async () => {
		mockUseImageUploads.mockReturnValue(
			makeImageUploadsState( { images: [ makeUploadedImage( 'a' ) ] } )
		);

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );

		// Grid renders an <img> for each uploaded thumbnail.
		const dialog = screen.getByRole( 'dialog' );
		const textbox = screen.getByRole( 'textbox' );
		const thumb = dialog.querySelector( '.atmosphere-composer__image-grid img' );
		expect( thumb ).not.toBeNull();
		// DOM order: textarea precedes the grid.
		expect(
			textbox.compareDocumentPosition( thumb as HTMLElement ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	it( 'enables Post when text is empty and one image is uploaded', async () => {
		mockUseImageUploads.mockReturnValue(
			makeImageUploadsState( { images: [ makeUploadedImage( 'a' ) ] } )
		);

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );

		expect( screen.getByRole( 'button', { name: 'Post' } ) ).toBeEnabled();
	} );

	it( 'submits with media payload (standalone mode)', async () => {
		mockUseImageUploads.mockReturnValue(
			makeImageUploadsState( { images: [ makeUploadedImage( 'a' ) ] } )
		);

		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts', ( body: unknown ) => {
				const b = body as {
					text?: string;
					media?: { images?: Array< { blob?: unknown; alt?: string } > };
				};
				return (
					b.text === '' &&
					Array.isArray( b.media?.images ) &&
					b.media?.images?.length === 1 &&
					b.media?.images?.[ 0 ]?.alt === '' &&
					!! b.media?.images?.[ 0 ]?.blob
				);
			} )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'submits with quote + media (recordWithMedia)', async () => {
		mockUseImageUploads.mockReturnValue(
			makeImageUploadsState( { images: [ makeUploadedImage( 'a' ) ] } )
		);

		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts', ( body: unknown ) => {
				const b = body as {
					text?: string;
					quote?: { uri?: string; cid?: string };
					media?: { images?: unknown[] };
				};
				return (
					b.text === 'q' &&
					b.quote?.uri ===
						'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb' &&
					b.quote?.cid === 'pcid' &&
					Array.isArray( b.media?.images ) &&
					b.media?.images?.length === 1
				);
			} )
			.reply( 200, { post: { uri: 'at://new-quote', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <HarnessQuote connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'q' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'shows DiscardConfirm when closing the modal with attached images and no text', async () => {
		mockUseImageUploads.mockReturnValue(
			makeImageUploadsState( { images: [ makeUploadedImage( 'a' ) ] } )
		);

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );
		await user.keyboard( '{Escape}' );

		expect( await screen.findByRole( 'button', { name: /^discard$/i } ) ).toBeVisible();
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

	it( 'dispatches a success notice with reply copy on publish', async () => {
		const successSpy = noticeActions.successNotice as unknown as jest.Mock;
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( successSpy ).toHaveBeenCalled() );
		expect( successSpy.mock.calls[ 0 ][ 0 ] ).toBe( 'Your reply was posted.' );
	} );

	it( 'success notice carries a View button that navigates to the parent thread', async () => {
		const successSpy = noticeActions.successNotice as unknown as jest.Mock;
		const pageMock = page as unknown as jest.Mock;

		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( successSpy ).toHaveBeenCalled() );

		const [ , options ] = successSpy.mock.calls[ 0 ];
		expect( options ).toEqual(
			expect.objectContaining( {
				button: 'View',
				onClick: expect.any( Function ),
			} )
		);

		options.onClick();
		expect( pageMock ).toHaveBeenCalledWith(
			'/reader/atmosphere/42/thread/did:plc:abcdefghijklmnopqrstuvwx/bbbbbbbbbbbbb'
		);
	} );

	it( 'fires _compose_error_shown once on a standalone mutation error', async () => {
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 429, { error: 'atmosphere_rate_limited' } );

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_compose_error_shown',
				expect.objectContaining( {
					connection_id: 42,
					error_kind: 'rate_limited',
				} )
			)
		);

		const composeErrorCalls = recordSpy.mock.calls.filter(
			( [ event ] ) => event === 'calypso_reader_atmosphere_compose_error_shown'
		);
		expect( composeErrorCalls ).toHaveLength( 1 );
	} );

	it( 'dedupes _compose_error_shown across two consecutive same-kind errors', async () => {
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 429, { error: 'atmosphere_rate_limited' } );
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 429, { error: 'atmosphere_rate_limited' } );

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () =>
			expect(
				recordSpy.mock.calls.filter(
					( [ event ] ) => event === 'calypso_reader_atmosphere_compose_error_shown'
				)
			).toHaveLength( 1 )
		);

		// Second submission yields the same error_kind — dedupe should hold.
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );

		const composeErrorCalls = recordSpy.mock.calls.filter(
			( [ event ] ) => event === 'calypso_reader_atmosphere_compose_error_shown'
		);
		expect( composeErrorCalls ).toHaveLength( 1 );
	} );

	it( 'fires _compose_error_shown again when the error_kind transitions', async () => {
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 429, { error: 'atmosphere_rate_limited' } );
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 400, { error: 'atmosphere_text_too_long' } );

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_compose_error_shown',
				expect.objectContaining( { error_kind: 'rate_limited' } )
			)
		);

		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_compose_error_shown',
				expect.objectContaining( { error_kind: 'text_too_long' } )
			)
		);

		const composeErrorCalls = recordSpy.mock.calls.filter(
			( [ event ] ) => event === 'calypso_reader_atmosphere_compose_error_shown'
		);
		expect( composeErrorCalls ).toHaveLength( 2 );
	} );

	it( 'fires _compose_error_shown again when the same kind recurs after a successful submission', async () => {
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		// Error → success → same error again. The ref guarding the dedupe
		// must reset after the success so the second error still emits.
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 429, { error: 'atmosphere_rate_limited' } );
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 429, { error: 'atmosphere_rate_limited' } );

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () =>
			expect(
				recordSpy.mock.calls.filter(
					( [ event ] ) => event === 'calypso_reader_atmosphere_compose_error_shown'
				)
			).toHaveLength( 1 )
		);

		// Successful submission closes the modal; reopen and submit again.
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );

		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () =>
			expect(
				recordSpy.mock.calls.filter(
					( [ event ] ) => event === 'calypso_reader_atmosphere_compose_error_shown'
				)
			).toHaveLength( 2 )
		);
	} );

	it.each( [ 'timeline_inline', 'profile_inline', 'fab' ] as const )(
		'fires _compose_opened with entry_point=%s when opened in standalone mode',
		async ( entryPoint ) => {
			const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
			const user = userEvent.setup();
			renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint={ entryPoint } /> );
			await user.click( screen.getByText( 'open' ) );

			await waitFor( () =>
				expect( recordSpy ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_compose_opened',
					expect.objectContaining( {
						connection_id: 42,
						entry_point: entryPoint,
					} )
				)
			);
		}
	);

	it( 'on standalone success, dispatches _compose_published, shows a "Your post was published." notice with a View action linking to the new post, and closes', async () => {
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		const successSpy = noticeActions.successNotice as unknown as jest.Mock;
		const pageMock = page as unknown as jest.Mock;

		const newPostUri = 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/ccccccccccccc';
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: newPostUri, cid: 'newcid', rkey: 'ccccccccccccc' } } );

		const user = userEvent.setup();
		renderWithProvider( <HarnessStandalone connectionId={ 42 } entryPoint="timeline_inline" /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );

		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_compose_published',
				expect.objectContaining( { connection_id: 42 } )
			)
		);

		await waitFor( () => expect( successSpy ).toHaveBeenCalled() );
		const [ noticeText, options ] = successSpy.mock.calls[ 0 ];
		expect( noticeText ).toBe( 'Your post was published.' );
		expect( options ).toEqual(
			expect.objectContaining( {
				button: 'View',
				onClick: expect.any( Function ),
			} )
		);

		options.onClick();
		expect( pageMock ).toHaveBeenCalledWith(
			'/reader/atmosphere/42/thread/did:plc:abcdefghijklmnopqrstuvwx/ccccccccccccc'
		);

		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
	} );

	it( 'omits the View button when the thread URL cannot be built', async () => {
		const successSpy = noticeActions.successNotice as unknown as jest.Mock;

		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

		const user = userEvent.setup();
		renderWithProvider( <HarnessInvalidUri connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( successSpy ).toHaveBeenCalled() );

		const [ text, options ] = successSpy.mock.calls[ 0 ];
		expect( text ).toBe( 'Your reply was posted.' );
		expect( options ).toBeUndefined();
	} );

	describe( 'quote mode', () => {
		it( 'fires _quote_composer_opened on open with quoted_uri', async () => {
			const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;

			const user = userEvent.setup();
			renderWithProvider( <HarnessQuote connectionId={ 42 } /> );
			await user.click( screen.getByText( 'open' ) );

			await waitFor( () =>
				expect( recordSpy ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_quote_composer_opened',
					expect.objectContaining( {
						connection_id: 42,
						quoted_uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb',
					} )
				)
			);
		} );

		it( 'sends body { text, quote: { uri, cid } } and fires _quote_published on success', async () => {
			const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;

			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/posts', ( body: unknown ) => {
					const b = body as {
						text?: string;
						quote?: { uri?: string; cid?: string };
						reply?: unknown;
					};
					return (
						b.text === 'hello quote' &&
						b.quote?.uri ===
							'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb' &&
						b.quote?.cid === 'pcid' &&
						! b.reply
					);
				} )
				.reply( 200, { post: { uri: 'at://new-quote', cid: 'newcid', rkey: 'abc' } } );

			const user = userEvent.setup();
			renderWithProvider( <HarnessQuote connectionId={ 42 } /> );
			await user.click( screen.getByText( 'open' ) );
			await user.type( screen.getByRole( 'textbox' ), 'hello quote' );
			await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

			await waitFor( () => expect( nock.isDone() ).toBe( true ) );
			await waitFor( () =>
				expect( recordSpy ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_quote_published',
					expect.objectContaining( {
						connection_id: 42,
						quoted_uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb',
						new_post_uri: 'at://new-quote',
					} )
				)
			);
		} );

		it( "success notice 'View' button links to getThreadUrl( connection_id, new_post.uri )", async () => {
			const successSpy = noticeActions.successNotice as unknown as jest.Mock;
			const pageMock = page as unknown as jest.Mock;

			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
				.reply( 200, {
					post: {
						uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/zzzzzzzzzzzzz',
						cid: 'newcid',
						rkey: 'abc',
					},
				} );

			const user = userEvent.setup();
			renderWithProvider( <HarnessQuote connectionId={ 42 } /> );
			await user.click( screen.getByText( 'open' ) );
			await user.type( screen.getByRole( 'textbox' ), 'quoting!' );
			await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

			await waitFor( () => expect( successSpy ).toHaveBeenCalled() );

			const [ noticeText, options ] = successSpy.mock.calls[ 0 ];
			expect( noticeText ).toBe( 'Your post was published.' );
			expect( options ).toEqual(
				expect.objectContaining( {
					button: 'View',
					onClick: expect.any( Function ),
				} )
			);

			options.onClick();
			expect( pageMock ).toHaveBeenCalledWith(
				'/reader/atmosphere/42/thread/did:plc:abcdefghijklmnopqrstuvwx/zzzzzzzzzzzzz'
			);
		} );

		it( 'fires _quote_error_shown once per error_kind transition', async () => {
			const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;

			// First submit → 502.
			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const user = userEvent.setup();
			renderWithProvider( <HarnessQuote connectionId={ 42 } /> );
			await user.click( screen.getByText( 'open' ) );
			await user.type( screen.getByRole( 'textbox' ), 'hi' );
			await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

			await waitFor( () =>
				expect( recordSpy ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_quote_error_shown',
					expect.objectContaining( {
						connection_id: 42,
						quoted_uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/bbbbbbbbbbbbb',
						error_kind: 'upstream_unavailable',
					} )
				)
			);

			const callCountAfterFirst = recordSpy.mock.calls.filter(
				( c: [ string, unknown ] ) => c[ 0 ] === 'calypso_reader_atmosphere_quote_error_shown'
			).length;

			// Second submit with the SAME error → no re-fire.
			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			await user.click( screen.getByRole( 'button', { name: 'Post' } ) );
			await waitFor( () => expect( nock.isDone() ).toBe( true ) );

			const callCountAfterSecond = recordSpy.mock.calls.filter(
				( c: [ string, unknown ] ) => c[ 0 ] === 'calypso_reader_atmosphere_quote_error_shown'
			).length;

			expect( callCountAfterSecond ).toBe( callCountAfterFirst );
		} );

		it( 'renders the quote_disabled error copy', async () => {
			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
				.reply( 403, { error: 'atmosphere_quote_disabled' } );

			const user = userEvent.setup();
			renderWithProvider( <HarnessQuote connectionId={ 42 } /> );
			await user.click( screen.getByText( 'open' ) );
			await user.type( screen.getByRole( 'textbox' ), 'hi' );
			await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

			expect( await screen.findByText( /this post can't be quoted\./i ) ).toBeVisible();
			expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		} );
	} );
} );
