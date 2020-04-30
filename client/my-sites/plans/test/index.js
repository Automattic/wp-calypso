jest.mock( 'page' );
jest.mock( '../controller' );
jest.mock( '../current-plan/controller' );
jest.mock( 'controller' );
jest.mock( 'my-sites/controller' );
jest.mock( 'lib/performance-tracking' );

const router = require( '../index' );

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
