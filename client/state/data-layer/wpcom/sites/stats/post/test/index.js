/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	POST_STATS_REQUEST_START,
	POST_STATS_REQUEST_SUCCESS,
	POST_STATS_REQUEST_FAILURE
} from 'state/action-types';
import { receivePostStat } from 'state/stats/posts/actions';
import { requestPostStat } from '../';

describe( 'wpcom-api', () => {
	let dispatch;
	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	describe( 'requestPostStat()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/stats/post/2454?fields=views' )
				.reply( 200, { views: 2 } )
				.get( '/rest/v1.1/sites/2916285/stats/post/2455?fields=views' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestPostStat( { dispatch }, { stat: 'views', siteId: 2916284, postId: 2454 } );

			expect( dispatch ).to.have.been.calledWith( {
				type: POST_STATS_REQUEST_START,
				stat: 'views',
				siteId: 2916284,
				postId: 2454
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestPostStat( { dispatch }, { stat: 'views', siteId: 2916284, postId: 2454 } ).then( () => {
				expect( dispatch ).to.have.been.calledWith(
					receivePostStat( 'views', 2916284, 2454, 2 )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestPostStat( { dispatch }, { stat: 'views', siteId: 2916284, postId: 2454 } ).then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: POST_STATS_REQUEST_SUCCESS,
					stat: 'views',
					siteId: 2916284,
					postId: 2454
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestPostStat( { dispatch }, { stat: 'views', siteId: 2916285, postId: 2455 } ).then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: POST_STATS_REQUEST_FAILURE,
					stat: 'views',
					siteId: 2916285,
					postId: 2455,
					error: sinon.match( { message: 'User cannot access this private blog.' } )
				} );
			} );
		} );
	} );
} );
