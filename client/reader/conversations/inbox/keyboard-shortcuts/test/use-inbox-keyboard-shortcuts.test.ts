/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	SHORTCUTS_POPOVER_CLASS,
	useInboxKeyboardShortcuts,
} from '../use-inbox-keyboard-shortcuts';

function makeHandlers() {
	return {
		onNext: jest.fn(),
		onPrevious: jest.fn(),
		onNextTab: jest.fn(),
		onPreviousTab: jest.fn(),
		onSelectTab: jest.fn(),
		onToggleShortcuts: jest.fn(),
	};
}

describe( 'useInboxKeyboardShortcuts', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'moves to the next conversation with the down arrow and j', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( '{ArrowDown}j' );

		expect( handlers.onNext ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'moves to the previous conversation with the up arrow and k', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( '{ArrowUp}k' );

		expect( handlers.onPrevious ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'moves between tabs with the left and right arrows', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( '{ArrowRight}{ArrowLeft}' );

		expect( handlers.onNextTab ).toHaveBeenCalledTimes( 1 );
		expect( handlers.onPreviousTab ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'switches tabs with a, u and c', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( 'auc' );

		expect( handlers.onSelectTab.mock.calls ).toEqual( [ [ 'all' ], [ 'unread' ], [ 'yours' ] ] );
	} );

	it( 'toggles the shortcuts menu with i, including from inside the shortcuts popover', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		document.body.innerHTML = `<div class="components-popover ${ SHORTCUTS_POPOVER_CLASS }"><button type="button">Inside</button></div>`;
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( 'i' );
		document.querySelector< HTMLButtonElement >( 'button' )?.focus();
		await user.keyboard( 'i{ArrowDown}' );

		expect( handlers.onToggleShortcuts ).toHaveBeenCalledTimes( 2 );
		expect( handlers.onNext ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'WordPress', 'components-popover' ],
		[ 'legacy', 'popover' ],
	] )( 'ignores every shortcut inside an unrelated %s popover', async ( _, className ) => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		document.body.innerHTML = `<div class="${ className }"><button type="button">Inside</button></div>`;
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		document.querySelector< HTMLButtonElement >( 'button' )?.focus();
		await user.keyboard( 'i{ArrowDown}{ArrowUp}{ArrowRight}{ArrowLeft}jkauc' );

		expect( handlers.onToggleShortcuts ).not.toHaveBeenCalled();
		expect( handlers.onNext ).not.toHaveBeenCalled();
		expect( handlers.onPrevious ).not.toHaveBeenCalled();
		expect( handlers.onNextTab ).not.toHaveBeenCalled();
		expect( handlers.onPreviousTab ).not.toHaveBeenCalled();
		expect( handlers.onSelectTab ).not.toHaveBeenCalled();
	} );

	it( 'ignores keys typed into a field', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		document.body.innerHTML = '<input type="search" />';
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.click( document.querySelector( 'input' )! );
		await user.keyboard( 'juki' );

		expect( handlers.onNext ).not.toHaveBeenCalled();
		expect( handlers.onSelectTab ).not.toHaveBeenCalled();
		expect( handlers.onToggleShortcuts ).not.toHaveBeenCalled();
	} );

	it( 'ignores modifier combinations', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( '{Meta>}j{/Meta}{Control>}u{/Control}' );

		expect( handlers.onNext ).not.toHaveBeenCalled();
		expect( handlers.onSelectTab ).not.toHaveBeenCalled();
	} );

	it( 'does nothing when disabled', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		renderHook( () => useInboxKeyboardShortcuts( { ...handlers, enabled: false } ) );

		await user.keyboard( 'jki' );

		expect( handlers.onNext ).not.toHaveBeenCalled();
		expect( handlers.onPrevious ).not.toHaveBeenCalled();
		expect( handlers.onToggleShortcuts ).not.toHaveBeenCalled();
	} );
} );
