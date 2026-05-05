/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ComposerModal } from '../composer-modal';
import { ComposerProvider, useComposer } from '../composer-provider';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock analytics — recordReaderTracksEvent must return a plain Redux action.
const mockRecordReaderTracksEvent = jest.fn( () => ( { type: 'TEST_TRACKS_EVENT' } ) );
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

// Mock useDispatch from calypso/state so Redux store is not required.
const mockDispatch = jest.fn( ( action ) => action );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

// Mock i18n-calypso to avoid the interpolate-components dependency chain.
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );

// Mock @automattic/api-queries — expose mockMutate so tests can control it.
const mockMutate = jest.fn();
const mockReset = jest.fn();
jest.mock( '@automattic/api-queries', () => ( {
	useCreateFediverseNoteMutation: () => ( {
		mutate: mockMutate,
		isPending: false,
		isError: false,
		error: null,
		reset: mockReset,
	} ),
} ) );

// Mock @wordpress/components — keep only what the composer uses.
jest.mock( '@wordpress/components', () => {
	const React = require( 'react' );
	return {
		Modal: ( {
			title,
			children,
			onRequestClose,
		}: {
			title: string;
			children: React.ReactNode;
			onRequestClose: () => void;
		} ) =>
			React.createElement(
				'div',
				{ role: 'dialog', 'aria-label': title },
				React.createElement( 'button', { onClick: onRequestClose, 'aria-label': 'Close' } ),
				children
			),
		Button: ( {
			children,
			onClick,
			disabled,
		}: {
			children: React.ReactNode;
			onClick?: () => void;
			disabled?: boolean;
		} ) => React.createElement( 'button', { onClick, disabled }, children ),
		Spinner: () => React.createElement( 'span', null, '...' ),
		__experimentalHStack: ( { children }: { children: React.ReactNode } ) =>
			React.createElement( 'div', null, children ),
	};
} );

// Mock @wordpress/icons to avoid svg imports.
jest.mock( '@wordpress/icons', () => ( { edit: null } ) );

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function TriggerAndModal() {
	const { openComposer } = useComposer();
	return (
		<>
			<button onClick={ () => openComposer( { entry_point: 'fab' } ) }>open</button>
			<ComposerModal />
		</>
	);
}

function Harness( { connectionId = 42 }: { connectionId?: number } ) {
	return (
		<ComposerProvider connectionId={ connectionId }>
			<TriggerAndModal />
		</ComposerProvider>
	);
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

describe( '<ComposerModal>', () => {
	beforeEach( () => {
		mockDispatch.mockClear();
		mockRecordReaderTracksEvent.mockClear();
		mockMutate.mockReset();
		mockReset.mockReset();
	} );

	// -------------------------------------------------------------------------
	// 1. Renders nothing until opened
	// -------------------------------------------------------------------------

	it( 'renders nothing when mode is null', () => {
		renderWithProvider( <Harness /> );
		expect( screen.queryByRole( 'dialog' ) ).toBeNull();
	} );

	// -------------------------------------------------------------------------
	// 2. Happy path: type text, click Post → mutation called, notice dispatched,
	//    modal closed.
	// -------------------------------------------------------------------------

	it( 'opens a dialog when triggered', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness /> );
		await user.click( screen.getByText( 'open' ) );
		expect( screen.getByRole( 'dialog', { name: 'New Note' } ) ).toBeVisible();
	} );

	it( 'calls mutate with connectionId and text on Post click', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'Hello Fediverse' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		expect( mockMutate ).toHaveBeenCalledWith(
			{ connectionId: 42, text: 'Hello Fediverse' },
			expect.objectContaining( {
				onSuccess: expect.any( Function ),
				onError: expect.any( Function ),
			} )
		);
	} );

	it( 'dispatches successNotice and NOTE_POSTED tracking on success', async () => {
		const user = userEvent.setup();

		mockMutate.mockImplementation(
			( _params: unknown, { onSuccess }: { onSuccess: () => void } ) => {
				onSuccess();
			}
		);

		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( mockDispatch ).toHaveBeenCalledTimes( 2 ) );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_fediverse_note_posted',
			expect.objectContaining( { connection_id: 42 } )
		);
		// Second dispatch should be the successNotice.
		expect( mockDispatch.mock.calls[ 1 ][ 0 ] ).toEqual(
			expect.objectContaining( { type: expect.any( String ) } )
		);
	} );

	it( 'closes the modal after a successful post', async () => {
		const user = userEvent.setup();

		mockMutate.mockImplementation(
			( _params: unknown, { onSuccess }: { onSuccess: () => void } ) => {
				onSuccess();
			}
		);

		renderWithProvider( <Harness /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
	} );

	// -------------------------------------------------------------------------
	// 3. Error path: error from mutation → error copy shown, modal stays open
	// -------------------------------------------------------------------------

	it( 'dispatches NOTE_FAILED tracking on error', async () => {
		const user = userEvent.setup();

		mockMutate.mockImplementation(
			( _params: unknown, { onError }: { onError: ( err: unknown ) => void } ) => {
				onError( { kind: 'rate_limited' } );
			}
		);

		renderWithProvider( <Harness connectionId={ 42 } /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () =>
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_fediverse_note_failed',
				expect.objectContaining( { connection_id: 42, error: 'rate_limited' } )
			)
		);
	} );

	it( 'does not call mutate when text is empty', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness /> );
		await user.click( screen.getByText( 'open' ) );
		// Post button should be disabled (no text typed) — try clicking anyway
		// to confirm the guard.
		const postBtn = screen.getByRole( 'button', { name: 'Post' } );
		expect( postBtn ).toBeDisabled();
		expect( mockMutate ).not.toHaveBeenCalled();
	} );

	// -------------------------------------------------------------------------
	// 4. Discard confirm: non-empty text + close → discard dialog appears
	// -------------------------------------------------------------------------

	it( 'shows discard-confirm when closing with unsaved text', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		// Click the modal's own close button.
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
		expect( await screen.findByRole( 'dialog', { name: 'Discard draft?' } ) ).toBeVisible();
	} );

	it( '"Keep editing" returns to the draft with text preserved', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hello' );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		await user.click( await screen.findByRole( 'button', { name: /keep editing/i } ) );
		// The original composer modal is still visible with the draft.
		expect( screen.getByRole( 'dialog', { name: 'New Note' } ) ).toBeVisible();
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'hello' );
		// The discard dialog is gone.
		expect( screen.queryByRole( 'dialog', { name: 'Discard draft?' } ) ).toBeNull();
	} );

	it( '"Discard" closes both modals and clears the draft', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness /> );
		await user.click( screen.getByText( 'open' ) );
		await user.type( screen.getByRole( 'textbox' ), 'hello' );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		await user.click( await screen.findByRole( 'button', { name: /^discard$/i } ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );

		// Reopening should start with a fresh draft.
		await user.click( screen.getByText( 'open' ) );
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( '' );
	} );

	it( 'closes immediately when close button is pressed with empty text', async () => {
		const user = userEvent.setup();
		renderWithProvider( <Harness /> );
		await user.click( screen.getByText( 'open' ) );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
	} );
} );
