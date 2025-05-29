/**
 * @jest-environment jsdom
 */

import nock from 'nock';
import flows from 'calypso/signup/config/flows';
import { createSiteWithCart, isDomainFulfilled, isPlanFulfilled } from '../step-actions';

jest.mock( 'calypso/signup/config/steps', () => require( './mocks/signup/config/steps' ) );
jest.mock( 'calypso/signup/config/flows', () => require( './mocks/signup/config/flows' ) );
jest.mock( 'calypso/signup/config/flows-pure', () =>
	require( './mocks/signup/config/flows-pure' )
);

// A Promise wrapper around the callback which resolves after the callback completes
// to ensure jest waits for the test to finish.
async function testCreateSite( cb, ...args ) {
	return new Promise( ( resolve ) => {
		createSiteWithCart(
			( response ) => {
				cb( response );
				resolve();
			},
			...args
		);
	} );
}

describe( 'createSiteWithCart()', () => {
	// createSiteWithCart() function is not designed to be easy for test at the moment.
	// Thus we intentionally mock the failing case here so that the parts we want to test
	// would be easier to write.
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.post( '/rest/v1.1/sites/new' )
		.reply( 400, function ( uri, requestBody ) {
			return {
				error: 'error',
				message: 'something goes wrong!',
				requestBody,
			};
		} );

	test( 'should find available url if siteUrl is empty and enable auto generated blog name', async () => {
		expect.assertions( 1 );
		const fakeStore = {
			getState: () => ( {
				signup: { dependencyStore: { shouldHideFreePlan: true } },
			} ),
		};

		await testCreateSite(
			( response ) => {
				expect( response.requestBody.find_available_url ).toBe( true );
			},
			[],
			{ siteUrl: undefined },
			fakeStore
		);
	} );

	test( "don't automatically find available url if siteUrl is defined", async () => {
		expect.assertions( 1 );
		const fakeStore = {
			getState: () => ( {} ),
		};

		await testCreateSite(
			( response ) => {
				expect( response.requestBody.find_available_url ).toBeFalsy();
			},
			[],
			{ siteUrl: 'mysite' },
			fakeStore
		);
	} );

	test( 'use username for blog_name if user data available and enable auto generated blog name', async () => {
		expect.assertions( 1 );
		const fakeStore = {
			getState: () => ( {
				currentUser: {
					user: {
						username: 'alex',
					},
				},
				signup: { dependencyStore: { shouldHideFreePlan: true } },
			} ),
		};

		await testCreateSite(
			( response ) => {
				expect( response.requestBody.blog_name ).toBe( 'alex' );
			},
			[],
			{ siteUrl: undefined },
			fakeStore
		);
	} );

	test( "use username from dependency store for blog_name if user data isn't available and enable auto generated blog name", async () => {
		expect.assertions( 1 );
		const fakeStore = {
			getState: () => ( {
				signup: { dependencyStore: { username: 'alex', shouldHideFreePlan: true } },
			} ),
		};

		await testCreateSite(
			( response ) => {
				expect( response.requestBody.blog_name ).toBe( 'alex' );
			},
			[],
			{ siteUrl: undefined },
			fakeStore
		);
	} );
} );

