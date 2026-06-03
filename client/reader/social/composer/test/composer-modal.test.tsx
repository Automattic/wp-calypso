/**
 * @jest-environment jsdom
 */
import { QueryClient, mutationOptions } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as noticeActions from 'calypso/state/notices/actions';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ComposerModal } from '../composer-modal';
import {
	ComposerProvider,
	useComposer,
	type ComposerMode,
	type PreviewPost,
} from '../composer-provider';
import { testComposerConfig } from '../test-config';
import type { ComposerConfig } from '../composer-config';
import type { Site } from '@automattic/api-core';

interface TestError {
	kind: string;
	message?: string;
}

interface TestParams {
	connectionId: number;
	text: string;
}

interface TestResult {
	uri: string;
}

const previewPost: PreviewPost = {
	uri: 'at://parent',
	cid: 'pcid',
	text: 'Hello',
	html: '<p>Hello</p>',
	author: {
		handle: 'alice.bsky.social',
		display_name: 'Alice',
	},
};

const standaloneMode: ComposerMode = { kind: 'standalone', entry_point: 'fab' };

const replyMode: ComposerMode = {
	kind: 'reply',
	root: { uri: 'at://root', cid: 'rcid' },
	parent: { uri: 'at://parent', cid: 'pcid' },
	previewPost,
};

const quoteMode: ComposerMode = {
	kind: 'quote',
	quote: { uri: 'at://quoted', cid: 'qcid' },
	previewPost,
};

let openFn: ( ( m: ComposerMode ) => void ) | null = null;
let closeFn: ( () => void ) | null = null;

function Capture() {
	const { openComposer, closeComposer } = useComposer();
	openFn = openComposer;
	closeFn = closeComposer;
	return null;
}

function makeQueryClient() {
	return new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	} );
}

function renderModal( config: ComposerConfig< TestError, TestParams, TestResult > ) {
	const queryClient = makeQueryClient();
	const utils = renderWithProvider(
		<ComposerProvider connectionId={ 7 } config={ config }>
			<Capture />
			<ComposerModal />
		</ComposerProvider>,
		{ queryClient }
	);
	return { ...utils, queryClient };
}

