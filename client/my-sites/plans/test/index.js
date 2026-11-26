/**
 * @vitest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { vi } from 'vitest';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	navigation,
	siteSelection,
	sites,
	wpForTeamsP2PlusNotSupportedRedirect,
	stagingSiteNotSupportedRedirect,
	p2RedirectToHubPlans,
} from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import {
	features,
	plans,
	redirectToCheckout,
	redirectToPlans,
	redirectToPlansIfNotJetpack,
	redirectIfInvalidInterval,
} from '../controller';
import { currentPlan } from '../current-plan/controller';
import router from '../index';

vi.mock( '@automattic/calypso-router', () => ( { default: vi.fn() } ) );
vi.mock( '../controller', () => ( {
	features: vi.fn(),
	plans: vi.fn(),
	redirectIfInvalidInterval: vi.fn(),
	redirectToCheckout: vi.fn(),
	redirectToPlans: vi.fn(),
	redirectToPlansIfNotJetpack: vi.fn(),
} ) );
vi.mock( '../current-plan/controller', () => ( {
	currentPlan: vi.fn(),
} ) );
vi.mock( 'calypso/controller', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		makeLayout: vi.fn(),
		render: vi.fn(),
	} )
);
vi.mock( 'calypso/my-sites/controller', () => ( {
	navigation: vi.fn(),
	p2RedirectToHubPlans: vi.fn(),
	siteSelection: vi.fn(),
	sites: vi.fn(),
	stagingSiteNotSupportedRedirect: vi.fn(),
	wpForTeamsP2PlusNotSupportedRedirect: vi.fn(),
} ) );
vi.mock( 'calypso/my-sites/plans/jetpack-plans', () => ( { default: vi.fn() } ) );

const routes = {
	'/plans': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
		p2RedirectToHubPlans,
		sites,
		makeLayout,
		clientRender,
	],
	'/plans/compare': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
		navigation,
		p2RedirectToHubPlans,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/compare/:domain': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
		navigation,
		p2RedirectToHubPlans,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
		navigation,
		p2RedirectToHubPlans,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features/:domain': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
		navigation,
		p2RedirectToHubPlans,
		redirectToPlans,
		makeLayout,
		clientRender,
	],
	'/plans/features/:feature/:domain': [
		stagingSiteNotSupportedRedirect,
		features,
		makeLayout,
		clientRender,
	],
	'/plans/my-plan': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
		sites,
		navigation,
		p2RedirectToHubPlans,
		currentPlan,
		makeLayout,
		clientRender,
	],
	'/plans/my-plan/:site': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
		navigation,
		p2RedirectToHubPlans,
		currentPlan,
		makeLayout,
		clientRender,
	],
	'/plans/select/:plan/:domain': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
		p2RedirectToHubPlans,
		redirectToCheckout,
		makeLayout,
		clientRender,
	],
	'/plans/:intervalType?/:site': [
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		stagingSiteNotSupportedRedirect,
		redirectIfInvalidInterval,
		p2RedirectToHubPlans,
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
			stagingSiteNotSupportedRedirect,
			redirectToPlansIfNotJetpack,
			navigation
		);
	} );
} );
