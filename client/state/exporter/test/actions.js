/**
 * External dependencies
 */
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	advancedSettingsFetch,
	advancedSettingsReceive,
	advancedSettingsFail,
	exportStatusFetch,
	startExport,
	setPostTypeFieldValue,
} from '../actions';
import {
	SAMPLE_ADVANCED_SETTINGS,
	SAMPLE_EXPORT_COMPLETE_RESPONSE,
	SAMPLE_EXPORT_FAILED_RESPONSE,
} from './data';
import {
	EXPORT_ADVANCED_SETTINGS_FETCH,
	EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	EXPORT_COMPLETE,
	EXPORT_FAILURE,
	EXPORT_POST_TYPE_FIELD_SET,
	EXPORT_START_REQUEST,
	EXPORT_STARTED,
	EXPORT_STATUS_FETCH,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	const spy = jest.fn();
	const getState = () => ( {
		exporter: {
			fetchingAdvancedSettings: {},
		},
	} );
	const getStateCustomSettings = () => ( {
		exporter: {
			fetchingAdvancedSettings: {},
			selectedPostType: 'post',
			selectedAdvancedSettings: {
				2916284: {
					post: {
						author: 95752520,
						category: 1,
					},
					page: {},
				},
			},
		},
	} );

	beforeAll( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( '/rest/v1.1/sites/100658273/exports/settings' )
			.reply( 200, SAMPLE_ADVANCED_SETTINGS )
			.post( '/rest/v1.1/sites/2916284/exports/start', {
				author: 95752520,
				category: 1,
				post_type: 'post',
			} )
			.reply( 200, true )
			.post( '/rest/v1.1/sites/2916284/exports/start', ( body ) => ! body )
			.reply( 200, true )
			.get( '/rest/v1.1/sites/100658273/exports/0' )
			.reply( 200, SAMPLE_EXPORT_COMPLETE_RESPONSE )
			.get( '/rest/v1.1/sites/2916284/exports/0' )
			.reply( 200, SAMPLE_EXPORT_FAILED_RESPONSE );
	} );

	afterAll( () => {
		nock.cleanAll();
	} );

	afterEach( () => {
		spy.mockClear();
	} );

	describe( '#advancedSettingsFetch()', () => {
		test( 'should dispatch fetch action when thunk triggered', async () => {
			await advancedSettingsFetch( 100658273 )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: EXPORT_ADVANCED_SETTINGS_FETCH,
				siteId: 100658273,
			} );
		} );

		test( 'should dispatch receive action when request completes', async () => {
			await advancedSettingsFetch( 100658273 )( spy, getState );
			expect( spy ).toHaveBeenCalledWith( {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: SAMPLE_ADVANCED_SETTINGS,
			} );
		} );

		test( 'should dispatch fail action when request fails', async () => {
			await advancedSettingsFetch( 0 )( spy, getState );
			expect( spy ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
					siteId: 0,
				} )
			);
		} );
	} );

	describe( '#advancedSettingsReceive()', () => {
		test( 'should return an action object', () => {
			const action = advancedSettingsReceive( 100658273, SAMPLE_ADVANCED_SETTINGS );

			expect( action ).toEqual( {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: SAMPLE_ADVANCED_SETTINGS,
			} );
		} );
	} );

	describe( '#advancedSettingsFail()', () => {
		test( 'should return an action object', () => {
			const error = new Error( 'An error occurred fetching advanced settings' );
			const action = advancedSettingsFail( 100658273, error );

			expect( action ).toEqual( {
				type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
				siteId: 100658273,
				error,
			} );
		} );
	} );

	describe( '#startExport()', () => {
		test( 'should dispatch start export action when thunk triggered', () => {
			startExport( 2916284 )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: EXPORT_START_REQUEST,
				siteId: 2916284,
				exportAll: true,
			} );
		} );

		test( 'should dispatch custom export action when thunk triggered', async () => {
			await startExport( 2916284, false )( spy, getStateCustomSettings );
			expect( spy ).toHaveBeenCalledWith( {
				type: EXPORT_STARTED,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch export started action when request completes', async () => {
			await startExport( 2916284 )( spy, getState );
			expect( spy ).toHaveBeenCalledTimes( 2 );
			expect( spy ).toHaveBeenCalledWith( {
				type: EXPORT_STARTED,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch export failed action when request fails', async () => {
			await startExport( 77203074 )( spy, getState );
			expect( spy ).toHaveBeenCalledTimes( 2 );
			expect( spy ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: EXPORT_FAILURE,
					siteId: 77203074,
				} )
			);
		} );
	} );

	describe( '#setPostTypeFilters()', () => {
		test( 'should return an action object', () => {
			expect( setPostTypeFieldValue( 1, 'post', 'author', 2 ) ).toEqual( {
				type: EXPORT_POST_TYPE_FIELD_SET,
				siteId: 1,
				postType: 'post',
				fieldName: 'author',
				value: 2,
			} );
		} );
	} );

	describe( '#exportStatusFetch()', () => {
		test( 'should dispatch fetch export status action when thunk triggered', async () => {
			await exportStatusFetch( 100658273 )( spy );
			expect( spy ).toHaveBeenCalledWith( {
				type: EXPORT_STATUS_FETCH,
				siteId: 100658273,
			} );
		} );

		test( 'should dispatch export complete action when an export has completed', async () => {
			await exportStatusFetch( 100658273 )( spy );
			expect( spy ).toHaveBeenCalledTimes( 2 );
			expect( spy ).toHaveBeenCalledWith( {
				type: EXPORT_COMPLETE,
				siteId: 100658273,
			} );
		} );

		test( 'should dispatch export failure action when an export has failed', async () => {
			await exportStatusFetch( 2916284 )( spy );
			expect( spy ).toHaveBeenCalledTimes( 2 );
			expect( spy ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: EXPORT_FAILURE,
					siteId: 2916284,
				} )
			);
		} );
	} );
} );
