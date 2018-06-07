/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { fetchConnectionStatus } from '..';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( '#fetchConnectionStatus', () => {
	test( 'should dispatch HTTP request to Jetpack test connection endpoint', () => {
		const dispatch = sinon.spy();
		const action = {
			siteId: 12345,
		};

		fetchConnectionStatus( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					path: '/jetpack-blogs/12345/test-connection',
					method: 'GET',
				},
				action
			)
		);
	} );
} );
