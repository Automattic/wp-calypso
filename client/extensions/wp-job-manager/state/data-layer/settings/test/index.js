/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { fetch, displayAndEnable, enable } from '../';
import { displaySettings, enableSettings, fetchSettings } from 'wp-job-manager/state/settings/actions';

const successfulResponse = {
	data: {
		job_manager_per_page: 25,
		job_manager_hide_filled_positions: true,
	}
};

describe( '#fetch()', () => {
	it( 'should dispatch an HTTP request to the settings endpoint', () => {
		const action = {
			type: 'DUMMY_ACTION',
			siteId: '101010',
		};
		const dispatch = sinon.spy();

		fetch( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			method: 'GET',
			path: '/jetpack-blogs/101010/rest-api/',
			query: {
				path: '/wpjm/v1/settings',
			}
		}, action ) );
	} );
} );

describe( '#displayAndEnable', () => {
	it( 'should dispatch `displaySettings` and `enableSettings`', () => {
		const action = fetchSettings( 12345678 );
		const dispatch = sinon.spy();

		displayAndEnable( { dispatch }, action, null, successfulResponse );

		expect( dispatch ).to.have.callCount( 2 );
		expect( dispatch ).to.have.been.calledWith( displaySettings( 12345678, successfulResponse.data ) );
		expect( dispatch ).to.have.been.calledWith( enableSettings( 12345678 ) );
	} );
} );

describe( '#enable', () => {
	it( 'should dispatch `enableSettings`', () => {
		const action = fetchSettings( 12345678 );
		const dispatch = sinon.spy();

		enable( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( enableSettings( 12345678 ) );
	} );
} );
