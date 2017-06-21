/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	COMMENTS_UNLIKE,
} from 'state/action-types';
import { unlikeComment } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

const SITE_ID = 91750058;
const POST_ID = 287;

describe( '#unlikeComment()', () => {
	it( 'should dispatch a http action to remove a comment like', () => {
		const action = {
			type: COMMENTS_UNLIKE,
			siteId: SITE_ID,
			postId: POST_ID,
			commentId: 1
		};
		const dispatch = spy();
		unlikeComment( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			apiVersion: '1.1',
			method: 'POST',
			path: `/sites/${ SITE_ID }/comments/1/likes/mine/delete`,
			onSuccess: action,
			onFailure: action,
			onProgress: action,
		} ) );
	} );
} );
