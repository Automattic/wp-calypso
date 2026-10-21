/**
 * @jest-environment jsdom
 */
import flows, { getLaunchReturnUrl } from 'calypso/signup/config/flows';
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

		test( 'lands a wp-admin launch on the wp-admin root, where wp-admin celebrates it', () => {
			expect(
				getDestination( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'wp-admin',
					back_to: 'https://test-site.wordpress.com/wp-admin/tools.php',
				} )
			).toBe( 'https://test-site.wordpress.com/wp-admin?celebrate-launch=true' );
		} );

		test( 'lands a wp-admin launch on the screen its ref names', () => {
			expect(
				getDestination( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'wp-admin/options-reading.php',
					back_to: 'https://test-site.wordpress.com/wp-admin/options-reading.php',
				} )
			).toBe(
				'https://test-site.wordpress.com/wp-admin/options-reading.php?celebrate-launch=true'
			);
		} );

		test( 'uses the wp-admin celebration argument for a wp-admin back_to without ref', () => {
			expect(
				getDestination( {
					siteSlug: 'test-site.wordpress.com',
					back_to: 'https://test-site.wordpress.com/wp-admin/options-reading.php',
				} )
			).toBe(
				'https://test-site.wordpress.com/wp-admin/options-reading.php?celebrate-launch=true'
			);
		} );

		test( 'lands a wp-admin launch without back_to on the screen its ref names', () => {
			expect(
				getDestination( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'wp-admin/options-reading.php',
				} )
			).toBe(
				'https://test-site.wordpress.com/wp-admin/options-reading.php?celebrate-launch=true'
			);
		} );
	} );

	describe( 'site-selected destination', () => {
		beforeAll( () => {
			jest.restoreAllMocks();
		} );

		const getDestination = ( dependencies, localeSlug ) =>
			flows
				.getFlows()
				[ 'site-selected' ].destination(
					{ flowName: 'site-selected', ...dependencies },
					localeSlug
				);

		test.each( [
			'personal-bundle',
			'personal-bundle-monthly',
			'value_bundle',
			'value_bundle-2y',
			'business-bundle',
			'business-bundle-monthly',
		] )( 'hands a %s purchase over to the onboarding post-checkout step', ( product_slug ) => {
			expect( getDestination( { siteSlug: 'example.com', cartItems: [ { product_slug } ] } ) ).toBe(
				'/setup/onboarding/post-checkout-onboarding?siteSlug=example.com&ref=site-selected'
			);
		} );

		test.each( [
			[ 'the free plan', [ { product_slug: 'free_plan' } ] ],
			[ 'a plan without Big Sky', [ { product_slug: 'ecommerce-bundle' } ] ],
			[ 'an empty cart', [] ],
			[ 'no cart', null ],
		] )( 'lands on My Home with %s', ( _label, cartItems ) => {
			expect( getDestination( { siteSlug: 'example.com', cartItems } ) ).toBe(
				'/home/example.com?ref=site-selected'
			);
		} );

		test( 'keeps the locale on the post-checkout step', () => {
			expect(
				getDestination(
					{ siteSlug: 'example.com', cartItems: [ { product_slug: 'personal-bundle' } ] },
					'fr'
				)
			).toBe(
				'/setup/onboarding/post-checkout-onboarding/fr?siteSlug=example.com&ref=site-selected'
			);
		} );

		test( 'lands on redirect_to instead of the chooser when one is given', () => {
			expect(
				getDestination( {
					siteSlug: 'example.com',
					redirect_to: '/sites/example.com',
					cartItems: [ { product_slug: 'personal-bundle' } ],
				} )
			).toBe( '/sites/example.com' );
		} );
	} );

	describe( 'getLaunchReturnUrl', () => {
		test( 'returns to the exact wp-admin screen back_to names', () => {
			expect(
				getLaunchReturnUrl( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'wp-admin',
					back_to: 'https://test-site.wordpress.com/wp-admin/post.php?post=1&action=edit',
				} )
			).toBe( 'https://test-site.wordpress.com/wp-admin/post.php?post=1&action=edit' );
		} );

		test( 'falls back to the screen ref names without back_to', () => {
			expect(
				getLaunchReturnUrl( {
					siteSlug: 'test-site.wordpress.com',
					refParameter: 'wp-admin/options-reading.php',
					back_to: null,
				} )
			).toBe( 'https://test-site.wordpress.com/wp-admin/options-reading.php' );
		} );

		test( 'falls back to My Home without back_to or ref', () => {
			expect(
				getLaunchReturnUrl( { siteSlug: 'test-site', back_to: null, refParameter: null } )
			).toBe( '/home/test-site' );
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

		test( 'should return to My Home instead of the post-checkout step for the site-selected flow', () => {
			const flowsModule = require( 'calypso/signup/config/flows' );
			const { filterDestination } = flowsModule.default;

			const dependencies = {
				siteSlug: 'test-site',
				cartItems: [ { product_slug: 'personal-bundle' } ],
			};
			const destination =
				'/setup/onboarding/post-checkout-onboarding?siteSlug=test-site&ref=site-selected';

			const result = filterDestination( destination, dependencies, 'site-selected', 'en' );
			const { checkoutBackUrl, redirect_to } = Object.fromEntries(
				new URL( result, 'https://wordpress.com' ).searchParams
			);

			const backUrl = new URL( checkoutBackUrl );

			expect( backUrl.pathname + backUrl.search ).toBe(
				'/home/test-site?ref=site-selected&skippedCheckout=1'
			);
			expect( redirect_to ).toBe( destination );
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
