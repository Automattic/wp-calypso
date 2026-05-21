/**
 * @jest-environment jsdom
 */

import { attachDragDrop, positionForElement } from '../drag-drop';

/**
 * jsdom 24+ implements PointerEvent natively but older versions don't ship
 * it on the global. Synthesize one using the Event constructor + property
 * patches so the drag-drop hook (which only reads `clientX`, `clientY`,
 * `target`, `key`) sees the values it needs. Using a generic Event with
 * type='pointerdown' guarantees the listener fires.
 */
function makePointerDown(): Event {
	if ( typeof PointerEvent !== 'undefined' ) {
		return new PointerEvent( 'pointerdown', { bubbles: true, clientX: 0, clientY: 0 } );
	}
	const ev = new Event( 'pointerdown', { bubbles: true } );
	Object.defineProperties( ev, {
		clientX: { value: 0 },
		clientY: { value: 0 },
	} );
	return ev;
}

function makeReassignableLi( id: string, group: string | null = null ): HTMLLIElement {
	const li = document.createElement( 'li' );
	li.setAttribute( 'data-wp-admin-sidebar-item-id', id );
	li.classList.add( 'sidebar__menu-item-parent' );
	const a = document.createElement( 'a' );
	a.textContent = id;
	li.appendChild( a );
	if ( group ) {
		// Wrap in a group container for the in_group test.
		const groupContainer = document.createElement( 'li' );
		groupContainer.classList.add( 'wp-admin-sidebar-group' );
		groupContainer.setAttribute( 'data-group', group );
		groupContainer.setAttribute( 'data-expanded', 'true' );
		const childList = document.createElement( 'ul' );
		childList.classList.add( 'wp-admin-sidebar-group__children' );
		groupContainer.appendChild( childList );
		childList.appendChild( li );
		return groupContainer.querySelector( 'li[data-wp-admin-sidebar-item-id]' )! as HTMLLIElement;
	}
	return li;
}

describe( 'positionForElement', () => {
	it( 'reads top_level position from sibling index', () => {
		const ul = document.createElement( 'ul' );
		const a = makeReassignableLi( 'a' );
		const b = makeReassignableLi( 'b' );
		const c = makeReassignableLi( 'c' );
		ul.appendChild( a );
		ul.appendChild( b );
		ul.appendChild( c );
		expect( positionForElement( a ) ).toEqual( { kind: 'top_level', index: 0 } );
		expect( positionForElement( b ) ).toEqual( { kind: 'top_level', index: 1 } );
	} );

	it( 'reads in_group position when ancestor is a group container', () => {
		const groupContainer = document.createElement( 'li' );
		groupContainer.classList.add( 'wp-admin-sidebar-group' );
		groupContainer.setAttribute( 'data-group', 'plugins' );
		const childList = document.createElement( 'ul' );
		childList.classList.add( 'wp-admin-sidebar-group__children' );
		groupContainer.appendChild( childList );
		const li = makeReassignableLi( 'p1' );
		childList.appendChild( li );
		// Mount in document so closest() walks up properly across multiple LIs.
		document.body.appendChild( groupContainer );
		expect( positionForElement( li ) ).toEqual( {
			kind: 'in_group',
			group_id: 'plugins',
			index: 0,
		} );
	} );
} );

describe( 'attachDragDrop', () => {
	let detach: ( () => void ) | null = null;
	const controller = {
		commitMove: jest.fn(),
		beginDrag: jest.fn(),
		endDrag: jest.fn(),
		announce: jest.fn(),
	};

	beforeEach( () => {
		document.body.innerHTML = '';
		controller.commitMove.mockClear();
		controller.beginDrag.mockClear();
		controller.endDrag.mockClear();
		controller.announce.mockClear();
	} );

	afterEach( () => {
		if ( detach ) {
			detach();
			detach = null;
		}
	} );

	it( 'detaches without errors when no drag was started', () => {
		detach = attachDragDrop( controller );
		expect( () => detach!() ).not.toThrow();
	} );

	it( 'ignores pointerdown on non-reassignable rows', () => {
		const li = document.createElement( 'li' );
		li.classList.add( 'sidebar__menu-item-parent' );
		document.body.appendChild( li );
		detach = attachDragDrop( controller );
		const ev = makePointerDown();
		li.dispatchEvent( ev );
		expect( controller.beginDrag ).not.toHaveBeenCalled();
	} );

	it( 'fires beginDrag when pointerdown lands on a reassignable row', () => {
		const li = makeReassignableLi( 'a' );
		document.body.appendChild( li );
		detach = attachDragDrop( controller );
		// jsdom's PointerEvent doesn't always set target accurately; dispatch
		// directly on the li so closest() resolves it.
		const ev = makePointerDown();
		li.dispatchEvent( ev );
		expect( controller.beginDrag ).toHaveBeenCalledTimes( 1 );
		expect( controller.beginDrag ).toHaveBeenCalledWith(
			'a',
			expect.objectContaining( { kind: 'top_level' } )
		);
	} );
} );
