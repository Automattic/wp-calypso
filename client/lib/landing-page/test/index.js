/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { getLoggedInLandingPage, goToLandingPage } from '../index';

// The resolver's own thunks only fetch data that these fixtures already provide,
// so a no-op dispatch matches how the state would look once they resolved.
function createStore( state ) {
	return { getState: jest.fn( () => state ), dispatch: jest.fn() };
}

describe( 'getLoggedInLandingPage', () => {
	if ( isEnabled( 'dashboard/enable-percentage-rollout' ) ) {
		test( 'rollout cohort user with no sites goes to Sites Dashboard', async () => {
			const state = { currentUser: { id: 1 }, sites: { items: {} }, ui: {} };

			await expect( getLoggedInLandingPage( createStore( state ) ) ).resolves.toBe(
				dashboardLink( '/sites' )
			);
		} );
	}

	test( 'user with a primary site but no permissions goes to day stats', async () => {
		const state = {
			currentUser: { id: 1, capabilities: { 1: {} }, user: { primary_blog: 1 } },
			ui: {},
			sites: {
				items: {
					1: {
						ID: 1,
						URL: 'https://test.wordpress.com',
					},
				},
			},
		};

		await expect( getLoggedInLandingPage( createStore( state ) ) ).resolves.toBe(
			'/stats/day/test.wordpress.com'
		);
	} );

	test( 'user with a primary site and edit permissions goes to My Home', async () => {
		const state = {
			currentUser: { id: 1, capabilities: { 1: { edit_posts: true } }, user: { primary_blog: 1 } },
			ui: {},
			sites: {
				items: {
					1: {
						ID: 1,
						URL: 'https://test.wordpress.com',
					},
				},
			},
		};

		await expect( getLoggedInLandingPage( createStore( state ) ) ).resolves.toBe(
			'/home/test.wordpress.com'
		);
	} );

	test( 'user with a Jetpack site set as their primary site goes to day stats', async () => {
		const state = {
			currentUser: { id: 1, capabilities: { 1: { edit_posts: true } }, user: { primary_blog: 1 } },
			ui: {},
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

		await expect( getLoggedInLandingPage( createStore( state ) ) ).resolves.toBe(
			'/stats/day/test.jurassic.ninja'
		);
	} );

	if ( isEnabled( 'dashboard/enable-percentage-rollout' ) ) {
		test( 'rollout cohort user who opts in goes to sites page', async () => {
			const state = {
				currentUser: {
					id: 1,
					capabilities: { 1: { edit_posts: true } },
					user: { primary_blog: 1, site_count: 2 },
				},
				preferences: {
					localValues: {
						'sites-landing-page': { useSitesAsLandingPage: true, updatedAt: 1111 },
						'reader-landing-page': { useReaderAsLandingPage: false, updatedAt: 1111 },
					},
				},
				ui: {},
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

			await expect( getLoggedInLandingPage( createStore( state ) ) ).resolves.toBe(
				dashboardLink( '/sites' )
			);
		} );
	}

	test( 'user who opts in goes to reader page', async () => {
		const state = {
			currentUser: {
				id: 1,
				capabilities: { 1: { edit_posts: true } },
				user: { primary_blog: 1, site_count: 2 },
			},
			preferences: {
				localValues: {
					'sites-landing-page': { useSitesAsLandingPage: false, updatedAt: 1111 },
					'reader-landing-page': { useReaderAsLandingPage: true, updatedAt: 1111 },
				},
			},
			ui: {},
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

		await expect( getLoggedInLandingPage( createStore( state ) ) ).resolves.toBe( '/reader' );
	} );

	test( 'user with a primary site using the Classic interface goes to WP Admin Dashboard', async () => {
		const state = {
			currentUser: {
				id: 1,
				capabilities: { 1: { edit_posts: true } },
				user: { primary_blog: 1 },
			},
			ui: {},
			sites: {
				items: {
					1: {
						ID: 1,
						URL: 'https://test.wordpress.com',
						options: {
							wpcom_admin_interface: 'wp-admin',
							admin_url: 'https://test.wordpress.com/wp-admin/',
						},
					},
				},
			},
		};

		await expect( getLoggedInLandingPage( createStore( state ) ) ).resolves.toBe(
			'https://test.wordpress.com/wp-admin/'
		);
	} );
} );

describe( 'goToLandingPage', () => {
	const originalLocation = window.location;

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			configurable: true,
		} );
	} );

	test( 'routes relative destinations through the supplied navigator', async () => {
		const state = {
			currentUser: { id: 1, capabilities: { 1: { edit_posts: true } }, user: { primary_blog: 1 } },
			ui: {},
			sites: { items: { 1: { ID: 1, URL: 'https://test.wordpress.com' } } },
		};
		const navigate = jest.fn();

		await goToLandingPage( createStore( state ), navigate );

		expect( navigate ).toHaveBeenCalledWith( '/home/test.wordpress.com' );
	} );

	test( 'sends absolute wp-admin destinations through a full page load', async () => {
		const state = {
			currentUser: { id: 1, capabilities: { 1: { edit_posts: true } }, user: { primary_blog: 1 } },
			ui: {},
			sites: {
				items: {
					1: {
						ID: 1,
						URL: 'https://test.wordpress.com',
						options: {
							wpcom_admin_interface: 'wp-admin',
							admin_url: 'https://test.wordpress.com/wp-admin/',
						},
					},
				},
			},
		};
		const assign = jest.fn();
		Object.defineProperty( window, 'location', { value: { assign }, configurable: true } );
		const navigate = jest.fn();

		await goToLandingPage( createStore( state ), navigate );

		expect( assign ).toHaveBeenCalledWith( 'https://test.wordpress.com/wp-admin/' );
		expect( navigate ).not.toHaveBeenCalled();
	} );
} );
