/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { vi } from 'vitest';
import { markPanelMounted } from '../../panel-mounted';
import { HotkeyContainer } from '../container-hotkey';

const pressKey = ( key: string, init: KeyboardEventInit = {} ) =>
	fireEvent.keyDown( window, { key, ...init } );

describe( 'HotkeyContainer', () => {
	it( 'runs one shortcut when two containers share a hotkey', () => {
		const first = vi.fn();
		const second = vi.fn();
		render(
			<>
				<HotkeyContainer
					keyboardShortcutsAreEnabled
					shortcuts={ [ { hotkey: 'a', action: first } ] }
				/>
				<HotkeyContainer
					keyboardShortcutsAreEnabled
					shortcuts={ [ { hotkey: 'a', action: second } ] }
				/>
			</>
		);

		pressKey( 'a' );

		expect( first ).toHaveBeenCalledTimes( 1 );
		expect( second ).not.toHaveBeenCalled();
	} );

	it( 'runs only the first of its own shortcuts on one key', () => {
		const first = vi.fn();
		const second = vi.fn();
		render(
			<HotkeyContainer
				keyboardShortcutsAreEnabled
				shortcuts={ [
					{ hotkey: 'a', action: first },
					{ hotkey: 'a', action: second },
				] }
			/>
		);

		pressKey( 'a' );

		expect( first ).toHaveBeenCalledTimes( 1 );
		expect( second ).not.toHaveBeenCalled();
	} );

	it( 'does not pass a key press on to a shortcut its action brings in', () => {
		const approve = vi.fn();
		const unapprove = vi.fn();
		// Like a pending comment: Approve answers `a`, and approving it puts Unapprove,
		// with the same hotkey, in the Actions menu. The browser renders that change
		// before the menu's listener sees the key press, as flushSync does here.
		function Actions() {
			const [ isApproved, setIsApproved ] = useState( false );
			return (
				<>
					{ ! isApproved && (
						<HotkeyContainer
							keyboardShortcutsAreEnabled
							shortcuts={ [
								{
									hotkey: 'a',
									action: () => {
										approve();
										flushSync( () => setIsApproved( true ) );
									},
								},
							] }
						/>
					) }
					<HotkeyContainer
						keyboardShortcutsAreEnabled
						shortcuts={
							isApproved
								? [
										{
											hotkey: 'a',
											action: () => {
												unapprove();
												flushSync( () => setIsApproved( false ) );
											},
										},
									]
								: []
						}
					/>
				</>
			);
		}
		render( <Actions /> );

		pressKey( 'a' );

		expect( approve ).toHaveBeenCalledTimes( 1 );
		expect( unapprove ).not.toHaveBeenCalled();

		pressKey( 'a' );

		expect( approve ).toHaveBeenCalledTimes( 1 );
		expect( unapprove ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'leaves a key it has no shortcut for to the next container', () => {
		const like = vi.fn();
		const approve = vi.fn();
		render(
			<>
				<HotkeyContainer
					keyboardShortcutsAreEnabled
					shortcuts={ [ { hotkey: 'l', action: like } ] }
				/>
				<HotkeyContainer
					keyboardShortcutsAreEnabled
					shortcuts={ [ { hotkey: 'a', action: approve } ] }
				/>
			</>
		);

		pressKey( 'a' );

		expect( like ).not.toHaveBeenCalled();
		expect( approve ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'runs a shortcut once while its key is held down', () => {
		const approve = vi.fn();
		render(
			<HotkeyContainer
				keyboardShortcutsAreEnabled
				shortcuts={ [ { hotkey: 'a', action: approve } ] }
			/>
		);

		pressKey( 'a' );
		pressKey( 'a', { repeat: true } );
		pressKey( 'a', { repeat: true } );

		expect( approve ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'runs no shortcut while keyboard shortcuts are off', () => {
		const approve = vi.fn();
		render(
			<HotkeyContainer
				keyboardShortcutsAreEnabled={ false }
				shortcuts={ [ { hotkey: 'a', action: approve } ] }
			/>
		);

		expect( pressKey( 'a' ) ).toBe( true );
		expect( approve ).not.toHaveBeenCalled();
	} );

	it( 'runs no shortcut for typing in a form field, while keyboard shortcuts are on', () => {
		const spam = vi.fn();
		render(
			<>
				<input aria-label="Search commands" />
				<HotkeyContainer
					keyboardShortcutsAreEnabled
					shortcuts={ [ { hotkey: 's', action: spam } ] }
				/>
			</>
		);

		expect(
			fireEvent.keyDown( screen.getByRole( 'textbox', { name: 'Search commands' } ), { key: 's' } )
		).toBe( true );
		expect( spam ).not.toHaveBeenCalled();
	} );

	it( 'leaves a key pressed with Ctrl, Cmd or Alt to the browser', () => {
		const approve = vi.fn();
		render(
			<HotkeyContainer
				keyboardShortcutsAreEnabled
				shortcuts={ [ { hotkey: 'a', action: approve } ] }
			/>
		);

		expect( pressKey( 'a', { ctrlKey: true } ) ).toBe( true );
		expect( pressKey( 'a', { metaKey: true } ) ).toBe( true );
		expect( pressKey( 'a', { altKey: true } ) ).toBe( true );
		expect( approve ).not.toHaveBeenCalled();
	} );

	it( 'runs a shortcut for a key press other code cancelled', () => {
		const like = vi.fn();
		render(
			<>
				{ /* Like a focusable disabled button, which cancels every key press but Tab. */ }
				<button onKeyDown={ ( event ) => event.preventDefault() }>Send</button>
				<HotkeyContainer
					keyboardShortcutsAreEnabled
					shortcuts={ [ { hotkey: 'l', action: like } ] }
				/>
			</>
		);

		fireEvent.keyDown( screen.getByRole( 'button', { name: 'Send' } ), { key: 'l' } );

		expect( like ).toHaveBeenCalledTimes( 1 );
	} );

	describe( 'with a scope, as on the full page', () => {
		const renderScoped = ( {
			keyboardShortcutsAreEnabled = true,
			other,
		}: { keyboardShortcutsAreEnabled?: boolean; other?: () => void } = {} ) => {
			const like = vi.fn();
			const scope = createRef< HTMLDivElement >();
			render(
				<>
					<input aria-label="Search" />
					<button>Sites</button>
					<div ref={ scope }>
						<button>Open note</button>
						<textarea aria-label="Reply" />
						<HotkeyContainer
							keyboardShortcutsAreEnabled={ keyboardShortcutsAreEnabled }
							shortcutScope={ scope }
							shortcuts={ [ { hotkey: 'l', action: like } ] }
						/>
					</div>
					{ other && (
						<HotkeyContainer
							keyboardShortcutsAreEnabled
							shortcuts={ [ { hotkey: 'l', action: other } ] }
						/>
					) }
				</>
			);
			return like;
		};

		it( 'runs a shortcut for a key press from inside its scope or with nothing focused', () => {
			const like = renderScoped();

			fireEvent.keyDown( screen.getByRole( 'button', { name: 'Open note' } ), { key: 'l' } );
			fireEvent.keyDown( document.body, { key: 'l' } );

			expect( like ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'runs no shortcut for a key press from outside its scope', () => {
			const like = renderScoped();

			expect(
				fireEvent.keyDown( screen.getByRole( 'textbox', { name: 'Search' } ), { key: 'l' } )
			).toBe( true );
			expect(
				fireEvent.keyDown( screen.getByRole( 'button', { name: 'Sites' } ), { key: 'l' } )
			).toBe( true );
			expect( like ).not.toHaveBeenCalled();
		} );

		it( 'runs no shortcut for typing in a form field inside its scope', () => {
			const like = renderScoped();

			expect(
				fireEvent.keyDown( screen.getByRole( 'textbox', { name: 'Reply' } ), { key: 'l' } )
			).toBe( true );
			expect( like ).not.toHaveBeenCalled();
		} );

		it( 'runs shortcuts while the shared switch is off', () => {
			// A reply box that goes away while it has focus leaves the switch off.
			const like = renderScoped( { keyboardShortcutsAreEnabled: false } );

			fireEvent.keyDown( screen.getByRole( 'button', { name: 'Open note' } ), { key: 'l' } );

			expect( like ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'leaves a key press from outside its scope to another container', () => {
			const other = vi.fn();
			const like = renderScoped( { other } );

			fireEvent.keyDown( screen.getByRole( 'button', { name: 'Sites' } ), { key: 'l' } );

			expect( like ).not.toHaveBeenCalled();
			expect( other ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'leaves every key press to a mounted panel', () => {
			const other = vi.fn();
			const like = renderScoped( { other } );
			const unmarkPanel = markPanelMounted();

			try {
				fireEvent.keyDown( screen.getByRole( 'button', { name: 'Open note' } ), { key: 'l' } );
				fireEvent.keyDown( document.body, { key: 'l' } );
			} finally {
				unmarkPanel();
			}

			expect( like ).not.toHaveBeenCalled();
			expect( other ).toHaveBeenCalledTimes( 2 );

			fireEvent.keyDown( document.body, { key: 'l' } );

			expect( like ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
