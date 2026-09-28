/**
 * @jest-environment jsdom
 */
import { fireEvent, renderHook } from '@testing-library/react';
import useRaiseOnFocus from '../use-raise-on-focus';

const FOCUSED_ATTRIBUTE = 'data-overlay-panel-focused';

const addPanel = (): HTMLElement => {
	const panel = document.createElement( 'div' );

	panel.appendChild( document.createElement( 'button' ) );
	document.body.appendChild( panel );

	return panel;
};

describe( 'useRaiseOnFocus', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'focuses a panel when it appears, taking over from the other one', () => {
		const chat = addPanel();
		const helpCenter = addPanel();

		renderHook( () => useRaiseOnFocus( chat ) );

		expect( chat ).toHaveAttribute( FOCUSED_ATTRIBUTE );

		renderHook( () => useRaiseOnFocus( helpCenter ) );

		expect( helpCenter ).toHaveAttribute( FOCUSED_ATTRIBUTE );
		expect( chat ).not.toHaveAttribute( FOCUSED_ATTRIBUTE );
	} );

	it( 'focuses a panel when it opens, not while it is closed', () => {
		const chat = addPanel();

		const { rerender } = renderHook(
			( { isOpen }: { isOpen: boolean } ) => useRaiseOnFocus( chat, isOpen ),
			{ initialProps: { isOpen: false } }
		);

		expect( chat ).not.toHaveAttribute( FOCUSED_ATTRIBUTE );

		rerender( { isOpen: true } );

		expect( chat ).toHaveAttribute( FOCUSED_ATTRIBUTE );
	} );

	it.each( [
		[ 'pointerdown', fireEvent.pointerDown ],
		[ 'focusin', fireEvent.focusIn ],
	] )(
		'focuses a panel on `%s` inside it, even when the panel stops it from bubbling',
		( type, fire ) => {
			const chat = addPanel();
			const helpCenter = addPanel();
			const button = chat.firstElementChild as Element;

			button.addEventListener( type, ( event ) => event.stopPropagation() );

			renderHook( () => useRaiseOnFocus( chat ) );
			renderHook( () => useRaiseOnFocus( helpCenter ) );

			fire( button );

			expect( chat ).toHaveAttribute( FOCUSED_ATTRIBUTE );
			expect( helpCenter ).not.toHaveAttribute( FOCUSED_ATTRIBUTE );
		}
	);

	it( 'keeps the panel focused when the user clicks outside the panels', () => {
		const chat = addPanel();

		renderHook( () => useRaiseOnFocus( chat ) );

		fireEvent.pointerDown( document.body );

		expect( chat ).toHaveAttribute( FOCUSED_ATTRIBUTE );
	} );

	it( 'unfocuses a panel that goes away, and stops listening to it', () => {
		const chat = addPanel();

		const { rerender } = renderHook(
			( { node }: { node: HTMLElement | null } ) => useRaiseOnFocus( node ),
			{ initialProps: { node: chat as HTMLElement | null } }
		);

		rerender( { node: null } );

		expect( chat ).not.toHaveAttribute( FOCUSED_ATTRIBUTE );

		fireEvent.pointerDown( chat );

		expect( chat ).not.toHaveAttribute( FOCUSED_ATTRIBUTE );
	} );
} );
