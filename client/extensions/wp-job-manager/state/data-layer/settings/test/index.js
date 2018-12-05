/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { initialize, startSubmit, stopSubmit } from 'redux-form';

/**
 * Internal dependencies
 */
import {
	announceFailure,
	announceSuccess,
	fetchExtensionError,
	fetchExtensionSettings,
	saveSettings,
	updateExtensionSettings,
} from '../';
import { fromApi } from '../utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { fetchError, fetchSettings, updateSettings } from 'wp-job-manager/state/settings/actions';

const apiResponse = {
	data: {
		job_manager_hide_filled_positions: true,
		job_manager_per_page: 25,
	},
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
		multiJobType: undefined,
	},
};

describe( '#fromApi', () => {
	test( 'correctly transforms response data', () => {
		expect( fromApi( apiResponse ) ).toEqual( transformedData );
	} );
} );

describe( '#fetchExtensionSettings()', () => {
	test( 'should dispatch an HTTP request to the settings endpoint', () => {
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 101010,
		};

		expect( fetchExtensionSettings( action ) ).toEqual(
			http(
				{
					method: 'GET',
					path: '/jetpack-blogs/101010/rest-api/',
					query: {
						path: '/wpjm/v1/settings',
					},
				},
				action
			)
		);
	} );
} );

describe( '#updateExtensionSettings', () => {
	test( 'should dispatch `updateSettings`', () => {
		const action = fetchSettings( 12345678 );

		expect( updateExtensionSettings( action, transformedData ) ).toEqual(
			updateSettings( 12345678, transformedData )
		);
	} );
} );

describe( '#fetchExtensionError', () => {
	test( 'should dispatch `fetchError`', () => {
		const action = fetchSettings( 12345678 );

		expect( fetchExtensionError( action ) ).toEqual( fetchError( 12345678 ) );
	} );
} );

describe( '#saveSettings()', () => {
	test( 'should dispatch `startSubmit`', () => {
		expect( saveSettings( saveAction ) ).toContainEqual( startSubmit( 'my-form' ) );
	} );

	test( 'should dispatch an HTTP POST request to the settings endpoint', () => {
		expect( saveSettings( saveAction ) ).toContainEqual(
			http(
				{
					method: 'POST',
					path: '/jetpack-blogs/101010/rest-api/',
					query: {
						body: JSON.stringify( apiResponse.data ),
						json: true,
						path: '/wpjm/v1/settings',
					},
				},
				saveAction
			)
		);
	} );

	test( 'should dispatch `removeNotice`', () => {
		expect( saveSettings( saveAction ) ).toContainEqual( removeNotice( 'wpjm-settings-save' ) );
	} );
} );

describe( '#announceSuccess()', () => {
	test( 'should dispatch `stopSubmit`', () => {
		expect( announceSuccess( saveAction, transformedData ) ).toContainEqual(
			stopSubmit( 'my-form' )
		);
	} );

	test( 'should dispatch `initialize`', () => {
		expect( announceSuccess( saveAction, transformedData ) ).toContainEqual(
			initialize( 'my-form', transformedData )
		);
	} );

	test( 'should dispatch `updateSettings`', () => {
		expect( announceSuccess( saveAction, transformedData ) ).toContainEqual(
			updateSettings( 101010, transformedData )
		);
	} );

	test( 'should dispatch `successNotice`', () => {
		expect( announceSuccess( saveAction, transformedData ) ).toContainEqual(
			successNotice( translate( 'Settings saved!' ), { id: 'wpjm-settings-save' } )
		);
	} );
} );

describe( '#announceFailure()', () => {
	test( 'should dispatch `stopSubmit`', () => {
		expect( announceFailure( saveAction ) ).toContainEqual( stopSubmit( 'my-form' ) );
	} );

	test( 'should dispatch `errorNotice`', () => {
		expect( announceFailure( saveAction ) ).toContainEqual(
			errorNotice( translate( 'There was a problem saving your changes. Please try again.' ), {
				id: 'wpjm-settings-save',
			} )
		);
	} );
} );
