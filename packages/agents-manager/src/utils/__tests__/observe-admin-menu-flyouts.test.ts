/**
 * @jest-environment jsdom
 */
import observeAdminMenuFlyouts from '../observe-admin-menu-flyouts';

const SCROLLABLE_CLASS = 'agents-manager-admin-menu-scrollable';
const TOP_VAR = '--am-flyout-top';
const MAX_HEIGHT_VAR = '--am-flyout-max-height';

// Geometry used across tests: 800px viewport, frame top at 50px, 16px gutter.
const VIEWPORT_HEIGHT = 800;
const WRAP_TOP = 50;
const GAP = 16;

// jsdom has no `DOMRect` constructor; build the shape by hand.
const rect = ( top: number ) => (): DOMRect =>
	( {
		top,
		bottom: top + 34,
		left: 0,
		right: 160,
		width: 160,
		height: 34,
		x: 0,
		y: top,
		toJSON: () => ( {} ),
	} ) as DOMRect;

function buildMenu() {
	const wrap = document.createElement( 'div' );
	wrap.id = 'adminmenuwrap';
	wrap.getBoundingClientRect = rect( WRAP_TOP );

	const menu = document.createElement( 'ul' );
	menu.id = 'adminmenu';
	wrap.appendChild( menu );
	document.body.appendChild( wrap );

	return { wrap, menu };
}

function addItem(
	menu: HTMLElement,
	{ top, submenuHeight }: { top: number; submenuHeight: number }
) {
	const item = document.createElement( 'li' );
	item.className = 'menu-top';
	item.getBoundingClientRect = rect( top );

	const link = document.createElement( 'a' );
	link.className = 'menu-top';
	link.href = '#';
	item.appendChild( link );

	const submenu = document.createElement( 'ul' );
	submenu.className = 'wp-submenu';
	Object.defineProperty( submenu, 'scrollHeight', { value: submenuHeight, configurable: true } );
	item.appendChild( submenu );

	menu.appendChild( item );
	return { item, link };
}

function attach(): () => void {
	const cleanup = observeAdminMenuFlyouts();
	if ( ! cleanup ) {
		throw new Error( 'expected the observer to attach' );
	}
	return cleanup;
}

const hover = ( el: HTMLElement ) =>
	el.dispatchEvent( new Event( 'pointerover', { bubbles: true } ) );

