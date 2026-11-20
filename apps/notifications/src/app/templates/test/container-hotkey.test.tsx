/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { vi } from 'vitest';
import { HotkeyContainer } from '../container-hotkey';

const pressKey = ( key: string ) => fireEvent.keyDown( window, { key } );

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
} );
