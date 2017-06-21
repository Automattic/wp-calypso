/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { fetchExtensionError, fetchExtensionSettings, updateExtensionSettings } from '../';
import { fetchError, fetchSettings, updateSettings } from 'wp-job-manager/state/settings/actions';

const successfulResponse = {
	data: {
		job_manager_per_page: 25,
		job_manager_hide_filled_positions: true,
	}
};

describe( '#fetchExtensionSettings()', () => {
	it( 'should dispatch an HTTP request to the settings endpoint', () => {
		const action = {
			type: 'DUMMY_ACTION',
			siteId: '101010',
		};
		const dispatch = sinon.spy();

		fetchExtensionSettings( { dispatch }, action );

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

describe( '#updateExtensionSettings', () => {
	it( 'should dispatch `updateSettings`', () => {
		const action = fetchSettings( 12345678 );
		const dispatch = sinon.spy();

		updateExtensionSettings( { dispatch }, action, null, successfulResponse );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( updateSettings( 12345678, successfulResponse.data ) );
	} );
} );

describe( '#fetchExtensionError', () => {
	it( 'should dispatch `fetchError`', () => {
		const action = fetchSettings( 12345678 );
		const dispatch = sinon.spy();

		fetchExtensionError( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( fetchError( 12345678 ) );
	} );
} );
