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

import router from '../index';

const routes = {
	'/plans': [ siteSelection, sites, makeLayout, clientRender ],
	'/plans/compare': [ siteSelection, navigation, redirectToPlans, makeLayout, clientRender ],
	'/plans/compare/:domain': [
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features': [ siteSelection, navigation, redirectToPlans, makeLayout, clientRender ],
	'/plans/features/:domain': [
		siteSelection,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features/:feature/:domain': [ features, makeLayout, clientRender ],
	'/plans/my-plan': [ siteSelection, sites, navigation, currentPlan, makeLayout, clientRender ],
	'/plans/my-plan/:site': [ siteSelection, navigation, currentPlan, makeLayout, clientRender ],
	'/plans/select/:plan/:domain': [ siteSelection, redirectToCheckout, makeLayout, clientRender ],
	'/plans/:intervalType?/:site': [ siteSelection, navigation, plans, makeLayout, clientRender ],
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
