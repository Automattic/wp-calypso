import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	requestRecommendedSites as requestRecommendedSitesAction,
	receiveRecommendedSites,
} from 'calypso/state/reader/recommended-sites/actions';
import {
	requestRecommendedSites,
	addRecommendedSites,
	mapResponseToRecommendedSites,
	RecommendedSitesBody,
	RecommendedSite,
} from '../index';

const algorithm = 'chicken-recs/es1';
const seed = 42;
const response: RecommendedSitesBody = {
	algorithm,
	sites: [
		{
			blog_id: 19096129,
			blog_title: 'Bente Haarstad Photography&amp;',
			blog_url: 'http://bentehaarstad.wordpress.com',
			description: 'Description 1',
			feed_id: 185124,
			feed_url: 'http://bentehaarstad.wordpress.com/feed/',
			icon: {
				ico: 'http://bentehaarstad.wordpress.com/favicon.ico',
				img: 'http://bentehaarstad.wordpress.com/favicon.ico',
				media_id: '12345',
			},
			ID: 12345,
			name: 'Bente Haarstad Photography&amp;',
			railcar: {},
			URL: 'http://bentehaarstad.wordpress.com',
		},
		{
			blog_id: 38492359,
			blog_title: 'The Renegade Press',
			blog_url: 'http://chrisnicholaswrites.wordpress.com',
			description: 'Description 2',
			feed_id: 42081376,
			feed_url: 'http://chrisnicholaswrites.wordpress.com/feed/',
			icon: {
				ico: 'http://chrisnicholaswrites.wordpress.com/favicon.ico',
				img: 'http://chrisnicholaswrites.wordpress.com/favicon.ico',
				media_id: '12345',
			},
			ID: 12345,
			name: 'The Renegade Press',
			railcar: {},
			URL: 'http://chrisnicholaswrites.wordpress.com',
		},
		{
			blog_id: 30436600,
			blog_title: 'Make Something Mondays!',
			blog_url: 'http://makesomethingmondays.wordpress.com',
			description: 'Description 3',
			feed_id: 1098976,
			feed_url: 'http://makesomethingmondays.wordpress.com/feed/',
			icon: {
				ico: 'http://makesomethingmondays.wordpress.com/favicon.ico',
				img: 'http://makesomethingmondays.wordpress.com/favicon.ico',
				media_id: '12345',
			},
			ID: 12345,
			name: 'Make Something Mondays!',
			railcar: {},
			URL: 'http://makesomethingmondays.wordpress.com',
		},
	],
	meta: {
		next_page: 'next_page',
	},
};

describe( 'recommended sites', () => {
	describe( '#requestRecommendedSites', () => {
		test( 'should dispatch an http request and call through next', () => {
			const action = requestRecommendedSitesAction( { seed } );
			const result = requestRecommendedSites( action );
			expect( result ).toEqual(
				http( {
					method: 'GET',
					path: '/read/recommendations/sites',
					query: { number: 4, offset: 0, seed, posts_per_site: 0 },
					apiVersion: '1.2',
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( '#receiveRecommendedSites', () => {
		test( 'should dispatch action with sites if successful', () => {
			const action = requestRecommendedSitesAction( { seed } );
			const recommendedSites = mapResponseToRecommendedSites( response );
			const result = addRecommendedSites( action, recommendedSites );
			expect( result ).toEqual(
				receiveRecommendedSites( {
					sites: recommendedSites,
					seed,
					offset: 0,
				} )
			);
		} );
	} );

	describe( '#mapResponseToRecommendedSites', () => {
		test( 'should extract only what we care about from the api response. and decode entities', () => {
			const expected: RecommendedSite[] = [
				{
					algorithm,
					blogId: 19096129,
					description: 'Description 1',
					feedId: 185124,
					feedUrl: 'http://bentehaarstad.wordpress.com/feed/',
					icon: 'http://bentehaarstad.wordpress.com/favicon.ico',
					railcar: {},
					title: 'Bente Haarstad Photography&',
					url: 'http://bentehaarstad.wordpress.com',
				},
				{
					algorithm,
					blogId: 38492359,
					description: 'Description 2',
					feedId: 42081376,
					feedUrl: 'http://chrisnicholaswrites.wordpress.com/feed/',
					icon: 'http://chrisnicholaswrites.wordpress.com/favicon.ico',
					railcar: {},
					title: 'The Renegade Press',
					url: 'http://chrisnicholaswrites.wordpress.com',
				},
				{
					algorithm,
					blogId: 30436600,
					description: 'Description 3',
					feedId: 1098976,
					feedUrl: 'http://makesomethingmondays.wordpress.com/feed/',
					icon: 'http://makesomethingmondays.wordpress.com/favicon.ico',
					railcar: {},
					title: 'Make Something Mondays!',
					url: 'http://makesomethingmondays.wordpress.com',
				},
			];

			expect( mapResponseToRecommendedSites( response ) ).toEqual( expected );
		} );
	} );
} );
