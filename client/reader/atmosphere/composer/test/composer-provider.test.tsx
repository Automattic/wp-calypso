/**
 * @jest-environment jsdom
 */
import { render, renderHook, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ComposerProvider, useComposer } from '../composer-provider';

const wrap = ( connectionId: number ) =>
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return <ComposerProvider connectionId={ connectionId }>{ children }</ComposerProvider>;
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

		render( <Harness /> );
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
					{ mode && <button onClick={ closeComposer }>close</button> }
				</>
			);
		}

		render(
			<ComposerProvider connectionId={ 42 }>
				<FocusHarness />
			</ComposerProvider>
		);

		const openBtn = screen.getByRole( 'button', { name: 'open' } );
		openBtn.focus();
		await user.click( openBtn );
		const closeBtn = await screen.findByRole( 'button', { name: 'close' } );
		await user.click( closeBtn );
		expect( document.activeElement ).toBe( openBtn );
	} );

	it( 'throws if useComposer is called outside ComposerProvider', () => {
		expect( () => renderHook( () => useComposer() ) ).toThrow();
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
			<ComposerProvider connectionId={ 1 }>
				<TestConsumer />
			</ComposerProvider>
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
