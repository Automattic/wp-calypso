jest.mock( 'page', () => jest.fn() );
jest.mock( '../controller', () => ( {
	features: jest.fn(),
	plans: jest.fn(),
	redirectToCheckout: jest.fn(),
	redirectToPlans: jest.fn(),
} ) );
jest.mock( '../current-plan/controller', () => ( {
	currentPlan: jest.fn(),
} ) );
jest.mock( 'controller', () => ( {
	makeLayout: jest.fn(),
	render: jest.fn(),
} ) );
jest.mock( 'my-sites/controller', () => ( {
	navigation: jest.fn(),
	siteSelection: jest.fn(),
	sites: jest.fn(),
} ) );
jest.mock( 'lib/performance-tracking', () => ( {
	trackNavigationStart: jest.fn(),
} ) );

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { features, plans, redirectToCheckout, redirectToPlans } from '../controller';
import { currentPlan } from '../current-plan/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { trackNavigationStart } from 'lib/performance-tracking';

import router from '../index';

// Return the same tag so we can make assertions in the tets
trackNavigationStart.mockImplementation( ( tag ) => tag );

const routes = {
	'/plans': [ 'plans', siteSelection, sites, makeLayout, clientRender ],
	'/plans/compare': [
		'plans',
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/compare/:domain': [
		'plans',
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features': [
		'plans',
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features/:domain': [
		'plans',
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features/:feature/:domain': [ 'plans', features, makeLayout, clientRender ],
	'/plans/my-plan': [
		'plans',
		siteSelection,
		sites,
		navigation,
		currentPlan,
		makeLayout,
		clientRender,
	],
	'/plans/my-plan/:site': [
		'plans',
		siteSelection,
		navigation,
		currentPlan,
		makeLayout,
		clientRender,
	],
	'/plans/select/:plan/:domain': [
		'plans',
		siteSelection,
		redirectToCheckout,
		makeLayout,
		clientRender,
	],
	'/plans/:intervalType?/:site': [
		'plans',
		siteSelection,
		navigation,
		plans,
		makeLayout,
		clientRender,
	],
};

describe( 'Sets all routes', () => {
	Object.entries( routes ).forEach( ( [ route, expectedMiddleware ] ) => {
		it( `Route ${ route } uses the correct middleware`, () => {
			router();
			const [ , ...actualMiddleware ] = page.mock.calls.find( ( [ path ] ) => path === route );
			expect( actualMiddleware ).toEqual( expectedMiddleware );
		} );
	} );
} );
