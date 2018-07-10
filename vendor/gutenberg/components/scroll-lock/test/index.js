/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import { createScrollLockComponent } from '..';

describe( 'scroll-lock', () => {
	const lockingClassName = 'test-lock-scroll';

	// Use a separate document to reduce the risk of test side-effects.
	let testDocument = null;
	let ScrollLock = null;
	let wrapper = null;

	function expectLocked( locked ) {
		expect( testDocument.documentElement.classList.contains( lockingClassName ) ).toBe( locked );
		// Assert against `body` because `scrollingElement` does not exist on our test DOM implementation.
		expect( testDocument.body.classList.contains( lockingClassName ) ).toBe( locked );
	}

	beforeEach( () => {
		testDocument = document.implementation.createHTMLDocument( 'Test scroll-lock' );
		ScrollLock = createScrollLockComponent( {
			htmlDocument: testDocument,
			className: lockingClassName,
		} );
	} );

	afterEach( () => {
		testDocument = null;

		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'locks when mounted', () => {
		expectLocked( false );
		wrapper = mount( <ScrollLock /> );
		expectLocked( true );
	} );
	it( 'unlocks when unmounted', () => {
		wrapper = mount( <ScrollLock /> );
		expectLocked( true );
		wrapper.unmount();
		expectLocked( false );
	} );
} );
