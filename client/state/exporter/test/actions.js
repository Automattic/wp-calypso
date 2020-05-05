/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

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
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();
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

	useNock( ( nock ) => {
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

	beforeEach( () => {
		spy.resetHistory();
	} );

	describe( '#advancedSettingsFetch()', () => {
		test( 'should dispatch fetch action when thunk triggered', () => {
			advancedSettingsFetch( 100658273 )( spy, getState );

			expect( spy ).to.have.been.calledWith( {
				type: EXPORT_ADVANCED_SETTINGS_FETCH,
				siteId: 100658273,
			} );
		} );

		test( 'should dispatch receive action when request completes', ( done ) => {
			advancedSettingsFetch( 100658273 )( spy, getState )
				.then( () => {
					expect( spy ).to.have.been.calledWithMatch( {
						type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
						siteId: 100658273,
						advancedSettings: SAMPLE_ADVANCED_SETTINGS,
					} );

					done();
				} )
				.catch( done );
		} );

		test( 'should dispatch fail action when request fails', ( done ) => {
			advancedSettingsFetch( 0 )( spy, getState )
				.then( () => {
					expect( spy ).to.have.been.calledWithMatch( {
						type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
						siteId: 0,
					} );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( '#advancedSettingsReceive()', () => {
		test( 'should return an action object', () => {
			const action = advancedSettingsReceive( 100658273, SAMPLE_ADVANCED_SETTINGS );

			expect( action ).to.deep.equal( {
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

			expect( action ).to.deep.equal( {
				type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
				siteId: 100658273,
				error,
			} );
		} );
	} );

	describe( '#startExport()', () => {
		test( 'should dispatch start export action when thunk triggered', () => {
			startExport( 2916284 )( spy, getState );

			expect( spy ).to.have.been.calledWith( {
				type: EXPORT_START_REQUEST,
				siteId: 2916284,
				exportAll: true,
			} );
		} );

		test( 'should dispatch custom export action when thunk triggered', ( done ) => {
			startExport( 2916284, false )( spy, getStateCustomSettings )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: EXPORT_STARTED,
						siteId: 2916284,
					} );

					done();
				} )
				.catch( done );
		} );

		test( 'should dispatch export started action when request completes', ( done ) => {
			startExport( 2916284 )( spy, getState )
				.then( () => {
					expect( spy ).to.have.been.calledTwice;
					expect( spy ).to.have.been.calledWith( {
						type: EXPORT_STARTED,
						siteId: 2916284,
					} );

					done();
				} )
				.catch( done );
		} );

		test( 'should dispatch export failed action when request fails', ( done ) => {
			startExport( 77203074 )( spy, getState )
				.then( () => {
					expect( spy ).to.have.been.calledTwice;
					expect( spy ).to.have.been.calledWithMatch( {
						type: EXPORT_FAILURE,
						siteId: 77203074,
					} );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( '#setPostTypeFilters()', () => {
		test( 'should return an action object', () => {
			expect( setPostTypeFieldValue( 1, 'post', 'author', 2 ) ).to.deep.equal( {
				type: EXPORT_POST_TYPE_FIELD_SET,
				siteId: 1,
				postType: 'post',
				fieldName: 'author',
				value: 2,
			} );
		} );
	} );

	describe( '#exportStatusFetch()', () => {
		test( 'should dispatch fetch export status action when thunk triggered', () => {
			return exportStatusFetch( 100658273 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: EXPORT_STATUS_FETCH,
					siteId: 100658273,
				} );
			} );
		} );

		test( 'should dispatch export complete action when an export has completed', () => {
			return exportStatusFetch( 100658273 )( spy ).then( () => {
				expect( spy ).to.have.been.calledTwice;
				expect( spy ).to.have.been.calledWithMatch( {
					type: EXPORT_COMPLETE,
					siteId: 100658273,
				} );
			} );
		} );

		test( 'should dispatch export failure action when an export has failed', () => {
			return exportStatusFetch( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledTwice;
				expect( spy ).to.have.been.calledWithMatch( {
					type: EXPORT_FAILURE,
					siteId: 2916284,
				} );
			} );
		} );
	} );
} );
