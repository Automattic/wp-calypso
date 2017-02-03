/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveResponse, receiveError, requestTag } from '../';
import {
	receiveTag as receiveTagAction,
	requestTag as requestTagAction,
} from 'state/reader/tags/items/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

export const successfulResponse = {
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

		describe( '#receiveResponse', () => {
			it( 'should dispatch plan updates', () => {
				const action = requestTagAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();

				receiveResponse( { dispatch }, action, next, successfulResponse );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagAction( { payload: { tag: successfulResponse.tag }, error: false } )
				);
			} );
		} );

		describe( '#receiveError', () => {
			it( 'should dispatch error', () => {
				const action = requestTagAction( slug );
				const dispatch = sinon.spy();
				const next = sinon.spy();
				const error = 'could not find tag';

				receiveError( { dispatch }, action, next, error );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					receiveTagAction( { payload: error, error: true } )
				);
			} );
		} );
	} );
} );

