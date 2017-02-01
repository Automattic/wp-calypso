/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';

import { handleTagRequest } from '../';
import { receiveTag, requestTag } from 'state/reader/tags/items/actions';

export const successfulResponse = {
	tag: {
		ID: '307',
		slug: 'chickens',
		title: 'Chickens',
		display_name: 'chickens',
		URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts'
	},
};
const tag = 'chickens';

describe( 'wpcom-api', () => {
	const nextSpy = sinon.spy();

	beforeEach( () => {
		nextSpy.reset();
	} );

	describe( 'tag request', () => {
		context( 'successful requests', () => {
			useNock( nock => (
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.2/read/tags/chickens' )
					.reply( 200, successfulResponse )
			) );

			it( 'should dispatch RECEIVE action when request completes', ( done ) => {
				const requestAction = requestTag( tag );
				const expectedAction = receiveTag( { payload: successfulResponse, error: false } );
				const dispatch = sinon.spy( action => {
					if ( action.type === expectedAction.type ) {
						expect( dispatch ).to.have.been.calledWith( expectedAction );
						expect( nextSpy ).to.have.been.calledWith( requestAction );
						done();
					}
				} );

				handleTagRequest( { dispatch }, requestAction, nextSpy, );
			} );
		} );

		describe( 'failure request', () => {
			useNock( nock => (
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.2/read/tags/chickens' )
					.reply( 500, new Error() )
			) );

			it( 'should dispatch RECEIVE action with error when request errors', ( done ) => {
				const requestAction = requestTag( tag );
				const dispatch = sinon.spy( action => {
					const expectedAction = receiveTag( { payload: sinon.match.any, error: true } );
					if ( action.type === expectedAction.type ) {
						expect( dispatch ).to.have.been.calledWith( expectedAction );
						expect( nextSpy ).to.have.been.calledWith( requestAction );
						done();
					}
				} );

				handleTagRequest( { dispatch }, requestAction, nextSpy, );
			} );
		} );
	} );
} );
