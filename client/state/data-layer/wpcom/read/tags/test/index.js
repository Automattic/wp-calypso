/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	requestTags as requestTagsAction,
	receiveTags as receiveTagsAction,
	requestTag as requestTagAction,
	receiveTag as receiveTagAction,
} from 'state/reader/tags/items/actions';
import {
	requestTags,
	receiveTagsSuccess,
	receiveTagError,
	requestTag,
	receiveTagSuccess,
	receiveTagsError,
} from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

export const successfulTagsResponse = {
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

export const successfulTagResponse = {
	tag: {
		ID: '307',
		slug: 'chickens',
		title: 'Chickens',
		display_name: 'chickens',
		URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts'
	},
};
const slug = 'chickens';

describe( 'wpcom-api', () => {
	describe( 'tag request', () => {
		describe( '#requestTag', () => {
			it( 'should dispatch HTTP request to tag endpoint', () => {
				const action = requestTagAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				requestTag( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.2',
					method: 'GET',
					path: `/read/tags/${ slug }`,
					onSuccess: action,
					onFailure: action,
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = requestTagAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				requestTag( { dispatch }, action, next );

				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#receiveTagResponse', () => {
			it( 'should dispatch the tag', () => {
				const action = requestTagAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				receiveTagSuccess( { dispatch }, action, next, successfulTagResponse );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagAction( { payload: successfulTagResponse, error: false } )
				);
			} );
		} );

		describe( '#receiveTagError', () => {
			it( 'should dispatch error', () => {
				const action = requestTagAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();
				const error = 'could not find tag';

				receiveTagError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagAction( { payload: error, error: true } )
				);
			} );
		} );
	} );

	describe( 'tags request', () => {
		describe( '#requestTags', () => {
			it( 'should dispatch HTTP request to tags endpoint', () => {
				const action = requestTagsAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				requestTags( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.2',
					method: 'GET',
					path: '/read/tags',
					onSuccess: action,
					onFailure: action,
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = requestTagAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				requestTags( { dispatch }, action, next );

				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#receiveTagsResponse', () => {
			it( 'should dispatch the tags', () => {
				const action = requestTagAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				receiveTagsSuccess( { dispatch }, action, next, successfulTagsResponse );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagsAction( { payload: successfulTagsResponse, error: false } )
				);
			} );
		} );

		describe( '#receiveTagsError', () => {
			it( 'should dispatch error', () => {
				const action = requestTagAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();
				const error = 'could not find tag';

				receiveTagsError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagsAction( { payload: error, error: true } )
				);
			} );
		} );
	} );
} );

