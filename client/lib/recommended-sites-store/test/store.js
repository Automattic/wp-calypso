import { expect } from 'chai';
import Dispatcher from 'dispatcher';

import { ACTION_RECEIVE_SITE_RECOMMENDATIONS } from '../constants';
import store from '../store';

describe( 'store', function() {
	beforeEach( function() {
		store._reset();
	} );

	it( 'picks up recs from a successful response', function() {
		const foundBlog = {
			blog_id: 63142948,
			follow_reco_id: 'freshly_pressed',
			reason: 'Featured on Freshly Pressed'
		};

		Dispatcher.handleServerAction( {
			type: ACTION_RECEIVE_SITE_RECOMMENDATIONS,
			data: {
				blogs: [
					foundBlog
				]
			}
		} );

		expect( store.get() ).to.have.length( 1 );
		expect( store.get()[ 0 ] ).to.eql( foundBlog );
		expect( store.isLastPage() ).to.eql( false );
	} );

	it( 'sets last page flag if no blogs are returned', function() {
		Dispatcher.handleServerAction( {
			type: ACTION_RECEIVE_SITE_RECOMMENDATIONS,
			data: {
				blogs: []
			}
		} );

		expect( store.isLastPage() ).to.eql( true );
	} );

	it( 'sets last page flag if maximum recommendations are reached', function() {
		const tooManyBlogs = [];

		for ( let i = 0; i < store.maxRecommendations(); i ++ ) {
			tooManyBlogs.push( {
				blog_id: i,
				follow_reco_id: 'freshly_pressed',
				reason: 'Featured on Freshly Pressed'
			} );
		}

		Dispatcher.handleServerAction( {
			type: ACTION_RECEIVE_SITE_RECOMMENDATIONS,
			data: {
				blogs: tooManyBlogs
			}
		} );

		expect( store.isLastPage() ).to.eql( true );
	} );
} );
