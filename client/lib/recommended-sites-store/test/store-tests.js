import { expect } from 'chai';
import Dispatcher from 'dispatcher';

import { ACTION_RECEIVE_SITE_RECOMMENDATIONS, ACTION_RECEIVE_SITE_RECOMMENDATIONS_ERROR } from '../constants';
import store from '../store';


describe( 'Recommended Sites Store', function() {
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
		expect( store.get()[0] ).to.eql( foundBlog );
	} );
} );
