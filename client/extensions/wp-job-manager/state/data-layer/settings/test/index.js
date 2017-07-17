/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import {
	announceFailure,
	announceSuccess,
	fetchExtensionError,
	fetchExtensionSettings,
	saveSettings,
	updateExtensionSettings,
} from '../';
import {
	fetchError,
	fetchSettings,
	saveError,
	saveSuccess,
	updateSettings,
} from 'wp-job-manager/state/settings/actions';

const apiResponse = {
	data: {
		job_manager_hide_filled_positions: true,
		job_manager_per_page: 25,
	}
};
const saveAction = {
	type: 'DUMMY_ACTION',
	siteId: '101010',
	data: {
		hideFilledPositions: true,
		perPage: 25,
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

		updateExtensionSettings( { dispatch }, action, null, apiResponse );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( updateSettings( 12345678, {
			account: {
				enableRegistration: undefined,
				generateUsername: undefined,
				isAccountRequired: undefined,
				role: undefined,
			},
			apiKey: { googleMapsApiKey: undefined },
			approval: {
				canEdit: undefined,
				isApprovalRequired: undefined,
			},
			categories: {
				enableCategories: undefined,
				enableDefaultCategory: undefined,
				categoryFilterType: undefined
			},
			duration: { submissionDuration: undefined },
			format: { dateFormat: undefined },
			listings: {
				perPage: 25,
				hideFilledPositions: true,
				hideExpired: undefined,
				hideExpiredContent: undefined
			},
			method: { applicationMethod: undefined },
			types: {
				enableTypes: undefined,
				multiJobType: undefined
			},
		} ) );
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

describe( '#saveSettings()', () => {
	it( 'should dispatch an HTTP POST request to the settings endpoint', () => {
		const dispatch = sinon.spy();

		saveSettings( { dispatch }, saveAction );

		expect( dispatch ).to.have.been.calledWith( http( {
			method: 'POST',
			path: '/jetpack-blogs/101010/rest-api/',
			query: {
				body: JSON.stringify( apiResponse.data ),
				json: true,
				path: '/wpjm/v1/settings',
			}
		}, saveAction ) );
	} );

	it( 'should dispatch `removeNotice`', () => {
		const dispatch = sinon.spy();

		saveSettings( { dispatch }, saveAction );

		expect( dispatch ).to.have.been.calledWith( removeNotice( 'wpjm-settings-save' ) );
	} );
} );

describe( '#announceSuccess()', () => {
	it( 'should dispatch `saveSuccess`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, saveAction );

		expect( dispatch ).to.have.been.calledWith( saveSuccess( '101010' ) );
	} );

	it( 'should dispatch `successNotice`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, saveAction );

		expect( dispatch ).to.have.been.calledWith( successNotice( translate(
			'Settings saved!' ),
			{ id: 'wpjm-settings-save' }
		) );
	} );
} );

describe( '#announceFailure()', () => {
	it( 'should dispatch `saveError`', () => {
		const dispatch = sinon.spy();

		announceFailure( { dispatch }, saveAction );

		expect( dispatch ).to.have.been.calledWith( saveError( '101010' ) );
	} );

	it( 'should dispatch `errorNotice`', () => {
		const dispatch = sinon.spy();

		announceFailure( { dispatch }, saveAction );

		expect( dispatch ).to.have.been.calledWith( errorNotice(
			translate( 'There was a problem saving your changes. Please try again.' ),
			{ id: 'wpjm-settings-save' }
		) );
	} );
} );

