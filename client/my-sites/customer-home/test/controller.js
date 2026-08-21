/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { getLoggedInLandingPage } from 'calypso/lib/landing-page';
import { redirectToLandingPage } from '../controller';

jest.mock( 'calypso/lib/landing-page', () => ( {
	...jest.requireActual( 'calypso/lib/landing-page' ),
	getLoggedInLandingPage: jest.fn(),
} ) );

const mockStore = configureStore( [ thunk ] );

// Flush only the microtask queue, never a macrotask: `page.redirect` schedules its
// real `page.replace` on a timer, which would tear down the jsdom document.
const flushPromises = async () => {
	for ( let i = 0; i < 10; i++ ) {
		await Promise.resolve();
	}
};

const buildContext = ( { querystring = '' } = {} ) => ( {
	store: mockStore( {
		currentUser: { id: 1, user: { primary_blog: 1, site_count: 3, visible_site_count: 3 } },
		sites: { items: {} },
		ui: {},
	} ),
	path: '/home',
	pathname: '/home',
	querystring,
	query: {},
	params: {},
} );

describe( 'redirectToLandingPage', () => {
	let redirect;

	beforeEach( () => {
		redirect = jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		// Neutralize the timer `page.redirect` schedules, so a leaked navigation
		// cannot tear down the jsdom document while promises flush.
		jest.spyOn( page, 'replace' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'sends a multi-site Customer Home account to their primary site', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/home/test.wordpress.com' );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( '/home/test.wordpress.com' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'honors the sites-as-landing-page preference', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/sites' );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( '/sites' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'sends an absolute hosting-dashboard destination through a full page load', async () => {
		const destination = 'https://my.wordpress.com/sites';
		getLoggedInLandingPage.mockResolvedValue( destination );
		const assign = jest.fn();
		Object.defineProperty( window, 'location', { value: { assign }, configurable: true } );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( assign ).toHaveBeenCalledWith( destination );
		expect( redirect ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'carries the querystring across to the resolved destination', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/home/test.wordpress.com' );
		const next = jest.fn();

		redirectToLandingPage( buildContext( { querystring: 'verified=1' } ), next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( '/home/test.wordpress.com?verified=1' );
	} );

	it( 'falls through to the site picker when the resolver produces nothing usable', async () => {
		getLoggedInLandingPage.mockResolvedValue( undefined );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
		expect( redirect ).not.toHaveBeenCalled();
	} );

	it( 'falls through to the site picker when the resolver throws', async () => {
		getLoggedInLandingPage.mockRejectedValue( new Error( 'resolver failed' ) );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
		expect( redirect ).not.toHaveBeenCalled();
	} );

	it( 'falls through rather than redirecting to the route it is already on', async () => {
		getLoggedInLandingPage.mockResolvedValue( '/home' );
		const next = jest.fn();

		redirectToLandingPage( buildContext(), next );
		await flushPromises();

		expect( next ).toHaveBeenCalled();
		expect( redirect ).not.toHaveBeenCalled();
	} );
} );
