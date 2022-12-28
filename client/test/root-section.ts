/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { waitFor } from '@testing-library/dom';
import pageLibrary from 'page';
import initRootSection from '../root';

function initRouter( { state }: { state: any } ) {
	const dispatch = jest.fn();
	const getState = jest.fn( () => state );

	const page = pageLibrary.create();
	page( '*', ( context, next ) => {
		context.store = { dispatch, getState };
		next();
	} );
	initRootSection( null, page );
	page.start();

	return { dispatch, getState, page };
}

describe( 'Logged Out Landing Page', () => {
	test( 'logged out goes to devdocs', async () => {
		// This is the behaviour only in non-production environments
		expect( isEnabled( 'devdocs/redirect-loggedout-homepage' ) ).toBeTruthy();

		const state = { currentUser: { id: null } };
		const { page } = initRouter( { state } );

		page( '/' );

		await waitFor( () => expect( page.current ).toBe( '/devdocs/start' ) );
	} );
} );

describe( 'Logged In Landing Page', () => {
	test( 'user with no sites goes to reader', async () => {
		const state = { currentUser: { id: 1 }, sites: { items: {} } };
		const { page } = initRouter( { state } );

		page( '/' );

		await waitFor( () => expect( page.current ).toBe( '/read' ) );
	} );

	test( 'user with a primary site but no permissions goes to stats', async () => {
		const state = {
			currentUser: { id: 1, capabilities: { 1: {} }, user: { primary_blog: 1 } },
			sites: {
				items: {
					1: {
						ID: 1,
						URL: 'https://test.wordpress.com',
					},
				},
			},
		};
		const { page } = initRouter( { state } );

		page( '/' );

		await waitFor( () => expect( page.current ).toBe( '/stats/test.wordpress.com' ) );
	} );

	test( 'user with a primary site and edit permissions goes to My Home', async () => {
		const state = {
			currentUser: { id: 1, capabilities: { 1: { edit_posts: true } }, user: { primary_blog: 1 } },
			sites: {
				items: {
					1: {
						ID: 1,
						URL: 'https://test.wordpress.com',
					},
				},
			},
		};
		const { page } = initRouter( { state } );

		page( '/' );

		await waitFor( () => expect( page.current ).toBe( '/home/test.wordpress.com' ) );
	} );

	test( 'user with a Jetpack site set as their primary site goes to stats', async () => {
		const state = {
			currentUser: { id: 1, capabilities: { 1: { edit_posts: true } }, user: { primary_blog: 1 } },
			sites: {
				items: {
					1: {
						ID: 1,
						URL: 'https://test.jurassic.ninja',
						jetpack: true,
					},
				},
			},
		};
		const { page } = initRouter( { state } );

		page( '/' );

		await waitFor( () => expect( page.current ).toBe( '/stats/test.jurassic.ninja' ) );
	} );

	test( 'user who opts in goes to sites page', async () => {
		const state = {
			currentUser: {
				id: 1,
				capabilities: { 1: { edit_posts: true } },
				user: { primary_blog: 1, site_count: 2 },
			},
			preferences: {
				localValues: {
					'sites-landing-page': { useSitesAsLandingPage: true, updatedAt: 1111 },
				},
			},
			sites: {
				items: {
					1: {
						ID: 1,
						URL: 'https://test.wordpress.com',
					},
					2: {
						ID: 2,
						URL: 'https://test.jurassic.ninja',
						jetpack: true,
					},
				},
			},
		};
		const { page } = initRouter( { state } );

		page( '/' );

		await waitFor( () => expect( page.current ).toBe( '/sites' ) );
	} );

	test( 'user who opts in but only has 1 site does not go to sites page', async () => {
		const state = {
			currentUser: {
				id: 1,
				capabilities: { 1: { edit_posts: true } },
				user: { primary_blog: 1, site_count: 1 },
			},
			preferences: {
				localValues: {
					'sites-landing-page': { useSitesAsLandingPage: true, updatedAt: 1111 },
				},
			},
			sites: {
				items: {
					1: {
						ID: 1,
						URL: 'https://test.wordpress.com',
					},
				},
			},
		};
		const { page } = initRouter( { state } );

		page( '/' );

		await waitFor( () => expect( page.current ).toBe( '/home/test.wordpress.com' ) );
	} );
} );
