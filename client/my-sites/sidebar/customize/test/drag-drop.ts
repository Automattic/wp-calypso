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

function makePointerEvent( type: 'pointermove' | 'pointerup', x = 0, y = 0 ): Event {
	if ( typeof PointerEvent !== 'undefined' ) {
		return new PointerEvent( type, { bubbles: true, clientX: x, clientY: y } );
	}
	const ev = new Event( type, { bubbles: true } );
	Object.defineProperties( ev, {
		clientX: { value: x },
		clientY: { value: y },
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

	it( 'ignores chrome rows while preserving separator slots in top_level position', () => {
		const ul = document.createElement( 'ul' );
		ul.className = 'sidebar';
		const skip = document.createElement( 'li' );
		skip.className = 'sidebar__region';
		const separator = document.createElement( 'li' );
		separator.className = 'sidebar__separator';
		const a = makeReassignableLi( 'a' );
		const group = document.createElement( 'li' );
		group.className = 'wp-admin-sidebar-group';
		const b = makeReassignableLi( 'b' );
		const collapse = document.createElement( 'li' );
		collapse.className = 'collapse-sidebar__toggle';
		ul.append( skip, separator, a, group, b, collapse );
		expect( positionForElement( a ) ).toEqual( { kind: 'top_level', index: 1 } );
		expect( positionForElement( b ) ).toEqual( { kind: 'top_level', index: 2 } );
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

	it( 'drops into an expanded group when the neighbour is an expandable wrapper row', () => {
		const sidebar = document.createElement( 'ul' );
		sidebar.className = 'sidebar';
		const source = makeReassignableLi( 'stats' );
		const groupContainer = document.createElement( 'li' );
		groupContainer.classList.add( 'wp-admin-sidebar-group' );
		groupContainer.setAttribute( 'data-group', 'plugins' );
		groupContainer.setAttribute( 'data-expanded', 'true' );
		const childList = document.createElement( 'ul' );
		childList.classList.add( 'wp-admin-sidebar-group__children' );
		const expandableWrapper = document.createElement( 'li' );
		expandableWrapper.innerHTML =
			'<ul class="sidebar__menu is-togglable"><li><a class="sidebar__heading">Upgrades</a></li></ul>';
		childList.appendChild( expandableWrapper );
		groupContainer.appendChild( childList );
		sidebar.appendChild( source );
		sidebar.appendChild( groupContainer );
		document.body.appendChild( sidebar );

		source.getBoundingClientRect = jest.fn( () => ( {
			top: 0,
			left: 0,
			width: 200,
			height: 34,
			bottom: 34,
			right: 200,
			x: 0,
			y: 0,
			toJSON: jest.fn(),
		} ) );
		expandableWrapper.getBoundingClientRect = jest.fn( () => ( {
			top: 100,
			left: 0,
			width: 200,
			height: 34,
			bottom: 134,
			right: 200,
			x: 0,
			y: 100,
			toJSON: jest.fn(),
		} ) );
		document.elementsFromPoint = jest.fn( () => [ expandableWrapper ] );

		detach = attachDragDrop( controller );
		source.dispatchEvent( makePointerDown() );
		document.dispatchEvent( makePointerEvent( 'pointermove', 10, 130 ) );
		document.dispatchEvent( makePointerEvent( 'pointerup', 10, 130 ) );

		expect( controller.commitMove ).toHaveBeenCalledWith( 'stats', {
			kind: 'in_group',
			group_id: 'plugins',
			index: 1,
		} );
	} );

	it( 'normalizes expandable inner rows before computing top-level slots', () => {
		const sidebar = document.createElement( 'ul' );
		sidebar.className = 'sidebar';
		const source = makeReassignableLi( 'stats' );
		const expandableWrapper = document.createElement( 'li' );
		expandableWrapper.setAttribute( 'data-wp-admin-sidebar-item-id', 'feedback' );
		expandableWrapper.innerHTML =
			'<ul class="sidebar__menu is-togglable"><li class="sidebar__menu-item-parent"><a class="sidebar__heading">Feedback</a></li></ul>';
		const after = makeReassignableLi( 'jetpack' );
		sidebar.appendChild( source );
		sidebar.appendChild( expandableWrapper );
		sidebar.appendChild( after );
		document.body.appendChild( sidebar );

		source.getBoundingClientRect = jest.fn( () => ( {
			top: 0,
			left: 0,
			width: 200,
			height: 34,
			bottom: 34,
			right: 200,
			x: 0,
			y: 0,
			toJSON: jest.fn(),
		} ) );
		expandableWrapper.getBoundingClientRect = jest.fn( () => ( {
			top: 100,
			left: 0,
			width: 200,
			height: 34,
			bottom: 134,
			right: 200,
			x: 0,
			y: 100,
			toJSON: jest.fn(),
		} ) );
		const innerLi = expandableWrapper.querySelector( 'li.sidebar__menu-item-parent' )!;
		document.elementsFromPoint = jest.fn( () => [ innerLi ] );

		detach = attachDragDrop( controller );
		source.dispatchEvent( makePointerDown() );
		document.dispatchEvent( makePointerEvent( 'pointermove', 10, 130 ) );
		document.dispatchEvent( makePointerEvent( 'pointerup', 10, 130 ) );

		expect( controller.commitMove ).toHaveBeenCalledWith( 'stats', {
			kind: 'top_level',
			index: 1,
		} );
	} );

	it( 'normalizes expandable inner rows before computing group slots', () => {
		const sidebar = document.createElement( 'ul' );
		sidebar.className = 'sidebar';
		const source = makeReassignableLi( 'stats' );
		const groupContainer = document.createElement( 'li' );
		groupContainer.classList.add( 'wp-admin-sidebar-group' );
		groupContainer.setAttribute( 'data-group', 'plugins' );
		groupContainer.setAttribute( 'data-expanded', 'true' );
		const childList = document.createElement( 'ul' );
		childList.classList.add( 'wp-admin-sidebar-group__children' );
		const expandableWrapper = document.createElement( 'li' );
		expandableWrapper.setAttribute( 'data-wp-admin-sidebar-item-id', 'feedback' );
		expandableWrapper.innerHTML =
			'<ul class="sidebar__menu is-togglable"><li class="sidebar__menu-item-parent"><a class="sidebar__heading">Feedback</a></li></ul>';
		childList.appendChild( expandableWrapper );
		groupContainer.appendChild( childList );
		sidebar.appendChild( source );
		sidebar.appendChild( groupContainer );
		document.body.appendChild( sidebar );

		source.getBoundingClientRect = jest.fn( () => ( {
			top: 0,
			left: 0,
			width: 200,
			height: 34,
			bottom: 34,
			right: 200,
			x: 0,
			y: 0,
			toJSON: jest.fn(),
		} ) );
		expandableWrapper.getBoundingClientRect = jest.fn( () => ( {
			top: 100,
			left: 0,
			width: 200,
			height: 34,
			bottom: 134,
			right: 200,
			x: 0,
			y: 100,
			toJSON: jest.fn(),
		} ) );
		const innerLi = expandableWrapper.querySelector( 'li.sidebar__menu-item-parent' )!;
		document.elementsFromPoint = jest.fn( () => [ innerLi ] );

		detach = attachDragDrop( controller );
		source.dispatchEvent( makePointerDown() );
		document.dispatchEvent( makePointerEvent( 'pointermove', 10, 130 ) );
		document.dispatchEvent( makePointerEvent( 'pointerup', 10, 130 ) );

		expect( controller.commitMove ).toHaveBeenCalledWith( 'stats', {
			kind: 'in_group',
			group_id: 'plugins',
			index: 1,
		} );
	} );

	it( 'ignores Calypso chrome rows when computing a top-level drop slot', () => {
		const sidebar = document.createElement( 'ul' );
		sidebar.className = 'sidebar';
		const skip = document.createElement( 'li' );
		skip.className = 'sidebar__region';
		const settings = document.createElement( 'li' );
		settings.innerHTML =
			'<ul class="sidebar__menu is-togglable"><li><a class="sidebar__heading">Settings</a></li></ul>';
		const separator = document.createElement( 'li' );
		separator.className = 'sidebar__separator';
		const group = document.createElement( 'li' );
		group.className = 'wp-admin-sidebar-group';
		const source = makeReassignableLi( 'stats' );
		const collapse = document.createElement( 'li' );
		collapse.className = 'collapse-sidebar__toggle';
		sidebar.append( skip, settings, separator, group, source, collapse );
		document.body.appendChild( sidebar );

		source.getBoundingClientRect = jest.fn( () => ( {
			top: 200,
			left: 0,
			width: 200,
			height: 34,
			bottom: 234,
			right: 200,
			x: 0,
			y: 200,
			toJSON: jest.fn(),
		} ) );
		settings.getBoundingClientRect = jest.fn( () => ( {
			top: 100,
			left: 0,
			width: 200,
			height: 34,
			bottom: 134,
			right: 200,
			x: 0,
			y: 100,
			toJSON: jest.fn(),
		} ) );
		const innerLi = settings.querySelector( 'li' )!;
		document.elementsFromPoint = jest.fn( () => [ innerLi ] );

		detach = attachDragDrop( controller );
		source.dispatchEvent( makePointerDown() );
		document.dispatchEvent( makePointerEvent( 'pointermove', 10, 105 ) );
		document.dispatchEvent( makePointerEvent( 'pointerup', 10, 105 ) );

		expect( controller.commitMove ).toHaveBeenCalledWith( 'stats', {
			kind: 'top_level',
			index: 0,
		} );
	} );

	it( 'drops into an expanded empty group from the group header', () => {
		const sidebar = document.createElement( 'ul' );
		sidebar.className = 'sidebar';
		const source = makeReassignableLi( 'stats' );
		const groupContainer = document.createElement( 'li' );
		groupContainer.classList.add( 'wp-admin-sidebar-group' );
		groupContainer.setAttribute( 'data-group', 'plugins' );
		groupContainer.setAttribute( 'data-expanded', 'true' );
		const header = document.createElement( 'div' );
		header.classList.add( 'wp-admin-sidebar-group__header' );
		const childList = document.createElement( 'ul' );
		childList.classList.add( 'wp-admin-sidebar-group__children' );
		groupContainer.appendChild( header );
		groupContainer.appendChild( childList );
		sidebar.appendChild( source );
		sidebar.appendChild( groupContainer );
		document.body.appendChild( sidebar );

		source.getBoundingClientRect = jest.fn( () => ( {
			top: 0,
			left: 0,
			width: 200,
			height: 34,
			bottom: 34,
			right: 200,
			x: 0,
			y: 0,
			toJSON: jest.fn(),
		} ) );
		document.elementsFromPoint = jest.fn( () => [ header, groupContainer ] );

		detach = attachDragDrop( controller );
		source.dispatchEvent( makePointerDown() );
		document.dispatchEvent( makePointerEvent( 'pointermove', 10, 100 ) );
		document.dispatchEvent( makePointerEvent( 'pointerup', 10, 100 ) );

		expect( controller.commitMove ).toHaveBeenCalledWith( 'stats', {
			kind: 'in_group',
			group_id: 'plugins',
			index: 0,
		} );
	} );
} );
