/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Chai, { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	EXPORT_ADVANCED_SETTINGS_FETCH,
	EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	EXPORT_FAILURE,
	EXPORT_START_REQUEST,
	EXPORT_STARTED,
} from 'state/action-types';
import {
	advancedSettingsFetch,
	advancedSettingsReceive,
	advancedSettingsFail,
	startExport,
} from '../actions';
import { SAMPLE_ADVANCED_SETTINGS } from './sample-data';

/**
 * Test setup
 */
Chai.use( sinonChai );

describe( 'actions', () => {
	const spy = sinon.spy();
	const getState = () => ( {
		siteSettings: { exporter: {
			fetchingAdvancedSettings: {}
		} }
	} );

	before( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( '/rest/v1.1/sites/100658273/exports/settings' )
			.reply( 200, SAMPLE_ADVANCED_SETTINGS )
			.post( '/rest/v1.1/sites/2916284/exports/start' )
			.reply( 200, true );
	} );

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.restore();
	} );

	describe( '#advancedSettingsFetch()', () => {
		it( 'should dispatch fetch action when thunk triggered', () => {
			advancedSettingsFetch( 100658273 )( spy, getState );

			expect( spy ).to.have.been.calledWith( {
				type: EXPORT_ADVANCED_SETTINGS_FETCH,
				siteId: 100658273
			} );
		} );

		it( 'should dispatch receive action when request completes', ( done ) => {
			advancedSettingsFetch( 100658273 )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
					siteId: 100658273,
					advancedSettings: SAMPLE_ADVANCED_SETTINGS
				} );

				done();
			} ).catch( done );
		} );

		it( 'should dispatch fail action when request fails', ( done ) => {
			advancedSettingsFetch( 0 )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
					siteId: 0
				} );

				done();
			} ).catch( done );
		} );
	} );

	describe( '#advancedSettingsReceive()', () => {
		it( 'should return an action object', () => {
			const action = advancedSettingsReceive( 100658273, SAMPLE_ADVANCED_SETTINGS );

			expect( action ).to.deep.equal( {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: SAMPLE_ADVANCED_SETTINGS
			} );
		} );
	} );

	describe( '#advancedSettingsFail()', () => {
		it( 'should return an action object', () => {
			const error = new Error( 'An error occurred fetching advanced settings' );
			const action = advancedSettingsFail( 100658273, error );

			expect( action ).to.deep.equal( {
				type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
				siteId: 100658273,
				error
			} );
		} );
	} );

	describe( '#startExport()', () => {
		it( 'should dispatch start export action when thunk triggered', () => {
			startExport( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: EXPORT_START_REQUEST,
				siteId: 2916284
			} );
		} );

		it( 'should dispatch export started action when request completes', ( done ) => {
			startExport( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledTwice;
				expect( spy ).to.have.been.calledWith( {
					type: EXPORT_STARTED,
					siteId: 2916284
				} );

				done();
			} ).catch( done );
		} );

		it( 'should dispatch export failed action when request fails', ( done ) => {
			startExport( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledTwice;
				expect( spy ).to.have.been.calledWithMatch( {
					type: EXPORT_FAILURE,
					siteId: 77203074
				} );

				done();
			} ).catch( done );
		} );
	} );
} );