describe( 'isDomainFulfilled', () => {
	const submitSignupStep = jest.fn();
	const wpcomDomain = [ { domain: 'example.wordpress.com', isWPCOMDomain: true } ];
	const customDomain = { domain: 'example.com', isWPCOMDomain: false };
	const wpcomAndCustomDomains = [
		{ domain: 'example.wordpress.com', isWPCOMDomain: true },
		customDomain,
	];

	beforeEach( () => {
		flows.excludeStep.mockClear();
		submitSignupStep.mockClear();
	} );

	test( 'should call `submitSignupStep` with empty domainItem when site has custom domains', () => {
		const stepName = 'domains-launch';
		const nextProps = { siteDomains: wpcomAndCustomDomains, submitSignupStep };

		expect( submitSignupStep ).not.toHaveBeenCalled();

		isDomainFulfilled( stepName, undefined, nextProps );

		expect( submitSignupStep ).toHaveBeenCalledWith(
			{ stepName, domainItem: undefined },
			{ domainItem: undefined }
		);
	} );

	test( 'should call `flows.excludeStep` with the stepName when site has custom domains', () => {
		const stepName = 'domains-launch';
		const nextProps = { siteDomains: wpcomAndCustomDomains, submitSignupStep };

		expect( flows.excludeStep ).not.toHaveBeenCalled();

		isDomainFulfilled( stepName, undefined, nextProps );

		expect( flows.excludeStep ).toHaveBeenCalledWith( stepName );
	} );

	test( 'should not remove step when site only has WordPress.com domains', () => {
		const stepName = 'domains-launch';
		const nextProps = { siteDomains: wpcomDomain, submitSignupStep };

		expect( flows.excludeStep ).not.toHaveBeenCalled();
		expect( submitSignupStep ).not.toHaveBeenCalled();

		isDomainFulfilled( stepName, undefined, nextProps );

		expect( submitSignupStep ).not.toHaveBeenCalled();
		expect( flows.excludeStep ).not.toHaveBeenCalled();
	} );

	test( 'should not remove step when domains are still loading (siteId exists but no siteDomains)', () => {
		const stepName = 'domains-launch';
		const nextProps = { siteId: 123, siteDomains: [], submitSignupStep };

		expect( flows.excludeStep ).not.toHaveBeenCalled();
		expect( submitSignupStep ).not.toHaveBeenCalled();

		isDomainFulfilled( stepName, undefined, nextProps );

		expect( submitSignupStep ).not.toHaveBeenCalled();
		expect( flows.excludeStep ).not.toHaveBeenCalled();
	} );

	test( 'should not remove step when domains are still loading (siteId exists but siteDomains is undefined)', () => {
		const stepName = 'domains-launch';
		const nextProps = { siteId: 123, siteDomains: undefined, submitSignupStep };

		expect( flows.excludeStep ).not.toHaveBeenCalled();
		expect( submitSignupStep ).not.toHaveBeenCalled();

		isDomainFulfilled( stepName, undefined, nextProps );

		expect( submitSignupStep ).not.toHaveBeenCalled();
		expect( flows.excludeStep ).not.toHaveBeenCalled();
	} );
} );

describe( 'isPlanFulfilled()', () => {
	const submitSignupStep = jest.fn();

	beforeEach( () => {
		flows.excludeStep.mockClear();
		submitSignupStep.mockClear();
	} );

	test( 'should remove a step for existing paid plan', () => {
		const stepName = 'plans';
		const nextProps = {
			isPaidPlan: true,
			sitePlanSlug: 'sitePlanSlug',
			submitSignupStep,
		};

		expect( flows.excludeStep ).not.toHaveBeenCalled();
		expect( submitSignupStep ).not.toHaveBeenCalled();

		isPlanFulfilled( stepName, undefined, nextProps );

		expect( submitSignupStep ).toHaveBeenCalledWith(
			{ stepName, undefined, wasSkipped: true },
			{ cartItem: undefined }
		);
		expect( flows.excludeStep ).toHaveBeenCalledWith( stepName );
	} );

	test( 'should remove a step when provided a cartItem default dependency', () => {
		const stepName = 'plans';
		const nextProps = {
			isPaidPlan: false,
			sitePlanSlug: 'sitePlanSlug',
			submitSignupStep,
		};
		const defaultDependencies = { cartItem: 'testPlan' };
		const cartItems = [ { product_slug: defaultDependencies.cartItem } ];

		expect( flows.excludeStep ).not.toHaveBeenCalled();
		expect( submitSignupStep ).not.toHaveBeenCalled();

		isPlanFulfilled( stepName, defaultDependencies, nextProps );

		expect( submitSignupStep ).toHaveBeenCalledWith(
			{ stepName, cartItems, wasSkipped: true },
			{ cartItems }
		);
		expect( flows.excludeStep ).toHaveBeenCalledWith( stepName );
	} );

	test( 'should not remove unfulfilled step', () => {
		const stepName = 'plans';
		const nextProps = {
			isPaidPlan: false,
			sitePlanSlug: 'sitePlanSlug',
			submitSignupStep,
		};

		expect( flows.excludeStep ).not.toHaveBeenCalled();
		expect( submitSignupStep ).not.toHaveBeenCalled();

		isPlanFulfilled( stepName, undefined, nextProps );

		expect( flows.excludeStep ).not.toHaveBeenCalled();
		expect( submitSignupStep ).not.toHaveBeenCalled();
	} );
} );
