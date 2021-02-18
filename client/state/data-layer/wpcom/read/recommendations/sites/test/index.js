/**
 * External dependencies
 */
import { requestRecommendedSites, addRecommendedSites, fromApi } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	requestRecommendedSites as requestRecommendedSitesAction,
	receiveRecommendedSites,
} from 'calypso/state/reader/recommended-sites/actions';

const algorithm = 'chicken-recs/es1';
const seed = 42;
const response = {
	algorithm,
	sites: [
		{
			blog_id: 19096129,
			feed_id: 185124,
			blog_title: 'Bente Haarstad Photography&amp;',
			blog_url: 'http://bentehaarstad.wordpress.com',
			railcar: {},
		},
		{
			blog_id: 38492359,
			feed_id: 42081376,
			blog_title: 'The Renegade Press',
			blog_url: 'http://chrisnicholaswrites.wordpress.com',
			railcar: {},
		},
		{
			blog_id: 30436600,
			feed_id: 1098976,
			blog_title: 'Make Something Mondays!',
			blog_url: 'http://makesomethingmondays.wordpress.com',
			railcar: {},
		},
	],
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
			const result = addRecommendedSites( action, response );
			expect( result ).toEqual(
				receiveRecommendedSites( {
					sites: response,
					seed,
					offset: 0,
				} )
			);
		} );
	} );

	describe( '#fromApi', () => {
		test( 'should extract only what we care about from the api response. and decode entities', () => {
			const expected = [
				{
					algorithm,
					railcar: {},
					blogId: 19096129,
					feedId: 185124,
					title: 'Bente Haarstad Photography&',
					url: 'http://bentehaarstad.wordpress.com',
				},
				{
					algorithm,
					railcar: {},
					blogId: 38492359,
					feedId: 42081376,
					title: 'The Renegade Press',
					url: 'http://chrisnicholaswrites.wordpress.com',
				},
				{
					algorithm,
					railcar: {},
					blogId: 30436600,
					feedId: 1098976,
					title: 'Make Something Mondays!',
					url: 'http://makesomethingmondays.wordpress.com',
				},
			];

			expect( fromApi( response ) ).toEqual( expected );
		} );
	} );
} );
