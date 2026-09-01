/**
 * @jest-environment jsdom
 */
import flows, { getWpAdminLaunchReturnUrl } from 'calypso/signup/config/flows';
import { generateFlows } from 'calypso/signup/config/flows-pure';
import mockedFlows from './fixtures/flows';

describe( 'Signup Flows Configuration', () => {
	describe( 'getFlow', () => {
		beforeAll( () => {
			jest.spyOn( flows, 'getFlows' ).mockReturnValue( mockedFlows );
		} );

		test( 'should return the full flow when the user is not logged in', () => {
			expect( flows.getFlow( 'main', false ).steps ).toEqual( [ 'user', 'domains' ] );
		} );

		test( 'should remove the user step from the flow when the user is logged in', () => {
			expect( flows.getFlow( 'main', true ).steps ).toEqual( [ 'domains' ] );
		} );
	} );

	describe( 'excludeSteps', () => {
		beforeAll( () => {
			jest.spyOn( flows, 'getFlows' ).mockReturnValue( mockedFlows );
		} );

		afterAll( () => {
			flows.excludeStep();
		} );

		test( 'should exclude domains step from getFlow', () => {
			flows.excludeStep( 'domains' );
			expect( flows.getFlow( 'main', false ).steps ).toEqual( [ 'user' ] );
		} );
	} );

	describe( 'getLaunchDestination', () => {
		test( 'should add celebrateLaunch=true query parameter to the destination URL', () => {
			const mockGetLaunchDestination = jest.fn( ( dependencies ) => {
				// Import the actual function from flows.js
				const { addQueryArgs } = require( 'calypso/lib/url' );
				return addQueryArgs( { celebrateLaunch: 'true' }, `/home/${ dependencies.siteSlug }` );
			} );

			const testFlows = generateFlows( {
				getLaunchDestination: mockGetLaunchDestination,
			} );

			const launchSiteFlow = testFlows[ 'launch-site' ];
			const dependencies = { siteSlug: 'test-site' };
			const destination = launchSiteFlow.destination( dependencies );

			expect( destination ).toBe( '/home/test-site?celebrateLaunch=true' );
		} );
	} );

	describe( 'launch-site destination', () => {
		beforeAll( () => {
			// The suites above stub `getFlows` with fixtures; these assertions need the real config.
			jest.restoreAllMocks();
		} );

		const getDestination = ( dependencies ) =>
			flows.getFlows()[ 'launch-site' ].destination( dependencies );

		test( 'returns the user to where the flow was started from', () => {
			expect(
				getDestination( {
					siteSlug: 'test-site',
					back_to: '/sites/test-site/settings/site-visibility',
				} )
			).toBe( '/sites/test-site/settings/site-visibility?celebrateLaunch=true' );
		} );

		test( 'prefers redirect_to, so the post-launch landing can differ from where Back goes', () => {
			expect(
				getDestination( {
					siteSlug: 'test-site',
					back_to: '/sites/test-site/settings/site-visibility',
					redirect_to: '/sites/test-site',
				} )
			).toBe( '/sites/test-site?celebrateLaunch=true' );
		} );

		test( 'falls back to back_to when redirect_to was cleared on flow entry', () => {
			expect(
				getDestination( {
					siteSlug: 'test-site',
					back_to: '/sites/test-site/settings/site-visibility',
					redirect_to: null,
				} )
			).toBe( '/sites/test-site/settings/site-visibility?celebrateLaunch=true' );
		} );

		test( 'returns the user to the wp-admin page the launch started from', () => {
			expect(
				getDestination( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'wp-admin/admin.php?page=stats',
				} )
			).toBe(
				'https://test-site.wordpress.com/wp-admin/admin.php?page=stats&celebrate-launch=true'
			);
		} );
	} );

	describe( 'getWpAdminLaunchReturnUrl', () => {
		test( 'resolves a bare wp-admin ref', () => {
			expect(
				getWpAdminLaunchReturnUrl( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'wp-admin',
				} )
			).toBe( 'https://test-site.wordpress.com/wp-admin' );
		} );

		test( 'resolves a ref pointing at a specific wp-admin page', () => {
			expect(
				getWpAdminLaunchReturnUrl( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'wp-admin/admin.php?page=stats',
				} )
			).toBe( 'https://test-site.wordpress.com/wp-admin/admin.php?page=stats' );
		} );

		test( 'returns null for launches that did not start in wp-admin', () => {
			expect(
				getWpAdminLaunchReturnUrl( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'calypso',
				} )
			).toBeNull();
			expect( getWpAdminLaunchReturnUrl( { siteSlug: 'test-site.wordpress.com' } ) ).toBeNull();
		} );

		test( 'keeps the URL on the site host for a ref that only looks like a wp-admin path', () => {
			expect(
				getWpAdminLaunchReturnUrl( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'wp-admin.evil.com',
				} )
			).toBeNull();
		} );
	} );

	describe( 'filterDestination with checkout URLs', () => {
		// Mock the required modules
		beforeAll( () => {
			// Mock getQueryArgs to return empty object
			jest.doMock( 'calypso/lib/query-args', () => ( {
				getQueryArgs: () => ( {} ),
			} ) );

			// Mock pathToUrl to return the path as-is
			jest.doMock( 'calypso/lib/url', () => ( {
				addQueryArgs: jest.requireActual( 'calypso/lib/url' ).addQueryArgs,
				pathToUrl: ( path ) => `https://wordpress.com${ path }`,
			} ) );
		} );

		test( 'should add celebrateLaunch=true to checkout back URL when flow is launch-site', () => {
			// Import the actual filterDestination function
			const flowsModule = require( 'calypso/signup/config/flows' );
			const { filterDestination } = flowsModule.default;

			const dependencies = {
				siteSlug: 'test-site',
				cartItem: 'premium_plan', // This will trigger checkout redirect
			};
			const destination = '/home/test-site';
			const flowName = 'launch-site';
			const localeSlug = 'en';

			const result = filterDestination( destination, dependencies, flowName, localeSlug );

			// The result should be a checkout URL with celebrateLaunch in the checkoutBackUrl
			expect( result ).toContain( '/checkout/test-site' );
			expect( result ).toContain( 'checkoutBackUrl=' );
			expect( result ).toContain( 'celebrateLaunch%3Dtrue' ); // URL encoded celebrateLaunch=true
		} );

		test( 'should not add celebrateLaunch=true to non-launch-site flows', () => {
			const flowsModule = require( 'calypso/signup/config/flows' );
			const { filterDestination } = flowsModule.default;

			const dependencies = {
				siteSlug: 'test-site',
				cartItem: 'premium_plan',
			};
			const destination = '/home/test-site';
			const flowName = 'onboarding';
			const localeSlug = 'en';

			const result = filterDestination( destination, dependencies, flowName, localeSlug );

			expect( result ).toContain( '/checkout/test-site' );
			expect( result ).toContain( 'checkoutBackUrl=' );
			expect( result ).not.toContain( 'celebrateLaunch%3Dtrue' );
		} );

		test( 'should return to the plans grid with the plugin params for the with-plugin flow', () => {
			// getQueryArgs is mocked to return {} above, so this also guards that the params come
			// from the dependency store rather than the (empty) current URL query.
			const flowsModule = require( 'calypso/signup/config/flows' );
			const { filterDestination } = flowsModule.default;

			const dependencies = {
				siteSlug: 'test-site',
				cartItem: 'business_plan',
				pluginParameter: 'sensei-pro',
				pluginBillingPeriod: 'ANNUALLY',
			};
			const destination = '/marketplace/thank-you/test-site?plugins=sensei-pro';

			const result = filterDestination( destination, dependencies, 'with-plugin', 'en' );

			expect( result ).toContain( 'plans-with-plugin' );
			expect( result ).toContain( 'plugin%3Dsensei-pro' );
			expect( result ).toContain( 'billing_period%3DANNUALLY' );
			expect( result ).toContain( 'intervalType%3Dyearly' );
		} );

		test( 'should still include an empty billing_period for a free plugin', () => {
			// A free plugin has no billing period, but billing_period is a required query dependency,
			// so the back URL must still carry it (empty) or the flow controller rejects the URL.
			const flowsModule = require( 'calypso/signup/config/flows' );
			const { filterDestination } = flowsModule.default;

			const dependencies = {
				siteSlug: 'test-site',
				cartItem: 'personal_plan',
				pluginParameter: 'mailpoet',
			};
			const destination = '/marketplace/plugin/mailpoet/install/test-site';

			const result = filterDestination( destination, dependencies, 'with-plugin', 'en' );

			expect( result ).toContain( 'plans-with-plugin' );
			expect( result ).toContain( 'plugin%3Dmailpoet' );
			expect( result ).toContain( 'billing_period%3D' );
			expect( result ).not.toContain( 'intervalType' );
		} );
	} );
} );
