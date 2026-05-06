/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { ComposerProvider, useComposer } from '../composer-provider';

// `ComposerProvider` consumes `useImageUploads`, which requires a
// `QueryClientProvider` in the tree, and dispatches Tracks events via
// `useDispatch`, which requires a Redux `<Provider>`. Each test gets its
// own client + a permissive noop store so cached state and dispatched
// actions never leak between cases.
function withProviders( ui: React.ReactNode ) {
	const store = createStore( ( s = {} ) => s, applyMiddleware( thunkMiddleware ) );
	return (
		<QueryClientProvider client={ new QueryClient() }>
			<Provider store={ store }>{ ui }</Provider>
		</QueryClientProvider>
	);
}

const wrap = ( connectionId: number ) =>
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return withProviders(
			<ComposerProvider connectionId={ connectionId }>{ children }</ComposerProvider>
		);
	};

describe( 'useComposer', () => {
	it( 'starts with mode = null', () => {
		const { result } = renderHook( () => useComposer(), { wrapper: wrap( 42 ) } );
		expect( result.current.mode ).toBeNull();
	} );

	it( 'openComposer sets mode + connectionId; closeComposer clears it', () => {
		const { result } = renderHook( () => useComposer(), { wrapper: wrap( 42 ) } );
		act( () => {
			result.current.openComposer( {
				kind: 'reply',
				root: { uri: 'at://r', cid: 'rcid' },
				parent: { uri: 'at://p', cid: 'pcid' },
				previewPost: makePreview( 'at://p' ),
			} );
		} );
		expect( result.current.mode ).toMatchObject( {
			kind: 'reply',
			connectionId: 42,
			root: { uri: 'at://r', cid: 'rcid' },
		} );
		act( () => result.current.closeComposer() );
		expect( result.current.mode ).toBeNull();
	} );

	it( 'snapshots connectionId at open time and ignores later prop changes', async () => {
		const user = userEvent.setup();

		function Probe() {
			const { mode } = useComposer();
			return <div data-testid="probe">{ mode?.connectionId ?? 'closed' }</div>;
		}

		function Opener() {
			const { openComposer } = useComposer();
			return (
				<button
					onClick={ () =>
						openComposer( {
							kind: 'reply',
							root: { uri: 'at://r', cid: 'rcid' },
							parent: { uri: 'at://p', cid: 'pcid' },
							previewPost: makePreview( 'at://p' ),
						} )
					}
				>
					open
				</button>
			);
		}

		function Harness() {
			const [ connectionId, setConnectionId ] = useState( 42 );
			return (
				<>
					<button onClick={ () => setConnectionId( 99 ) }>bump</button>
					<ComposerProvider connectionId={ connectionId }>
						<Probe />
						<Opener />
					</ComposerProvider>
				</>
			);
		}

		render( withProviders( <Harness /> ) );
		expect( screen.getByTestId( 'probe' ) ).toHaveTextContent( 'closed' );
		await user.click( screen.getByRole( 'button', { name: 'open' } ) );
		expect( screen.getByTestId( 'probe' ) ).toHaveTextContent( '42' );
		await user.click( screen.getByRole( 'button', { name: 'bump' } ) );
		expect( screen.getByTestId( 'probe' ) ).toHaveTextContent( '42' );
	} );

	it( 'restores focus to the trigger after the composer closes', async () => {
		const user = userEvent.setup();

		function FocusHarness() {
			const { openComposer, closeComposer, mode } = useComposer();
			return (
				<>
					<button
						onClick={ () =>
							openComposer( {
								kind: 'reply',
								root: { uri: 'at://r', cid: 'rcid' },
								parent: { uri: 'at://p', cid: 'pcid' },
								previewPost: makePreview( 'at://p' ),
							} )
						}
					>
						open
					</button>
					{ mode && <button onClick={ () => closeComposer() }>close</button> }
				</>
			);
		}

		render(
			withProviders(
				<ComposerProvider connectionId={ 42 }>
					<FocusHarness />
				</ComposerProvider>
			)
		);

		const openBtn = screen.getByRole( 'button', { name: 'open' } );
		openBtn.focus();
		await user.click( openBtn );
		const closeBtn = await screen.findByRole( 'button', { name: 'close' } );
		await user.click( closeBtn );
		expect( document.activeElement ).toBe( openBtn );
	} );

	it( 'throws if useComposer is called outside ComposerProvider', () => {
		expect( () =>
			renderHook( () => useComposer(), {
				wrapper: ( { children }: { children: React.ReactNode } ) => withProviders( children ),
			} )
		).toThrow();
	} );

	it( 'exposes the image-upload state machine through the composer context', () => {
		function Probe() {
			const ctx = useComposer();
			return (
				<ul data-testid="probe">
					{ 'images' in ctx && <li>images</li> }
					{ 'addFiles' in ctx && <li>addFiles</li> }
					{ 'removeImage' in ctx && <li>removeImage</li> }
					{ 'retryImage' in ctx && <li>retryImage</li> }
					{ 'setAlt' in ctx && <li>setAlt</li> }
					{ 'isAllUploaded' in ctx && <li>isAllUploaded</li> }
					{ 'isAnyPending' in ctx && <li>isAnyPending</li> }
				</ul>
			);
		}

		render(
			withProviders(
				<ComposerProvider connectionId={ 42 }>
					<Probe />
				</ComposerProvider>
			)
		);

		expect( screen.getByTestId( 'probe' ).children ).toHaveLength( 7 );
	} );

	it( 'preserves entry_point on standalone mode', async () => {
		const user = userEvent.setup();

		function TestConsumer() {
			const { mode, openComposer } = useComposer();
			return (
				<>
					<button onClick={ () => openComposer( { kind: 'standalone', entry_point: 'fab' } ) }>
						open
					</button>
					<span data-testid="entry">{ mode?.kind === 'standalone' ? mode.entry_point : '' }</span>
				</>
			);
		}

		render(
			withProviders(
				<ComposerProvider connectionId={ 1 }>
					<TestConsumer />
				</ComposerProvider>
			)
		);

		await user.click( screen.getByRole( 'button', { name: 'open' } ) );
		expect( screen.getByTestId( 'entry' ) ).toHaveTextContent( 'fab' );
	} );
} );

function makePreview( uri: string ) {
	return {
		uri,
		cid: 'c',
		author: { did: 'did:plc:x', handle: 'h', display_name: 'd', avatar: null },
		text: 't',
		html: '<p>t</p>',
	};
}
