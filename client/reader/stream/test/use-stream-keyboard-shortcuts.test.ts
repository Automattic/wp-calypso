/**
 * @jest-environment jsdom
 */
import { createEvent, fireEvent, renderHook } from '@testing-library/react';
import {
	useStreamKeyboardShortcuts,
	type UseStreamKeyboardShortcutsOptions,
} from '../use-stream-keyboard-shortcuts';

function makeHandlers(): Omit< UseStreamKeyboardShortcutsOptions, 'enabled' > {
	return {
		onNext: jest.fn(),
		onPrevious: jest.fn(),
		onOpen: jest.fn(),
		onOpenInNewTab: jest.fn(),
		onToggleLike: jest.fn(),
	};
}

// Dispatch a keydown that a capture-phase document listener will see, and report
// whether the handler called preventDefault on it.
function pressKey(
	key: string,
	{ target = document, ...init }: { target?: Element | Document } & KeyboardEventInit = {}
): boolean {
	const event = createEvent.keyDown( target, { key, ...init } );
	fireEvent( target, event );
	return event.defaultPrevented;
}

describe( 'useStreamKeyboardShortcuts', () => {
	it.each( [
		[ 'j', 'onNext' ],
		[ 'ArrowRight', 'onNext' ],
		[ 'k', 'onPrevious' ],
		[ 'ArrowLeft', 'onPrevious' ],
		[ 'Enter', 'onOpen' ],
		[ 'v', 'onOpenInNewTab' ],
		[ 'l', 'onToggleLike' ],
	] as const )( 'routes %s to %s', ( key, handlerName ) => {
		const handlers = makeHandlers();
		renderHook( () => useStreamKeyboardShortcuts( handlers ) );

		pressKey( key );

		expect( handlers[ handlerName ] ).toHaveBeenCalledTimes( 1 );
		Object.entries( handlers )
			.filter( ( [ name ] ) => name !== handlerName )
			.forEach( ( [ , fn ] ) => expect( fn ).not.toHaveBeenCalled() );
	} );

	it( 'does nothing for unmapped keys', () => {
		const handlers = makeHandlers();
		renderHook( () => useStreamKeyboardShortcuts( handlers ) );

		pressKey( 'x' );

		expect( handlers.onNext ).not.toHaveBeenCalled();
		expect( handlers.onPrevious ).not.toHaveBeenCalled();
		expect( handlers.onOpen ).not.toHaveBeenCalled();
		expect( handlers.onOpenInNewTab ).not.toHaveBeenCalled();
		expect( handlers.onToggleLike ).not.toHaveBeenCalled();
	} );

	it( 'fires nothing when disabled', () => {
		const handlers = makeHandlers();
		renderHook( () => useStreamKeyboardShortcuts( { ...handlers, enabled: false } ) );

		pressKey( 'j' );
		pressKey( 'Enter' );
		pressKey( 'l' );

		expect( handlers.onNext ).not.toHaveBeenCalled();
		expect( handlers.onOpen ).not.toHaveBeenCalled();
		expect( handlers.onToggleLike ).not.toHaveBeenCalled();
	} );

	it.each( [ 'INPUT', 'SELECT', 'TEXTAREA' ] )(
		'ignores key events originating from a %s element',
		( tagName ) => {
			const handlers = makeHandlers();
			renderHook( () => useStreamKeyboardShortcuts( handlers ) );

			const element = document.createElement( tagName );
			document.body.appendChild( element );
			pressKey( 'j', { target: element } );
			element.remove();

			expect( handlers.onNext ).not.toHaveBeenCalled();
		}
	);

	it( 'ignores key events from a contentEditable element', () => {
		const handlers = makeHandlers();
		renderHook( () => useStreamKeyboardShortcuts( handlers ) );

		const element = document.createElement( 'div' );
		element.contentEditable = 'true';
		// jsdom doesn't derive isContentEditable from the attribute, so force it.
		Object.defineProperty( element, 'isContentEditable', { value: true } );
		document.body.appendChild( element );
		pressKey( 'j', { target: element } );
		element.remove();

		expect( handlers.onNext ).not.toHaveBeenCalled();
	} );

	it( 'ignores key events fired from within a popover', () => {
		const handlers = makeHandlers();
		renderHook( () => useStreamKeyboardShortcuts( handlers ) );

		const popover = document.createElement( 'div' );
		popover.className = 'components-popover';
		const child = document.createElement( 'button' );
		popover.appendChild( child );
		document.body.appendChild( popover );
		pressKey( 'l', { target: child } );
		popover.remove();

		expect( handlers.onToggleLike ).not.toHaveBeenCalled();
	} );

	it.each( [ 'metaKey', 'ctrlKey', 'altKey' ] as const )(
		'ignores keys held with %s',
		( modifier ) => {
			const handlers = makeHandlers();
			renderHook( () => useStreamKeyboardShortcuts( handlers ) );

			pressKey( 'k', { [ modifier ]: true } );

			expect( handlers.onPrevious ).not.toHaveBeenCalled();
		}
	);

	it( 'prevents default only for navigation and open keys', () => {
		const handlers = makeHandlers();
		renderHook( () => useStreamKeyboardShortcuts( handlers ) );

		expect( pressKey( 'j' ) ).toBe( true );
		expect( pressKey( 'ArrowRight' ) ).toBe( true );
		expect( pressKey( 'k' ) ).toBe( true );
		expect( pressKey( 'ArrowLeft' ) ).toBe( true );
		expect( pressKey( 'Enter' ) ).toBe( true );
		expect( pressKey( 'v' ) ).toBe( false );
		expect( pressKey( 'l' ) ).toBe( false );
	} );

	it( 'calls the latest callbacks after a re-render', () => {
		const first = makeHandlers();
		const { rerender } = renderHook( ( props ) => useStreamKeyboardShortcuts( props ), {
			initialProps: first as UseStreamKeyboardShortcutsOptions,
		} );

		const second = makeHandlers();
		rerender( second as UseStreamKeyboardShortcutsOptions );

		pressKey( 'j' );

		expect( first.onNext ).not.toHaveBeenCalled();
		expect( second.onNext ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'removes the listener on unmount', () => {
		const handlers = makeHandlers();
		const { unmount } = renderHook( () => useStreamKeyboardShortcuts( handlers ) );

		unmount();
		pressKey( 'j' );

		expect( handlers.onNext ).not.toHaveBeenCalled();
	} );
} );
