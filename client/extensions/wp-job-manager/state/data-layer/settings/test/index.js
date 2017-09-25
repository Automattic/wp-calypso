/**
 * External dependencies
 */
import { expect } from 'chai';
import { translate } from 'i18n-calypso';
import { initialize, startSubmit as startSave, stopSubmit as stopSave } from 'redux-form';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { announceFailure, announceSuccess, fetchExtensionError, fetchExtensionSettings, saveSettings, updateExtensionSettings } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { fetchError, fetchSettings, updateSettings } from 'wp-job-manager/state/settings/actions';

const apiResponse = {
	data: {
		job_manager_hide_filled_positions: true,
		job_manager_per_page: 25,
	}
};
const saveAction = {
	type: 'DUMMY_ACTION',
	data: {
		hideFilledPositions: true,
		perPage: 25,
	},
	form: 'my-form',
	siteId: 101010,
};
const transformedData = {
	account: {
		enableRegistration: undefined,
		generateUsername: undefined,
		isAccountRequired: undefined,
		role: undefined,
		sendPassword: undefined,
	},
	apiKey: { googleMapsApiKey: undefined },
	approval: {
		canEdit: undefined,
		isApprovalRequired: undefined,
	},
	categories: {
		categoryFilterType: undefined,
		enableCategories: undefined,
		enableDefaultCategory: undefined,
	},
	duration: { submissionDuration: undefined },
	format: { dateFormat: undefined },
	listings: {
		hideExpired: undefined,
		hideExpiredContent: undefined,
		hideFilledPositions: true,
		perPage: 25,
	},
	method: { applicationMethod: undefined },
	pages: {
		dashboardPage: undefined,
		listingsPage: undefined,
		submitFormPage: undefined,
	},
	types: {
		enableTypes: undefined,
		multiJobType: undefined
	}
};

describe( '#fetchExtensionSettings()', () => {
	it( 'should dispatch an HTTP request to the settings endpoint', () => {
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 101010,
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

		updateExtensionSettings( { dispatch }, action, apiResponse );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( updateSettings( 12345678, transformedData ) );
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
	it( 'should dispatch `startSave`', () => {
		const dispatch = sinon.spy();

		saveSettings( { dispatch }, saveAction );

		expect( dispatch ).to.have.been.calledWith( startSave( 'my-form' ) );
	} );

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
	it( 'should dispatch `stopSave`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, saveAction, apiResponse );

		expect( dispatch ).to.have.been.calledWith( stopSave( 'my-form' ) );
	} );

	it( 'should dispatch `initialize`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, saveAction, apiResponse );

		expect( dispatch ).to.have.been.calledWith( initialize( 'my-form', transformedData ) );
	} );

	it( 'should dispatch `updateSettings`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, saveAction, apiResponse );

		expect( dispatch ).to.have.been.calledWith( updateSettings( 101010, transformedData ) );
	} );

	it( 'should dispatch `successNotice`', () => {
		const dispatch = sinon.spy();

		announceSuccess( { dispatch }, saveAction, apiResponse );

		expect( dispatch ).to.have.been.calledWith( successNotice( translate(
			'Settings saved!' ),
			{ id: 'wpjm-settings-save' }
		) );
	} );
} );

describe( '#announceFailure()', () => {
	it( 'should dispatch `stopSave`', () => {
		const dispatch = sinon.spy();

		announceFailure( { dispatch }, saveAction );

		expect( dispatch ).to.have.been.calledWith( stopSave( 'my-form' ) );
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

