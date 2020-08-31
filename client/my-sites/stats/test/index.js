jest.mock( 'page', () => jest.fn() );
jest.mock( '../controller', () => jest.fn() );
jest.mock( 'my-sites/controller', () => ( {
	navigation: jest.fn(),
	siteSelection: jest.fn(),
	sites: jest.fn(),
} ) );
jest.mock( 'controller', () => ( {
	makeLayout: jest.fn(),
	render: jest.fn(),
} ) );

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import statsController from '../controller';
import { makeLayout, render as clientRender } from 'controller';

import router from '../index';

const validModules = [
	'posts',
	'referrers',
	'clicks',
	'countryviews',
	'authors',
	'videoplays',
	'videodetails',
	'filedownloads',
	'searchterms',
	'annualstats',
].join( '|' );

const validPeriods = [ 'day', 'week', 'month', 'year' ].join( '|' );

const routes = {
	[ `/stats/:period(${ validPeriods })` ]: [
		siteSelection,
		navigation,
		statsController.overview,
		makeLayout,
		clientRender,
	],
	'/stats/insights': [ siteSelection, navigation, sites, makeLayout, clientRender ],
	'/stats/insights/:site': [
		siteSelection,
		navigation,
		statsController.insights,
		makeLayout,
		clientRender,
	],
	[ `/stats/:period(${ validPeriods })/:site` ]: [
		siteSelection,
		navigation,
		statsController.site,
		makeLayout,
		clientRender,
	],
	[ `/stats/:module(${ validModules })/:site` ]: [ statsController.redirectToDefaultModulePage ],
	[ `/stats/:period(${ validPeriods })/:module(${ validModules })/:site` ]: [
		siteSelection,
		navigation,
		statsController.summary,
		makeLayout,
		clientRender,
	],
	'/stats/post/:post_id/:site': [
		siteSelection,
		navigation,
		statsController.post,
		makeLayout,
		clientRender,
	],

	'/stats/page/:post_id/:site': [
		siteSelection,
		navigation,
		statsController.post,
		makeLayout,
		clientRender,
	],
	'/stats/follows/comment/:site': [
		siteSelection,
		navigation,
		statsController.follows,
		makeLayout,
		clientRender,
	],
	'/stats/follows/comment/:page_num/:site': [
		siteSelection,
		navigation,
		statsController.follows,
		makeLayout,
		clientRender,
	],
	'/stats/activity/:site?': [ statsController.redirectToAcivity ],
	[ `/stats/ads/:period(${ validPeriods })/:site` ]: [
		siteSelection,
		navigation,
		statsController.wordAds,
		makeLayout,
		clientRender,
	],
	'/stats/wordads/(.*)': [ statsController.redirectToDefaultWordAdsPeriod ],
	'/stats/ads/(.*)': [ statsController.redirectToDefaultWordAdsPeriod ],
	'/stats/(.*)': [ statsController.redirectToDefaultSitePage ],
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
