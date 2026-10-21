/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useInboxKeyboardShortcuts } from '../use-inbox-keyboard-shortcuts';

function makeHandlers() {
	return {
		onNext: jest.fn(),
		onPrevious: jest.fn(),
		onSelectTab: jest.fn(),
		onToggleShortcuts: jest.fn(),
	};
}

describe( 'useInboxKeyboardShortcuts', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'moves to the next conversation with j and the right arrow', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( 'j{ArrowRight}' );

		expect( handlers.onNext ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'moves to the previous conversation with k and the left arrow', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( 'k{ArrowLeft}' );

		expect( handlers.onPrevious ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'switches tabs with a, u and c', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( 'auc' );

		expect( handlers.onSelectTab.mock.calls ).toEqual( [ [ 'all' ], [ 'unread' ], [ 'yours' ] ] );
	} );

	it( 'toggles the shortcuts menu with i, even from inside a popover', async () => {
		const user = userEvent.setup();
		const handlers = makeHandlers();
		document.body.innerHTML =
			'<div class="components-popover"><button type="button">Inside</button></div>';
		renderHook( () => useInboxKeyboardShortcuts( handlers ) );

		await user.keyboard( 'i' );
		document.querySelector< HTMLButtonElement >( 'button' )?.focus();
		await user.keyboard( 'ij' );

		expect( handlers.onToggleShortcuts ).toHaveBeenCalledTimes( 2 );
		expect( handlers.onNext ).not.toHaveBeenCalled();
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
