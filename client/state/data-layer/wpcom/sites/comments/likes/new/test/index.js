/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	COMMENTS_LIKE,
} from 'state/action-types';
import { likeComment } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

const SITE_ID = 91750058;
const POST_ID = 287;

describe( '#likeComment()', () => {
	it( 'should dispatch a http action to create a new like', () => {
		const action = {
			type: COMMENTS_LIKE,
			siteId: SITE_ID,
			postId: POST_ID,
			commentId: 1
		};
		const dispatch = spy();
		likeComment( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			apiVersion: '1.1',
			method: 'POST',
			path: `/sites/${ SITE_ID }/comments/1/likes/new`,
			onSuccess: action,
			onFailure: action,
			onProgress: action,
		} ) );
	} );
} );
