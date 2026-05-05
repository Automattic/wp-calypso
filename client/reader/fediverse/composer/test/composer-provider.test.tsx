/**
 * @jest-environment jsdom
 */
import { render, renderHook, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ComposerProvider, useComposer, useOptionalComposer } from '../composer-provider';

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
			result.current.openComposer( { connectionId: 0, entry_point: 'fab' } );
		} );
		expect( result.current.mode ).toMatchObject( {
			connectionId: 42,
			entry_point: 'fab',
		} );
		act( () => result.current.closeComposer() );
		expect( result.current.mode ).toBeNull();
	} );

	it( 'stamps the provider connectionId onto the mode, ignoring the caller-supplied one', () => {
		const { result } = renderHook( () => useComposer(), { wrapper: wrap( 99 ) } );
		act( () => {
			// caller passes connectionId: 0 (the sentinel from ComposeFab)
			result.current.openComposer( { connectionId: 0, entry_point: 'fab' } );
		} );
		expect( result.current.mode?.connectionId ).toBe( 99 );
	} );

	it( 'entry_point is preserved on the mode', async () => {
		const user = userEvent.setup();

		function TestConsumer() {
			const { mode, openComposer } = useComposer();
			return (
				<>
					<button
						onClick={ () => openComposer( { connectionId: 0, entry_point: 'timeline_inline' } ) }
					>
						open
					</button>
					<span data-testid="entry">{ mode?.entry_point ?? '' }</span>
				</>
			);
		}

		render(
			<ComposerProvider connectionId={ 1 }>
				<TestConsumer />
			</ComposerProvider>
		);

		await user.click( screen.getByRole( 'button', { name: 'open' } ) );
		expect( screen.getByTestId( 'entry' ) ).toHaveTextContent( 'timeline_inline' );
	} );

	it( 'restores focus to the trigger after the composer closes', async () => {
		const user = userEvent.setup();

		function FocusHarness() {
			const { openComposer, closeComposer, mode } = useComposer();
			return (
				<>
					<button onClick={ () => openComposer( { connectionId: 0, entry_point: 'fab' } ) }>
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
		// Suppress the React error boundary console output for this assertion.
		const spy = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
		expect( () => renderHook( () => useComposer() ) ).toThrow();
		spy.mockRestore();
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
				<button onClick={ () => openComposer( { connectionId: 0, entry_point: 'fab' } ) }>
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
		// connectionId stays 42 (the snapshot at open time)
		expect( screen.getByTestId( 'probe' ) ).toHaveTextContent( '42' );
	} );
} );

describe( 'useOptionalComposer', () => {
	it( 'returns null outside a ComposerProvider', () => {
		const { result } = renderHook( () => useOptionalComposer() );
		expect( result.current ).toBeNull();
	} );

	it( 'returns the context value inside a ComposerProvider', () => {
		const { result } = renderHook( () => useOptionalComposer(), { wrapper: wrap( 7 ) } );
		expect( result.current ).not.toBeNull();
		expect( result.current?.mode ).toBeNull();
	} );
} );
