/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';

import { handleUnfollowTagRequest } from '../';
import { requestUnfollowTag, receiveUnfollowTag } from 'state/reader/tags/items/actions';

const tag = 'chickens';

export const successfulResponse = {
	subscribed: false,
	removed_tag: '307',
	tags: [
		{
			ID: '422',
			slug: 'poetry',
			title: 'Poetry',
			display_name: 'poetry',
			URL: 'https://public-api.wordpress.com/rest/v1/read/tags/poetry/posts'
		},
		{
			ID: '69750',
			slug: 'ship',
			title: 'SHIP',
			display_name: 'ship',
			URL: 'https://public-api.wordpress.com/rest/v1/read/tags/ship/posts'
		},
	],
};

describe( 'wpcom-api', () => {
	const nextSpy = sinon.spy();

	beforeEach( () => {
		nextSpy.reset();
	} );

	describe( 'tag request', () => {
		context( 'successful requests', () => {
			useNock( nock => (
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/read/tags/chickens/mine/delete' )
					.reply( 200, successfulResponse )
			) );

			it( 'should dispatch RECEIVE action when request completes', ( done ) => {
				const requestAction = requestUnfollowTag( tag );
				const expectedAction = receiveUnfollowTag( { payload: successfulResponse, error: false } );
				const dispatch = sinon.spy( action => {
					if ( action.type === expectedAction.type ) {
						expect( dispatch ).to.have.been.calledWith( expectedAction );
						expect( nextSpy ).to.have.been.calledWith( requestAction );
						done();
					}
				} );

				handleUnfollowTagRequest( { dispatch }, requestAction, nextSpy, );
			} );
		} );

		describe( 'failure request', () => {
			useNock( nock => (
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/read/tags/chickens/mine/delete' )
					.reply( 500, new Error() )
			) );

			it( 'should dispatch RECEIVE action with error when request errors', ( done ) => {
				const requestAction = requestUnfollowTag( tag );
				const dispatch = sinon.spy( action => {
					const expectedAction = receiveUnfollowTag( { payload: sinon.match.any, error: true } );
					if ( action.type === expectedAction.type ) {
						expect( dispatch ).to.have.been.calledWith( expectedAction );
						expect( nextSpy ).to.have.been.calledWith( requestAction );
						done();
					}
				} );

				handleUnfollowTagRequest( { dispatch }, requestAction, nextSpy, );
			} );
		} );
	} );
} );

