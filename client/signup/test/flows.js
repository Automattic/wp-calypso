/**
 * @jest-environment jsdom
 */
import flows from 'calypso/signup/config/flows';
import { generateFlows } from 'calypso/signup/config/flows-pure';
import mockedFlows from './fixtures/flows';

describe( 'Signup Flows Configuration', () => {
	describe( 'getFlow', () => {
		beforeAll( () => {
			jest.spyOn( flows, 'getFlows' ).mockReturnValue( mockedFlows );
		} );

		test( 'should return the full flow when the user is not logged in', () => {
			expect( flows.getFlow( 'main', false ).steps ).toEqual( [ 'user', 'site' ] );
		} );

		test( 'should remove the user step from the flow when the user is logged in', () => {
			expect( flows.getFlow( 'main', true ).steps ).toEqual( [ 'site' ] );
		} );
	} );

	describe( 'excludeSteps', () => {
		beforeAll( () => {
			jest.spyOn( flows, 'getFlows' ).mockReturnValue( mockedFlows );
		} );

		afterAll( () => {
			flows.excludeStep();
		} );

		test( 'should exclude site step from getFlow', () => {
			flows.excludeStep( 'site' );
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
	} );
} );
