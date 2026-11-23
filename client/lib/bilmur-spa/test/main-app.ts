/**
 * @jest-environment jsdom
 */

import type * as BilmurSpaMainApp from '../main-app';
import type * as BilmurSpaModule from '../module';
import type { Context } from '@automattic/calypso-router';

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => ( key === 'bilmur_spa_url' ? '/bilmur-spa.min.js' : '' );
	config.isEnabled = ( feature: string ) => feature === 'bilmur-spa';
	return { __esModule: true, default: config };
} );

jest.mock( 'calypso/sections-helper', () => ( {
	getSections: () => [
		{ name: 'account', paths: [ '/me/account' ] },
		{ name: 'disabled', paths: [ '/me/disabled' ] },
		{ name: 'me', paths: [ '/me' ] },
		{ name: 'reader', paths: [ '/reader', '^/tags?' ] },
	],
} ) );

jest.mock( 'calypso/sections-filter', () => ( {
	__esModule: true,
	default: ( section: { name: string } ) => section.name !== 'disabled',
} ) );

describe( 'bilmur-spa main app', () => {
	let lib: typeof BilmurSpaMainApp;
	let loadBilmurSpa: ( typeof BilmurSpaModule )[ 'loadBilmurSpa' ];
	let module: { init: jest.Mock; startNavigation: jest.Mock; completeNavigation: jest.Mock };
	let importModule: jest.Mock;

	// What the router does with a path: run the middleware, then the route's own handlers.
	function navigate( canonicalPath: string, init = false ) {
		const context = { canonicalPath, init } as unknown as Context;
		const next = jest.fn();
		lib.trackNavigationStart( context, next );
		expect( next ).toHaveBeenCalledTimes( 1 );
		return context;
	}

	// What rendering the route's layout does once it's in the DOM.
	function commit( context: Context ) {
		lib.trackNavigationComplete( context.bilmurNavigationKey );
	}

	async function loadAndCommitPageLoad() {
		await loadBilmurSpa( importModule );
		commit( navigate( '/reader', true ) );
	}

	beforeEach( async () => {
		// The library keeps its state at the module level.
		jest.resetModules();
		lib = await import( '../main-app' );
		( { loadBilmurSpa } = await import( '../module' ) );
		module = { init: jest.fn(), startNavigation: jest.fn(), completeNavigation: jest.fn() };
		importModule = jest.fn().mockResolvedValue( module );
		document.head.innerHTML = '<meta id="bilmur" data-provider="wordpress.com" />';
	} );

	afterEach( () => {
		document.head.innerHTML = '';
	} );

	it( 'signals a navigation with its section and path, and its completion once the route is in the DOM', async () => {
		await loadAndCommitPageLoad();

		const context = navigate( '/me/account?tab=profile#details' );
		commit( context );

		expect( module.startNavigation ).toHaveBeenCalledTimes( 1 );
		expect( module.startNavigation ).toHaveBeenCalledWith(
			'account',
			'/me/account?tab=profile',
			expect.any( Object )
		);
		expect( module.completeNavigation ).toHaveBeenCalledWith(
			module.startNavigation.mock.calls[ 0 ][ 2 ]
		);
	} );

	it.each( [
		[ '/me/disabled', 'me' ],
		[ '/tag/photography', 'reader' ],
		[ '/nowhere', 'unknown' ],
	] )( 'names a navigation to %s "%s"', async ( path, routeName ) => {
		await loadAndCommitPageLoad();

		navigate( path );

		expect( module.startNavigation ).toHaveBeenCalledWith( routeName, path, expect.any( Object ) );
	} );

	it( 'leaves out the page load, along with a redirect that happens before anything is in the DOM', async () => {
		await loadBilmurSpa( importModule );

		navigate( '/', true );
		commit( navigate( '/reader' ) );

		expect( module.startNavigation ).not.toHaveBeenCalled();
		expect( module.completeNavigation ).not.toHaveBeenCalled();
	} );

	it( 'counts a path that is dispatched again as the same navigation', async () => {
		await loadAndCommitPageLoad();

		navigate( '/me' );
		commit( navigate( '/me#details' ) );

		expect( module.startNavigation ).toHaveBeenCalledTimes( 1 );
		expect( module.completeNavigation ).toHaveBeenCalledWith(
			module.startNavigation.mock.calls[ 0 ][ 2 ]
		);
	} );

	it( 'carries on with the navigation when the module throws', async () => {
		await loadAndCommitPageLoad();
		module.startNavigation.mockImplementation( () => {
			throw new Error( 'broken' );
		} );
		module.completeNavigation.mockImplementation( () => {
			throw new Error( 'broken' );
		} );

		const context = navigate( '/me' );

		expect( () => commit( context ) ).not.toThrow();
	} );
} );