describe( 'observeAdminMenuFlyouts', () => {
	beforeEach( () => {
		window.innerHeight = VIEWPORT_HEIGHT;
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		document.body.className = '';
	} );

	it( 'is a no-op outside wp-admin (no admin menu in the DOM)', () => {
		expect( observeAdminMenuFlyouts() ).toBeUndefined();
		expect( document.body.classList.contains( SCROLLABLE_CLASS ) ).toBe( false );
	} );

	it( 'gates the scrollable-menu CSS on a body class between attach and cleanup', () => {
		buildMenu();
		const cleanup = attach();
		expect( document.body.classList.contains( SCROLLABLE_CLASS ) ).toBe( true );

		cleanup();
		expect( document.body.classList.contains( SCROLLABLE_CLASS ) ).toBe( false );
	} );

	it( 'aligns the hovered flyout with its item when it fits the viewport', () => {
		const { menu } = buildMenu();
		const { item, link } = addItem( menu, { top: 100, submenuHeight: 200 } );
		const cleanup = attach();

		hover( link );
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '100px' );
		// Cap is set unconditionally; here it exceeds the flyout height (no-op).
		expect( item.style.getPropertyValue( MAX_HEIGHT_VAR ) ).toBe(
			`${ VIEWPORT_HEIGHT - GAP - 100 }px`
		);

		cleanup();
	} );

	it( 'shifts the flyout up so its bottom stays inside the viewport', () => {
		const { menu } = buildMenu();
		const { item, link } = addItem( menu, { top: 700, submenuHeight: 200 } );
		const cleanup = attach();

		hover( link );
		// 800 − 16 − 200 = 584: bottom lands exactly on the gutter.
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '584px' );

		cleanup();
	} );

	it( 'pins a taller-than-viewport flyout to the frame top and caps its height', () => {
		const { menu } = buildMenu();
		const { item, link } = addItem( menu, { top: 300, submenuHeight: 900 } );
		const cleanup = attach();

		hover( link );
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( `${ WRAP_TOP }px` );
		// Capped below its 900px content height, so it scrolls internally.
		expect( item.style.getPropertyValue( MAX_HEIGHT_VAR ) ).toBe(
			`${ VIEWPORT_HEIGHT - GAP - WRAP_TOP }px`
		);

		cleanup();
	} );

	it( 'never emits a negative max-height on an extremely short viewport', () => {
		window.innerHeight = 40; // Shorter than the frame top itself.
		const { menu } = buildMenu();
		const { item, link } = addItem( menu, { top: 100, submenuHeight: 200 } );
		const cleanup = attach();

		hover( link );
		expect( item.style.getPropertyValue( MAX_HEIGHT_VAR ) ).toBe( '0px' );

		cleanup();
	} );

	it( 'skips repositioning on pointer moves within the same item', () => {
		const { menu } = buildMenu();
		const { item, link } = addItem( menu, { top: 100, submenuHeight: 200 } );
		const cleanup = attach();

		hover( link );
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '100px' );

		// Pointer moves from the link to the submenu of the same item: no re-read.
		item.getBoundingClientRect = rect( 130 );
		link.dispatchEvent( new MouseEvent( 'pointerover', { bubbles: true, relatedTarget: item } ) );
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '100px' );

		// Coming from outside the item repositions again.
		link.dispatchEvent(
			new MouseEvent( 'pointerover', { bubbles: true, relatedTarget: document.body } )
		);
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '130px' );

		cleanup();
	} );

	it( 'positions on keyboard focus', () => {
		const { menu } = buildMenu();
		const { item, link } = addItem( menu, { top: 150, submenuHeight: 200 } );
		const cleanup = attach();

		link.dispatchEvent( new Event( 'focusin', { bubbles: true } ) );
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '150px' );

		cleanup();
	} );

	it( 'keeps an open flyout glued to its item while the menu scrolls', () => {
		const { wrap, menu } = buildMenu();
		const { item } = addItem( menu, { top: 200, submenuHeight: 200 } );
		item.classList.add( 'opensub' );
		const cleanup = attach();

		item.getBoundingClientRect = rect( 120 );
		wrap.dispatchEvent( new Event( 'scroll' ) );
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '120px' );

		cleanup();
	} );

	it( 'resets horizontal scroll on the wrap (focus-driven scrolling can nudge it)', () => {
		const { wrap, menu } = buildMenu();
		addItem( menu, { top: 200, submenuHeight: 200 } );
		const cleanup = attach();

		wrap.scrollLeft = 80;
		wrap.dispatchEvent( new Event( 'scroll' ) );
		expect( wrap.scrollLeft ).toBe( 0 );

		cleanup();
	} );

	it( 'positions a flyout already open on attach (hover during app load)', () => {
		const { menu } = buildMenu();
		const { item } = addItem( menu, { top: 250, submenuHeight: 200 } );
		item.classList.add( 'opensub' );

		const cleanup = attach();
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '250px' );

		cleanup();
	} );

	it( 'positions the focused item on attach when no flyout is hover-open', () => {
		const { menu } = buildMenu();
		const { item, link } = addItem( menu, { top: 350, submenuHeight: 200 } );
		link.focus();

		const cleanup = attach();
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '350px' );

		cleanup();
	} );

	it( 'detaches listeners and clears inline positioning on cleanup', () => {
		const { wrap, menu } = buildMenu();
		const { item, link } = addItem( menu, { top: 100, submenuHeight: 200 } );
		const cleanup = attach();

		hover( link );
		expect( item.style.getPropertyValue( TOP_VAR ) ).not.toBe( '' );

		cleanup();
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '' );
		expect( item.style.getPropertyValue( MAX_HEIGHT_VAR ) ).toBe( '' );

		hover( link );
		wrap.dispatchEvent( new Event( 'scroll' ) );
		expect( item.style.getPropertyValue( TOP_VAR ) ).toBe( '' );
	} );
} );
