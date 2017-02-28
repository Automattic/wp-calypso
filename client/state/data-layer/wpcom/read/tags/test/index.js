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
} from 'state/reader/tags/items/actions';
import {
	requestTags,
	receiveTagsSuccess,
	receiveTagsError,
	fromApi,
} from '../';
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

const normalizedFollowedTagsResponse = {
	tags: [
		{
			ID: '307',
			slug: 'chickens',
			title: 'Chickens',
			display_name: 'chickens',
			URL: '/tag/chickens',
			is_following: true,
		},
		{
			ID: '148',
			slug: 'design',
			title: 'Design',
			display_name: 'design',
			URL: '/tag/design',
			is_following: true,
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

const normalizedSuccessfulSingleTagResponse = {
	tags: [ {
		ID: '307',
		slug: 'chickens',
		title: 'Chickens',
		display_name: 'chickens',
		URL: '/tag/chickens'
	} ]
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

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagsAction( {
						payload: fromApi( successfulFollowedTagsResponse ),
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

		describe( '#fromApi', () => {
			it( 'should properly normalize response from following tags', () => {
				const transformedResponse = fromApi( successfulFollowedTagsResponse );
				expect( transformedResponse ).to.eql( normalizedFollowedTagsResponse );
			} );

			it( 'should properly normalize a single tag', () => {
				const transformedResponse = fromApi( successfulSingleTagResponse );
				expect( transformedResponse ).to.eql( normalizedSuccessfulSingleTagResponse );
			} );
		} );
	} );
} );
