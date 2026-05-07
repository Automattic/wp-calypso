/**
 * @jest-environment jsdom
 */
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	ComposerProvider,
	useComposer,
	useOptionalComposer,
	type ComposerMode,
	type PreviewPost,
} from '../composer-provider';
import { testComposerConfig } from '../test-config';
import type { ComposerConfig } from '../composer-config';
import type { ReactNode } from 'react';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapper( config: ComposerConfig< any, any, any > = testComposerConfig ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		return (
			<ComposerProvider connectionId={ 7 } config={ config }>
				{ children }
			</ComposerProvider>
		);
	};
}

describe( '<ComposerProvider>', () => {
	it( 'useComposer throws when called outside a provider', () => {
		// Suppress the React error-boundary console.error noise.
		const consoleSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		expect( () => renderHook( () => useComposer() ) ).toThrow(
			'useComposer must be called inside <ComposerProvider>'
		);

		consoleSpy.mockRestore();
	} );

	it( 'useOptionalComposer returns null outside a provider', () => {
		const { result } = renderHook( () => useOptionalComposer() );
		expect( result.current ).toBeNull();
	} );

	it( 'openComposer in standalone mode injects the connectionId', () => {
		const { result } = renderHook( () => useComposer(), { wrapper: wrapper() } );

		act( () => {
			result.current.openComposer( { kind: 'standalone', entry_point: 'fab' } );
		} );

		expect( result.current.mode ).toEqual( {
			kind: 'standalone',
			entry_point: 'fab',
			connectionId: 7,
		} );
	} );

	it( 'openComposer in reply mode carries root, parent, previewPost and the connectionId', () => {
		const { result } = renderHook( () => useComposer(), { wrapper: wrapper() } );

		const replyMode: ComposerMode = {
			kind: 'reply',
			root: { uri: 'at://root', cid: 'rcid' },
			parent: { uri: 'at://parent', cid: 'pcid' },
			previewPost,
		};

		act( () => {
			result.current.openComposer( replyMode );
		} );

		expect( result.current.mode ).toEqual( {
			kind: 'reply',
			connectionId: 7,
			root: { uri: 'at://root', cid: 'rcid' },
			parent: { uri: 'at://parent', cid: 'pcid' },
			previewPost,
		} );
	} );

	it( 'openComposer is a no-op for modes excluded from supportedModes', () => {
		const replyOnlyConfig: ComposerConfig< unknown, unknown, unknown > = {
			...testComposerConfig,
			supportedModes: [ 'reply' ],
		} as ComposerConfig< unknown, unknown, unknown >;

		const { result } = renderHook( () => useComposer(), {
			wrapper: wrapper( replyOnlyConfig ),
		} );

		act( () => {
			result.current.openComposer( {
				kind: 'quote',
				quote: { uri: 'at://quoted', cid: 'qcid' },
				previewPost,
			} );
		} );

		expect( result.current.mode ).toBeNull();
	} );

	it( 'closeComposer resets mode back to null', () => {
		const { result } = renderHook( () => useComposer(), { wrapper: wrapper() } );

		act( () => {
			result.current.openComposer( { kind: 'standalone', entry_point: 'fab' } );
		} );
		expect( result.current.mode ).not.toBeNull();

		act( () => {
			result.current.closeComposer();
		} );
		expect( result.current.mode ).toBeNull();
	} );

	it( 'restores focus to the previously-focused element when the composer closes', async () => {
		const user = userEvent.setup();

		let openFn: ( ( m: ComposerMode ) => void ) | null = null;
		let closeFn: ( () => void ) | null = null;
		function Capture() {
			const { openComposer, closeComposer } = useComposer();
			openFn = openComposer;
			closeFn = closeComposer;
			return null;
		}

		render(
			<>
				<button type="button">Open</button>
				<ComposerProvider connectionId={ 7 } config={ testComposerConfig }>
					<Capture />
				</ComposerProvider>
			</>
		);

		const trigger = screen.getByRole( 'button', { name: 'Open' } );

		// Focus the trigger via a user click so document.activeElement is set
		// the same way it is for real users.
		await user.click( trigger );
		expect( trigger ).toHaveFocus();

		act( () => {
			openFn?.( { kind: 'standalone', entry_point: 'fab' } );
		} );

		act( () => {
			closeFn?.();
		} );

		expect( trigger ).toHaveFocus();
	} );
} );
