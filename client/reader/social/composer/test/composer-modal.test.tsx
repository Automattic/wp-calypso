/**
 * @jest-environment jsdom
 */
import { QueryClient, mutationOptions } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

		// recordReaderTracksEvent is a thunk that reads state.reader.follows.
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

	it( 'disables the Post button when grapheme count exceeds config.limit', async () => {
		const user = userEvent.setup();
		const tinyLimitConfig: ComposerConfig< TestError, TestParams, TestResult > = {
			...testComposerConfig,
			limit: 5,
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