describe( '<ComposerModal>', () => {
	beforeEach( () => {
		openFn = null;
		closeFn = null;

		// recordReaderTracksEvent is a thunk that reads the follows query cache.
		// Replace it with a no-op action creator so dispatch() doesn't throw,
		// while still letting spies observe call-site arguments.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
		jest.spyOn( noticeActions, 'successNotice' );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'returns null when mode is null', () => {
		const { container } = renderModal( testComposerConfig );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the title and placeholder from config.copy for each mode kind', () => {
		const { rerender, queryClient } = renderModal( testComposerConfig );

		act( () => openFn?.( standaloneMode ) );
		expect( screen.getByRole( 'dialog', { name: 'Title:standalone' } ) ).toBeVisible();
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute(
			'placeholder',
			'Placeholder:standalone'
		);

		act( () => closeFn?.() );
		act( () => openFn?.( replyMode ) );
		expect( screen.getByRole( 'dialog', { name: 'Title:reply' } ) ).toBeVisible();
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'placeholder', 'Placeholder:reply' );

		act( () => closeFn?.() );
		act( () => openFn?.( quoteMode ) );
		expect( screen.getByRole( 'dialog', { name: 'Title:quote' } ) ).toBeVisible();
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'placeholder', 'Placeholder:quote' );

		// Touch the unused bindings so TS / lint don't trip on them.
		void rerender;
		void queryClient;
	} );

	it( 'passes config.headerIcon to the Modal and calls config.useAuthorHandle for the title', () => {
		const useAuthorHandle = jest.fn( ( id: number | null ) =>
			id === 7 ? 'jordesign.bsky.social' : null
		);
		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			useAuthorHandle,
			headerIcon: <span data-testid="composer-header-icon" />,
			copy: {
				...testComposerConfig.copy,
				title: ( mode, _t, handle ) =>
					handle ? `Title:${ mode.kind } · @${ handle }` : `Title:${ mode.kind }`,
			},
		};
		renderModal( config );

		act( () => openFn?.( standaloneMode ) );

		expect( useAuthorHandle ).toHaveBeenCalledWith( 7 );
		expect(
			screen.getByRole( 'dialog', { name: 'Title:standalone · @jordesign.bsky.social' } )
		).toBeVisible();
		expect( screen.getByTestId( 'composer-header-icon' ) ).toBeVisible();
	} );

	it( 'falls back to the bare title when config.useAuthorHandle returns null', () => {
		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			useAuthorHandle: () => null,
			copy: {
				...testComposerConfig.copy,
				title: ( mode, _t, handle ) =>
					handle ? `Title:${ mode.kind } · @${ handle }` : `Title:${ mode.kind }`,
			},
		};
		renderModal( config );

		act( () => openFn?.( standaloneMode ) );

		expect( screen.getByRole( 'dialog', { name: 'Title:standalone' } ) ).toBeVisible();
	} );

	it( 'fires tracks.opened on mount when a mode is active', () => {
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		renderModal( testComposerConfig );

		act( () => openFn?.( replyMode ) );

		expect( recordSpy ).toHaveBeenCalledWith(
			'test_composer_opened_reply',
			expect.objectContaining( { connection_id: 7 } )
		);
	} );

	it( 'disables the Post button when the textarea is empty', () => {
		renderModal( testComposerConfig );
		act( () => openFn?.( standaloneMode ) );

		expect( screen.getByRole( 'button', { name: /post/i } ) ).toBeDisabled();
	} );

	it( 'seeds the textarea with mode.initialText when opening in standalone mode', () => {
		renderModal( testComposerConfig );
		act(
			() =>
				openFn?.( {
					kind: 'standalone',
					entry_point: 'fab',
					initialText: '@alice.bsky.social ',
				} )
		);

		expect( screen.getByRole( 'textbox' ) ).toHaveValue( '@alice.bsky.social ' );
	} );

	it( 'does not reseed initialText when mode changes while the composer stays open', async () => {
		// Regression test for the `prevModeRef` guard: re-firing the seed
		// branch on a mode-reference change while non-null would wipe the
		// user's in-flight typing.
		const user = userEvent.setup();
		renderModal( testComposerConfig );

		act(
			() =>
				openFn?.( {
					kind: 'standalone',
					entry_point: 'fab',
					initialText: '@alice.bsky.social ',
				} )
		);
		await user.type( screen.getByRole( 'textbox' ), 'hello' );
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( '@alice.bsky.social hello' );

		// Re-open with a fresh mode object (different ref, same kind +
		// initialText). The guard should suppress the seed so the user's
		// typing survives.
		act(
			() =>
				openFn?.( {
					kind: 'standalone',
					entry_point: 'fab',
					initialText: '@bob.bsky.social ',
				} )
		);

		expect( screen.getByRole( 'textbox' ) ).toHaveValue( '@alice.bsky.social hello' );
	} );

	it( 'disables the Post button when grapheme count exceeds config.limit', async () => {
		const user = userEvent.setup();
		const tinyLimitConfig: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			useLimit: () => 5,
		};
		renderModal( tinyLimitConfig );

		act( () => openFn?.( standaloneMode ) );
		await user.type( screen.getByRole( 'textbox' ), 'too long for limit' );

		expect( screen.getByRole( 'button', { name: /post/i } ) ).toBeDisabled();
	} );

	it( 'submits on Cmd+Enter when the text is valid', async () => {
		const user = userEvent.setup();
		const mutationFn = jest.fn(
			() =>
				new Promise< TestResult >( () => {
					/* never resolves */
				} )
		);
		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			mutationFactory: () => mutationOptions< TestResult, TestError, TestParams >( { mutationFn } ),
		};

		renderModal( config );
		act( () => openFn?.( standaloneMode ) );

		await user.type( screen.getByRole( 'textbox' ), 'hello' );
		await user.keyboard( '{Meta>}{Enter}{/Meta}' );

		await waitFor( () =>
			expect( mutationFn ).toHaveBeenCalledWith( { connectionId: 7, text: 'hello' } )
		);
	} );

	it( 'on success, fires tracks.published, dispatches successNotice, and closes the composer', async () => {
		const user = userEvent.setup();
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		const successSpy = noticeActions.successNotice as unknown as jest.Mock;

		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			mutationFactory: () =>
				mutationOptions< TestResult, TestError, TestParams >( {
					mutationFn: async () => ( { uri: 'at://posted' } ),
				} ),
		};

		renderModal( config );
		act( () => openFn?.( standaloneMode ) );

		await user.type( screen.getByRole( 'textbox' ), 'hello' );
		await user.click( screen.getByRole( 'button', { name: /post/i } ) );

		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'test_composer_published_standalone',
				expect.objectContaining( { connection_id: 7 } )
			)
		);
		expect( successSpy ).toHaveBeenCalledWith( 'Posted.', undefined );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
	} );

	it( 'on error, shows config.errorMessage and fires tracks.errorShown', async () => {
		const user = userEvent.setup();
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;

		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			mutationFactory: () =>
				mutationOptions< TestResult, TestError, TestParams >( {
					mutationFn: () => Promise.reject( { kind: 'rate_limited' } as TestError ),
				} ),
		};

		renderModal( config );
		act( () => openFn?.( standaloneMode ) );

		await user.type( screen.getByRole( 'textbox' ), 'hello' );
		await user.click( screen.getByRole( 'button', { name: /post/i } ) );

		await screen.findByText( 'error: rate_limited' );

		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'test_composer_error_standalone',
				expect.objectContaining( { connection_id: 7, error_kind: 'rate_limited' } )
			)
		);
		// Modal stays open after the error.
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
	} );

	it( 'shows the discard confirm when text is non-empty: Keep editing cancels, Discard closes', async () => {
		const user = userEvent.setup();
		renderModal( testComposerConfig );

		act( () => openFn?.( standaloneMode ) );
		await user.type( screen.getByRole( 'textbox' ), 'draft text' );

		// Click the Modal close button. WP Modal exposes it as
		// "Close" via aria-label.
		await user.click( screen.getByRole( 'button', { name: /close/i } ) );

		// The discard confirm dialog opens.
		const keepEditing = await screen.findByRole( 'button', { name: 'Keep editing' } );
		await user.click( keepEditing );

		// Original composer dialog still mounted.
		expect( screen.getByRole( 'dialog', { name: 'Title:standalone' } ) ).toBeVisible();
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'draft text' );

		// Re-open the discard confirm and click Discard this time.
		await user.click( screen.getByRole( 'button', { name: /close/i } ) );
		await user.click( await screen.findByRole( 'button', { name: 'Discard' } ) );

		// Both dialogs gone.
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
	} );

	it( 'awaits a Promise returned by extendBuildParams before calling mutate', async () => {
		const user = userEvent.setup();
		let resolveExtend: ( v: unknown ) => void = () => {};
		const extendPromise = new Promise( ( resolve ) => {
			resolveExtend = resolve;
		} );
		const mutationFn = jest.fn( async ( params: TestParams ): Promise< TestResult > => {
			void params;
			return { uri: 'at://posted' };
		} );

		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			mutationFactory: () => mutationOptions< TestResult, TestError, TestParams >( { mutationFn } ),
			useMedia: () => ( {
				hasAny: false,
				hasUploaded: true,
				isAllUploaded: true,
				isAnyPending: false,
				renderGrid: () => null,
				renderFooterTrigger: () => null,
				extendBuildParams: () => extendPromise,
				onPublishSuccess: () => undefined,
				clear: () => undefined,
			} ),
		};

		renderModal( config );
		act( () => openFn?.( standaloneMode ) );

		await user.type( screen.getByRole( 'textbox' ), 'hello' );
		await user.click( screen.getByRole( 'button', { name: /post/i } ) );

		// The mutation is gated on the extendBuildParams Promise resolving.
		expect( mutationFn ).not.toHaveBeenCalled();

		await act( async () => {
			resolveExtend( { connectionId: 7, text: 'hello', media_ids: [ 'a' ] } );
			await extendPromise;
		} );

		await waitFor( () => expect( mutationFn ).toHaveBeenCalledTimes( 1 ) );
		expect( mutationFn.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			media_ids: [ 'a' ],
		} );
	} );

	it( 'surfaces an extendBuildParams rejection as a composer error: errorMessage shown, tracks.errorShown fired, mutation.mutate not called', async () => {
		const user = userEvent.setup();
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		const errorMessageSpy = jest.fn( ( error: TestError ) => `error: ${ error.kind }` );

		const mutationFn = jest.fn( async ( params: TestParams ): Promise< TestResult > => {
			void params;
			return { uri: 'at://posted' };
		} );
		const rejection: TestError = { kind: 'media_too_large' };

		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			mutationFactory: () => mutationOptions< TestResult, TestError, TestParams >( { mutationFn } ),
			errorMessage: errorMessageSpy,
			useMedia: () => ( {
				hasAny: true,
				hasUploaded: true,
				isAllUploaded: true,
				isAnyPending: false,
				renderGrid: () => null,
				renderFooterTrigger: () => null,
				extendBuildParams: () => Promise.reject( rejection ),
				onPublishSuccess: () => undefined,
				clear: () => undefined,
			} ),
		};

		renderModal( config );
		act( () => openFn?.( standaloneMode ) );

		await user.type( screen.getByRole( 'textbox' ), 'hello' );
		await user.click( screen.getByRole( 'button', { name: /post/i } ) );

		// User-facing error notice rendered with the rejection.
		await screen.findByText( 'error: media_too_large' );

		// errorMessage callback received the same rejection object.
		expect( errorMessageSpy ).toHaveBeenCalledWith( rejection, expect.anything() );

		// errorShown analytics fired with the rejection's kind.
		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'test_composer_error_standalone',
				expect.objectContaining( { connection_id: 7, error_kind: 'media_too_large' } )
			)
		);

		// Crucially, the mutation was never run — the rejection short-circuits
		// the post-mutation path.
		expect( mutationFn ).not.toHaveBeenCalled();

		// Modal stays open after the error.
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
	} );

	it( 'composes media and protocol-extras triggers into footerStart', () => {
		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			useMedia: () => ( {
				hasAny: false,
				hasUploaded: false,
				isAllUploaded: true,
				isAnyPending: false,
				renderGrid: () => null,
				renderFooterTrigger: () => (
					<button type="button" data-testid="media-trigger">
						Media
					</button>
				),
				extendBuildParams: ( params ) => params,
				onPublishSuccess: () => undefined,
				clear: () => undefined,
			} ),
			useProtocolExtras: () => ( {
				renderControls: () => null,
				renderTrigger: () => (
					<button type="button" data-testid="extras-trigger">
						Extras
					</button>
				),
				extendBuildParams: ( params ) => params,
			} ),
		};

		renderModal( config );
		act( () => openFn?.( standaloneMode ) );

		expect( screen.getByTestId( 'media-trigger' ) ).toBeVisible();
		expect( screen.getByTestId( 'extras-trigger' ) ).toBeVisible();
	} );

	it( 'merges getTracksProps() into the published tracks event props', async () => {
		const user = userEvent.setup();
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;

		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			mutationFactory: () =>
				mutationOptions< TestResult, TestError, TestParams >( {
					mutationFn: async () => ( { uri: 'at://posted' } ),
				} ),
			useProtocolExtras: () => ( {
				renderControls: () => null,
				renderTrigger: () => null,
				extendBuildParams: ( params ) => params,
				getTracksProps: () => ( { reply_allow_kind: 'combo', allow_quotes: false } ),
			} ),
		};

		renderModal( config );
		act( () => openFn?.( standaloneMode ) );

		await user.type( screen.getByRole( 'textbox' ), 'Hello' );
		await user.click( screen.getByRole( 'button', { name: /post/i } ) );

		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'test_composer_published_standalone',
				expect.objectContaining( {
					connection_id: 7,
					reply_allow_kind: 'combo',
					allow_quotes: false,
				} )
			)
		);
	} );

	it( 'canonical tracks props win when getTracksProps() returns a colliding key', async () => {
		const user = userEvent.setup();
		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;

		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			mutationFactory: () =>
				mutationOptions< TestResult, TestError, TestParams >( {
					mutationFn: async () => ( { uri: 'at://posted' } ),
				} ),
			useProtocolExtras: () => ( {
				renderControls: () => null,
				renderTrigger: () => null,
				extendBuildParams: ( params ) => params,
				// Try to clobber a canonical prop — the modal must not let this through.
				getTracksProps: () => ( { connection_id: 999, my_extra: 'kept' } ),
			} ),
		};

		renderModal( config );
		act( () => openFn?.( standaloneMode ) );

		await user.type( screen.getByRole( 'textbox' ), 'Hello' );
		await user.click( screen.getByRole( 'button', { name: /post/i } ) );

		await waitFor( () =>
			expect( recordSpy ).toHaveBeenCalledWith(
				'test_composer_published_standalone',
				expect.objectContaining( { connection_id: 7, my_extra: 'kept' } )
			)
		);
	} );

	it( 'fires config.logBadRequest when an error of kind bad_request arrives', async () => {
		const user = userEvent.setup();
		const logBadRequest = jest.fn();
		const error: TestError = { kind: 'bad_request', message: 'why' };

		const config: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			mutationFactory: () =>
				mutationOptions< TestResult, TestError, TestParams >( {
					mutationFn: () => Promise.reject( error ),
				} ),
			logBadRequest,
		};

		renderModal( config );
		act( () => openFn?.( standaloneMode ) );

		await user.type( screen.getByRole( 'textbox' ), 'hello' );
		await user.click( screen.getByRole( 'button', { name: /post/i } ) );

		await waitFor( () => expect( logBadRequest ).toHaveBeenCalledTimes( 1 ) );
		expect( logBadRequest ).toHaveBeenCalledWith(
			expect.objectContaining( { kind: 'standalone', connectionId: 7 } ),
			error
		);
	} );
} );

