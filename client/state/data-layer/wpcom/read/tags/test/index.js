/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import {
	requestTags as requestTagsAction,
	receiveTags as receiveTagsAction,
} from 'state/reader/tags/items/actions';
import {
	requestTags,
	receiveTagsSuccess,
	receiveTagsError,
} from '../';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const successfulFollowedTagsResponse = {
	tags: [
		{
			ID: '307',
			slug: 'chickens',
			title: 'Chickens',
			display_name: 'chickens',
			URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts',
		},
		{
			ID: '148',
			slug: 'design',
			title: 'Design',
			display_name: 'design',
			URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/design/posts',
		},
	]
};

const successfulSingleTagResponse = {
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
	describe( 'request tags', () => {
		describe( '#requestTags', () => {
			it( 'single tag: should dispatch HTTP request to tag endpoint', () => {
				const action = requestTagsAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				requestTags( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.2',
					method: 'GET',
					path: `/read/tags/${ slug }`,
					onSuccess: action,
					onFailure: action,
				} ) );
			} );

			it( 'multiple tags: should dispatch HTTP request to tags endpoint', () => {
				const action = requestTagsAction();
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
				const action = requestTagsAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				requestTags( { dispatch }, action, next );

				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#receiveTagsResponse', () => {
			it( 'single tag: should normalize + dispatch', () => {
				const action = requestTagsAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				receiveTagsSuccess( { dispatch }, action, next, successfulSingleTagResponse );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagsAction( {
						payload: fromApi( successfulSingleTagResponse ),
						error: false
					} )
				);
			} );

			it( 'multiple tags: should dispatch the tags', () => {
				const action = requestTagsAction();
				const dispatch = sinon.spy();
				const next = sinon.spy();

				receiveTagsSuccess( { dispatch }, action, next, successfulFollowedTagsResponse );

				const transformedResponse = map(
					fromApi( successfulFollowedTagsResponse ),
					tag => ( { ...tag, isFollowing: true } )
				);

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagsAction( {
						payload: transformedResponse,
						hasFollowingData: true,
						error: false,
					} )
				);
			} );
		} );

		describe( '#receiveTagsError', () => {
			it( 'should dispatch error', () => {
				const action = requestTagsAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();
				const error = 'could not find tag(s)';

				receiveTagsError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagsAction( { payload: error, error: true } )
				);
			} );
		} );
	} );
} );
