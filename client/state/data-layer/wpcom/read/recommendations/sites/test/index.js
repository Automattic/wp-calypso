/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal Dependencies
 */
import { requestRecommendedSites, receiveRecommendedSitesResponse, fromApi } from '../';
import {
	requestRecommendedSites as requestRecommendedSitesAction,
	receiveRecommendedSites,
} from 'state/reader/recommended-sites/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

const seed = 42;
const response = {
	sites: [
		{
			blog_id: 19096129,
			feed_id: 185124,
			blog_title: 'Bente Haarstad Photography&amp;',
			blog_url: 'http:\/\/bentehaarstad.wordpress.com',
		},
		{
			blog_id: 38492359,
			feed_id: 42081376,
			blog_title: 'The Renegade Press',
			blog_url: 'http:\/\/chrisnicholaswrites.wordpress.com',
		},
		{
			blog_id: 30436600,
			feed_id: 1098976,
			blog_title: 'Make Something Mondays!',
			blog_url: 'http:\/\/makesomethingmondays.wordpress.com',
		},
	],
};

describe( 'recommended sites', () => {
	describe( '#requestRecommendedSites', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const next = spy();
			const action = requestRecommendedSitesAction( { seed } );
			requestRecommendedSites( { dispatch }, action, next );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'GET',
					path: '/read/recommendations/sites',
					query: { number: 4, offset: 0, seed, posts_per_site: 0 },
					apiVersion: '1.2',
					onSuccess: action,
					onFailure: action,
				} )
			);

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( '#receiveRecommendedSites', () => {
		it( 'should dispatch action with sites if successful', () => {
			const dispatch = spy();
			const action = requestRecommendedSitesAction( { seed } );
			const next = spy();

			receiveRecommendedSitesResponse( { dispatch }, action, next, response );
			expect( next ).to.not.have.been.called;
			expect( dispatch ).calledWith( receiveRecommendedSites( {
				sites: fromApi( response ),
				seed
			} ) );
		} );
	} );

	describe( '#fromApi', () => {
		it( 'should convert to empty sites if given bad input', () => {
			expect( fromApi( null ) ).eql( [] );
			expect( fromApi( undefined ) ).eql( [] );
			expect( fromApi( new Error( 'this is an error' ) ) ).eql( [] );
		} );

		it( 'should extract only what we care about from the api response. and decode entities', () => {
			const expected = [
				{
					blogId: 19096129,
					feedId: 185124,
					title: 'Bente Haarstad Photography&',
					url: 'http:\/\/bentehaarstad.wordpress.com',
				},
				{
					blogId: 38492359,
					feedId: 42081376,
					title: 'The Renegade Press',
					url: 'http:\/\/chrisnicholaswrites.wordpress.com',
				},
				{
					blogId: 30436600,
					feedId: 1098976,
					title: 'Make Something Mondays!',
					url: 'http:\/\/makesomethingmondays.wordpress.com',
				}
			];

			expect( fromApi( response ) ).eql( expected );
		} );
	} );
} );
