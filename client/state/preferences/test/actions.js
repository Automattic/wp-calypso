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
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_SET
} from 'state/action-types';

import { useSandbox } from 'test/helpers/use-sinon';
import { DEFAULT_PREFERENCES, USER_SETTING_KEY } from '../constants';
import { fetchPreferences, setPreference } from '../actions';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );
	const responseShape = {
		_headers: { 'content-type': 'application/json' },
		[ USER_SETTING_KEY ]: DEFAULT_PREFERENCES
	};
	const getState = () => ( { preferences: { values: DEFAULT_PREFERENCES } } );
	before( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( '/rest/v1.1/me/settings' )
			.reply( 200, responseShape )
			.post( '/rest/v1.1/me/settings/' )
			.reply( 200, responseShape );
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( '#fetchPreferences()', () => {
		it( 'should dispatch fetch action when thunk triggered', () => {
			fetchPreferences()( spy );
			expect( spy ).to.have.been.calledWith( {
				type: PREFERENCES_FETCH
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return fetchPreferences()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PREFERENCES_FETCH_SUCCESS,
					data: responseShape,
				} );
			} );
		} );
	} );

	describe( '#setPreference()', () => {
		it( 'should dispatch PREFERENCES_SET action when thunk triggered', () => {
			setPreference( 'preferenceKey', 'preferenceValue' )( spy, getState );
			expect( spy ).to.have.been.calledWith( {
				type: PREFERENCES_SET,
				key: 'preferenceKey',
				value: 'preferenceValue'
			} );
		} );

		it( 'should dispatch PREFERENCES_RECEIVE action when request completes', () => {
			return setPreference( 'preferenceKey', 'preferenceValue' )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PREFERENCES_RECEIVE,
					data: responseShape
				} );
			} );
		} );
	} );
} );