describe( '<ComposerModal> — markOverLimit', () => {
	beforeEach( () => {
		openFn = null;
		closeFn = null;

		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
		jest.spyOn( noticeActions, 'successNotice' );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'sets hasBeenOverLimit on the context once the user types past the limit', async () => {
		const user = userEvent.setup();
		const tinyLimitConfig: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			useLimit: () => 5,
		};

		const probe: { current: ReturnType< typeof useComposer > | null } = { current: null };
		function Probe() {
			probe.current = useComposer();
			return null;
		}

		const queryClient = makeQueryClient();
		renderWithProvider(
			<ComposerProvider connectionId={ 7 } config={ tinyLimitConfig }>
				<Probe />
				<Capture />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient }
		);

		act( () => openFn?.( standaloneMode ) );
		expect( probe.current?.hasBeenOverLimit ).toBe( false );

		await user.type( screen.getByRole( 'textbox' ), 'this is over the limit' );

		expect( probe.current?.hasBeenOverLimit ).toBe( true );
	} );
} );

const ORIGIN = 'https://public-api.wordpress.com';

afterEach( () => nock.cleanAll() );

describe( '<ComposerModal> — overflow handoff visibility', () => {
	beforeEach( () => {
		// Re-establish spies for the new describe block (Jest doesn't share `beforeEach` across siblings).
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
		jest.spyOn( noticeActions, 'successNotice' );
		openFn = null;
		closeFn = null;
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'shows the overflow section after typing past the limit and keeps it visible after trimming back under', async () => {
		const user = userEvent.setup();
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/sites/ )
			.reply( 200, {
				sites: [
					{
						ID: 100,
						name: 'My Blog',
						slug: 'myblog.wordpress.com',
						URL: 'https://myblog.wordpress.com',
						site_migration: { in_progress: false, is_complete: false },
						options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
					} as Partial< Site >,
				],
			} );

		const tinyLimitConfig: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			useLimit: () => 5,
		};
		renderModal( tinyLimitConfig );

		act( () => openFn?.( standaloneMode ) );

		const textarea = screen.getByRole( 'textbox' );
		await user.type( textarea, 'this is way past the test fixture five-character limit' );

		expect(
			await screen.findByRole( 'region', { name: /Publish on your own site/i } )
		).toBeVisible();

		await user.clear( textarea );
		await user.type( textarea, 'ok' );

		expect( screen.getByRole( 'region', { name: /Publish on your own site/i } ) ).toBeVisible();
	} );

	it( 'hides the overflow section after the modal closes and reopens (flag resets)', async () => {
		const user = userEvent.setup();
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/sites/ )
			.reply( 200, { sites: [] } );

		const tinyLimitConfig: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			useLimit: () => 5,
		};

		const probe: { current: ReturnType< typeof useComposer > | null } = { current: null };
		function Probe() {
			probe.current = useComposer();
			return null;
		}

		const queryClient = makeQueryClient();
		renderWithProvider(
			<ComposerProvider connectionId={ 7 } config={ tinyLimitConfig }>
				<Probe />
				<Capture />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient }
		);

		act( () => openFn?.( standaloneMode ) );
		const textarea = screen.getByRole( 'textbox' );
		await user.type( textarea, 'overflow xyz xyz' );
		expect( probe.current!.hasBeenOverLimit ).toBe( true );

		act( () => closeFn?.() );
		act( () => openFn?.( standaloneMode ) );

		expect( probe.current!.hasBeenOverLimit ).toBe( false );
	} );
} );
