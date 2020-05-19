jest.mock( 'page', () => jest.fn() );
jest.mock( '../controller', () => jest.fn() );
jest.mock( 'my-sites/controller', () => ( {
	navigation: jest.fn(),
	siteSelection: jest.fn(),
	sites: jest.fn(),
} ) );

jest.mock( 'lib/route', () => ( {
	getStatsDefaultSitePage: jest.fn(),
} ) );
jest.mock( 'my-sites/activity/controller', () => ( {
	redirect: jest.fn(),
} ) );
jest.mock( 'config', () => ( {
	isEnabled: jest.fn(),
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
import { redirect as redirectToAcivity } from 'my-sites/activity/controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

import router from '../index';

config.isEnabled.mockImplementation( ( flag ) => flag === 'manage/stats' );

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
];
const validPeriods = [ 'day', 'week', 'month', 'year' ];

const routes = {
	'/stats/day': [ siteSelection, navigation, statsController.overview, makeLayout, clientRender ],
	'/stats/week': [ siteSelection, navigation, statsController.overview, makeLayout, clientRender ],
	'/stats/month': [ siteSelection, navigation, statsController.overview, makeLayout, clientRender ],
	'/stats/year': [ siteSelection, navigation, statsController.overview, makeLayout, clientRender ],
	'/stats/insights': [ siteSelection, navigation, sites, makeLayout, clientRender ],
	'/stats/insights/:site': [
		siteSelection,
		navigation,
		statsController.insights,
		makeLayout,
		clientRender,
	],
	'/stats/day/:site': [ siteSelection, navigation, statsController.site, makeLayout, clientRender ],
	'/stats/week/:site': [
		siteSelection,
		navigation,
		statsController.site,
		makeLayout,
		clientRender,
	],
	'/stats/month/:site': [
		siteSelection,
		navigation,
		statsController.site,
		makeLayout,
		clientRender,
	],
	'/stats/year/:site': [
		siteSelection,
		navigation,
		statsController.site,
		makeLayout,
		clientRender,
	],
	[ `/stats/:module(${ validModules.join( '|' ) })/:site` ]: [
		statsController.redirectToDefaultModulePage,
	],
	[ `/stats/day/:module(${ validModules.join( '|' ) })/:site` ]: [
		siteSelection,
		navigation,
		statsController.summary,
		makeLayout,
		clientRender,
	],
	[ `/stats/week/:module(${ validModules.join( '|' ) })/:site` ]: [
		siteSelection,
		navigation,
		statsController.summary,
		makeLayout,
		clientRender,
	],
	[ `/stats/month/:module(${ validModules.join( '|' ) })/:site` ]: [
		siteSelection,
		navigation,
		statsController.summary,
		makeLayout,
		clientRender,
	],
	[ `/stats/year/:module(${ validModules.join( '|' ) })/:site` ]: [
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
	'/stats/activity': [ siteSelection, sites, redirectToAcivity, makeLayout, clientRender ],
	'/stats/activity/:site': [
		siteSelection,
		navigation,
		redirectToAcivity,
		makeLayout,
		clientRender,
	],
	[ `/stats/ads/:period(${ validPeriods.join( '|' ) })/:site` ]: [
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
