/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	requestExtensionPages,
	requestExtensionPagesError,
	updateExtensionPages,
} from '../';
import {
	requestPages,
	requestPagesError,
	updatePages,
} from 'wp-job-manager/state/pages/actions';

const apiResponse = {
	data: [ {
		id: 1,
		title: {
			rendered: 'My account',
		},
	} ]
};

describe( '#requestExtensionPages()', () => {
	it( 'should dispatch an HTTP request to the pages endpoint', () => {
		const action = {
			type: 'DUMMY_ACTION',
			siteId: '101010',
		};
		const dispatch = sinon.spy();

		requestExtensionPages( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			method: 'GET',
			path: '/jetpack-blogs/101010/rest-api/',
			query: {
				path: '/wp/v2/pages',
			}
		}, action ) );
	} );
} );

describe( '#updateExtensionPages', () => {
	it( 'should dispatch `updatePages`', () => {
		const action = requestPages( 12345678 );
		const dispatch = sinon.spy();

		updateExtensionPages( { dispatch }, action, null, apiResponse );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( updatePages( 12345678, apiResponse.data ) );
	} );
} );

describe( '#requestExtensionPagesError', () => {
	it( 'should dispatch `requestPagesError`', () => {
		const action = requestPages( 12345678 );
		const dispatch = sinon.spy();

		requestExtensionPagesError( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( requestPagesError( 12345678 ) );
	} );
} );
