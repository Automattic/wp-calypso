jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '../controller', () => ( {
	overview: jest.fn(),
	insights: jest.fn(),
	site: jest.fn(),
	summary: jest.fn(),
	post: jest.fn(),
	follows: jest.fn(),
	wordAds: jest.fn(),
	redirectToActivity: jest.fn(),
	redirectToDefaultModulePage: jest.fn(),
	redirectToDefaultSitePage: jest.fn(),
	redirectToDefaultWordAdsPeriod: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/controller', () => ( {
	navigation: jest.fn(),
	siteSelection: jest.fn(),
	sites: jest.fn(),
} ) );
jest.mock( '../redirect-to-wp-admin-stats', () => jest.fn() );
jest.mock( 'calypso/controller', () => ( {
	makeLayout: jest.fn(),
	render: jest.fn(),
} ) );

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	overview,
	insights,
	site,
	summary,
	post,
	follows,
	wordAds,
	redirectToActivity,
	redirectToDefaultModulePage,
	redirectToDefaultSitePage,
	redirectToDefaultWordAdsPeriod,
} from '../controller';
import router from '../index';
import redirectToWpAdminStats from '../redirect-to-wp-admin-stats';

const validModules = [
	'posts',
	'referrers',
	'clicks',
	'countryviews',
	'locations',
	'authors',
	'videoplays',
	'videodetails',
	'filedownloads',
	'searchterms',
	'annualstats',
	'utm',
	'devices',
].join( '|' );

const validPeriods = [ 'day', 'week', 'month', 'year' ].join( '|' );
const validTrafficPagePeriods = [ 'hour', 'day', 'week', 'month', 'year' ].join( '|' );

const routes = {
	[ `/stats/:period(${ validPeriods })` ]: [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		overview,
		makeLayout,
		clientRender,
	],
	'/stats/insights': [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		sites,
		makeLayout,
		clientRender,
	],
	'/stats/insights/:site': [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		insights,
		makeLayout,
		clientRender,
	],
	[ `/stats/:period(${ validTrafficPagePeriods })/:site` ]: [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		site,
		makeLayout,
		clientRender,
	],
	[ `/stats/:module(${ validModules })/:site` ]: [ redirectToDefaultModulePage ],
	[ `/stats/:period(${ validPeriods })/:module(${ validModules })/:site` ]: [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		summary,
		makeLayout,
		clientRender,
	],
	'/stats/post/:post_id/:site': [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		post,
		makeLayout,
		clientRender,
	],
	'/stats/page/:post_id/:site': [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		post,
		makeLayout,
		clientRender,
	],
	'/stats/follows/comment/:site': [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		follows,
		makeLayout,
		clientRender,
	],
	'/stats/follows/comment/:page_num/:site': [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		follows,
		makeLayout,
		clientRender,
	],
	'/stats/activity/:site?': [ redirectToActivity ],
	[ `/stats/ads/:period(${ validPeriods })/:site` ]: [
		redirectToWpAdminStats,
		siteSelection,
		navigation,
		wordAds,
		makeLayout,
		clientRender,
	],
	'/stats/wordads/(.*)': [ redirectToDefaultWordAdsPeriod ],
	'/stats/ads/(.*)': [ redirectToDefaultWordAdsPeriod ],
	'/stats/(.*)': [ redirectToDefaultSitePage ],
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
