/**
 * @jest-environment jsdom
 */
import { SITE_LAUNCH } from 'calypso/state/action-types';
import {
	launchSite,
	launchSiteOrRedirectToLaunchSignupFlow,
} from 'calypso/state/sites/launch/actions';

jest.mock( 'calypso/state/selectors/is-unlaunched-site', () => () => true );
jest.mock( 'calypso/state/sites/domains/selectors', () => ( {
	getDomainsBySiteId: () => [ { domain: 'example.wordpress.com' } ],
} ) );
jest.mock( 'calypso/state/sites/plans/selectors/is-site-big-sky-trial', () => () => false );
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	isSiteOnHostingTrial: () => false,
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: () => 'example.wordpress.com',
	isCurrentPlanPaid: () => false,
} ) );

describe( 'actions', () => {
	describe( '#launchSite', () => {
		test( 'should return an action when a site is launched', () => {
			const action = launchSite( 123 );
			expect( action ).toEqual( {
				type: SITE_LAUNCH,
				siteId: 123,
				meta: {
					dataLayer: {
						requestKey: 'SITE_LAUNCH-123',
						trackRequest: true,
					},
				},
			} );
		} );
	} );

	describe( '#launchSiteOrRedirectToLaunchSignupFlow', () => {
		const originalLocation = window.location;

		beforeAll( () => {
			Object.defineProperty( window, 'location', {
				value: { ...originalLocation, href: '' },
				writable: true,
				configurable: true,
			} );
		} );

		afterAll( () => {
			Object.defineProperty( window, 'location', {
				value: originalLocation,
				writable: true,
				configurable: true,
			} );
		} );

		test( 'should redirect an unlaunched free site to the Stepper launch-site flow', () => {
			const dispatch = jest.fn();

			launchSiteOrRedirectToLaunchSignupFlow( 1, 'my-home', 'My Site' )( dispatch, () => ( {} ) );

			const url = new URL( window.location.href, 'https://wordpress.com' );
			expect( url.pathname ).toBe( '/setup/launch-site' );
			expect( url.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
			expect( url.searchParams.get( 'source' ) ).toBe( 'my-home' );
			expect( url.searchParams.get( 'new' ) ).toBe( 'My Site' );
			expect( url.searchParams.has( 'hide_initial_query' ) ).toBe( false );
			expect( dispatch ).not.toHaveBeenCalled();
		} );
	} );
} );
