jest.mock( 'page', () => jest.fn() );
jest.mock( '../controller', () => ( {
	features: jest.fn(),
	plans: jest.fn(),
	redirectToCheckout: jest.fn(),
	redirectToPlans: jest.fn(),
	redirectToPlansIfNotJetpack: jest.fn(),
} ) );
jest.mock( '../current-plan/controller', () => ( {
	currentPlan: jest.fn(),
} ) );
jest.mock( 'calypso/controller', () => ( {
	makeLayout: jest.fn(),
	render: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/controller', () => ( {
	navigation: jest.fn(),
	siteSelection: jest.fn(),
	sites: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/plans/jetpack-plans', () => jest.fn() );

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	features,
	plans,
	redirectToCheckout,
	redirectToPlans,
	redirectToPlansIfNotJetpack,
} from '../controller';
import { currentPlan } from '../current-plan/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	navigation,
	siteSelection,
	sites,
	wpForTeamsP2PlusNotSupportedRedirect,
} from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';

import router from '../index';

const routes = {
	'/plans': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		sites,
		makeLayout,
		clientRender,
	],
	'/plans/compare': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/compare/:domain': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features/:domain': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features/:feature/:domain': [ features, makeLayout, clientRender ],
	'/plans/my-plan': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		sites,
		navigation,
		currentPlan,
		makeLayout,
		clientRender,
	],
	'/plans/my-plan/:site': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		currentPlan,
		makeLayout,
		clientRender,
	],
	'/plans/select/:plan/:domain': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		redirectToCheckout,
		makeLayout,
		clientRender,
	],
	'/plans/:intervalType?/:site': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
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

describe( 'Loads Jetpack plan page', () => {
	it( 'Loads plans', () => {
		router();
		expect( jetpackPlans ).toHaveBeenCalledWith(
			'/plans',
			siteSelection,
			wpForTeamsP2PlusNotSupportedRedirect,
			redirectToPlansIfNotJetpack,
			navigation
		);
	} );
} );
