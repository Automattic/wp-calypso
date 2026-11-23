import { vi } from 'vitest';
import globalPage from '../src';

describe( 'unsafe URL schemes', () => {
	function setup( { href = 'https://wordpress.com/sites', hashbang = false } = {} ) {
		const url = new URL( href );
		const location = {
			href,
			protocol: url.protocol,
			pathname: url.pathname,
			search: url.search,
			hash: url.hash,
		};
		const window = {
			location,
			addEventListener() {},
			removeEventListener: vi.fn(),
			document: { title: '', addEventListener() {}, removeEventListener() {} },
			history: { pushState: vi.fn(), replaceState: vi.fn() },
		};
		const page = globalPage.create();
		const middleware = vi.fn( ( _context, next ) => next() );
		page( '*', middleware );
		page.start( {
			window,
			popstate: false,
			click: false,
			hashbang,
		} );
		middleware.mockClear();
		window.removeEventListener.mockClear();
		window.history.pushState.mockClear();
		window.history.replaceState.mockClear();
		return { page, location, window, middleware };
	}

	const unsafeUrls = [
		'javascript:alert(1)',
		'JaVaScRiPt:%0Aalert(1)',
		' javascript:alert(1)',
		'javascript://x/%0Aalert(1)',
		'data:text/html,hi',
	];

	it.each( unsafeUrls )( 'does not dispatch or navigate to %s', ( path ) => {
		const { page, location, middleware } = setup();
		page( path );
		page.replace( path );
		expect( middleware ).not.toHaveBeenCalled();
		expect( location.href ).toBe( 'https://wordpress.com/sites' );
	} );

	it.each( unsafeUrls )( 'leaves the router state unchanged for %s', ( path ) => {
		const { page, window } = setup();
		const previousContext = page.prevContext;
		page( path );
		page.replace( path );
		expect( page.current ).toBe( '/sites' );
		expect( page.prevContext ).toBe( previousContext );
		expect( window.history.pushState ).not.toHaveBeenCalled();
		expect( window.history.replaceState ).not.toHaveBeenCalled();
		expect( window.removeEventListener ).not.toHaveBeenCalled();
	} );

	it( 'does a full page load for unmatched http(s) URLs', () => {
		const { page, location } = setup();
		page.callbacks = [];
		page( '/not-a-route' );
		expect( location.href ).toBe( '/not-a-route' );
	} );

	it( 'does a full page load for unmatched paths on a file: page in hashbang mode', () => {
		const { page, location } = setup( {
			href: 'file:///app/index.html',
			hashbang: true,
		} );
		page.callbacks = [];
		page( '/unknown' );
		expect( location.href ).toBe( '/app/index.html#!/unknown' );
	} );
} );
