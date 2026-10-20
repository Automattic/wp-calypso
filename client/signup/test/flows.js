/**
 * @jest-environment jsdom
 */
import flows from 'calypso/signup/config/flows';
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

		test( 'should not add celebrateLaunch=true to the checkout back URL', () => {
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
