/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';

import { handleTagsRequest } from '../';
import { receiveTags, requestTags } from 'state/reader/tags/items/actions';

export const successfulResponse = {
	tags: [
		{
			ID: '307',
			slug: 'chickens',
			title: 'Chickens',
			display_name: 'chickens',
			URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts'
		},
		{
			ID: '148',
			slug: 'design',
			title: 'Design',
			display_name: 'design',
			URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/design/posts'
		},
	]
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
					.get( '/rest/v1.2/read/tags/chickens' )
					.reply( 200, successfulResponse )
			) );

			it( 'should dispatch RECEIVE action when request completes', ( done ) => {
				const requestAction = requestTags();
				const expectedAction = receiveTags( { payload: successfulResponse, error: false } );
				const dispatch = sinon.spy( action => {
					if ( action.type === expectedAction.type ) {
						expect( dispatch ).to.have.been.calledWith( expectedAction );
						expect( nextSpy ).to.have.been.calledWith( requestAction );
						done();
					}
				} );

				handleTagsRequest( { dispatch }, requestAction, nextSpy, );
			} );
		} );

		describe( 'failure request', () => {
			useNock( nock => (
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.2/read/tags/chickens' )
					.reply( 500, new Error() )
			) );

			it( 'should dispatch RECEIVE action with error when request errors', ( done ) => {
				const requestAction = requestTags();
				const dispatch = sinon.spy( action => {
					const expectedAction = receiveTags( { payload: sinon.match.any, error: true } );
					if ( action.type === expectedAction.type ) {
						expect( dispatch ).to.have.been.calledWith( expectedAction );
						expect( nextSpy ).to.have.been.calledWith( requestAction );
						done();
					}
				} );

				handleTagsRequest( { dispatch }, requestAction, nextSpy, );
			} );
		} );
	} );
} );

