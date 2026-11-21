/**
 * @vitest-environment jsdom
 */
import { render } from '../../../test-utils';
import { leavePage, NavigationBlocker, NavigationBlockerRegistry } from '../index';

const originalLocation = window.location;

function unload() {
	const event = new Event( 'beforeunload', { cancelable: true } );
	window.dispatchEvent( event );
	return { prompted: event.defaultPrevented };
}

function renderUnsavedChanges() {
	return render(
		<>
			<NavigationBlockerRegistry />
			<NavigationBlocker shouldBlock />
		</>
	);
}

describe( 'leavePage', () => {
	// The router reads the path, search and hash when it is created.
	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			writable: true,
			value: {
				href: 'https://my.wordpress.com/me/account',
				origin: 'https://my.wordpress.com',
				pathname: '/me/account',
				search: '',
				hash: '',
			},
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', { writable: true, value: originalLocation } );
	} );

	test( 'leaves without the browser’s “Leave site?” prompt for unsaved changes', () => {
		renderUnsavedChanges();

		leavePage( 'https://wordpress.com/log-in' );

		expect( unload() ).toEqual( { prompted: false } );
		expect( window.location.href ).toBe( 'https://wordpress.com/log-in' );
	} );

	test( 'skips the prompt for that one page load only', () => {
		renderUnsavedChanges();

		leavePage( 'https://wordpress.com/log-in' );
		unload();

		expect( unload() ).toEqual( { prompted: true } );
	} );
} );
