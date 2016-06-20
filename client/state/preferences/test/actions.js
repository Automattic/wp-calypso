/**
 * External dependencies
 */
import { expect } from 'chai';
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	PREFERENCES_RECEIVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_FAILURE,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_SET
} from 'state/action-types';

import { useSandbox } from 'test/helpers/use-sinon';
import { DEFAULT_PREFERENCES, USER_SETTING_KEY } from '../constants';
import { fetchPreferences, savePreference, setPreference } from '../actions';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );
	const responseShape = {
		[ USER_SETTING_KEY ]: DEFAULT_PREFERENCES
	};
	const getState = () => ( { preferences: { values: DEFAULT_PREFERENCES } } );

	describe( '#fetchPreferences()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/me/settings' )
				.reply( 200, responseShape );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			fetchPreferences()( spy );
			expect( spy ).to.have.been.calledWith( {
				type: PREFERENCES_FETCH
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return fetchPreferences()( spy ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: PREFERENCES_FETCH_SUCCESS,
					data: responseShape,
				} );
			} );
		} );
	} );

	describe( '#fetchPreferences()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/me/settings' )
				.reply( 404 );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch fail action when request fails', () => {
			return fetchPreferences()( spy ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: PREFERENCES_FETCH_FAILURE
				} );
			} );
		} );
	} );

	describe( '#setPreference()', () => {
		it( 'should return PREFERENCES_SET with correct payload', () => {
			expect( setPreference( 'preferenceKey', 'preferenceValue' ) ).to.deep.equal( {
				type: PREFERENCES_SET,
				key: 'preferenceKey',
				value: 'preferenceValue'
			} );
		} );
	} );

	describe( '#savePreference()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/me/settings/' )
				.reply( 200, responseShape );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch PREFERENCES_SET action when thunk triggered', () => {
			savePreference( 'preferenceKey', 'preferenceValue' )( spy, getState );
			expect( spy ).to.have.been.calledWithMatch( {
				type: PREFERENCES_SET,
				key: 'preferenceKey',
				value: 'preferenceValue'
			} );
		} );

		it( 'should dispatch PREFERENCES_RECEIVE action when request completes', () => {
			return savePreference( 'preferenceKey', 'preferenceValue' )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: PREFERENCES_RECEIVE,
					data: responseShape
				} );
			} );
		} );
	} );
} );
