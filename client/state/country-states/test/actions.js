/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveCountryStates, requestCountryStates } from '../actions';
import {
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
	COUNTRY_STATES_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	describe( '#receiveCountryStates()', () => {
		test( 'should return an action object', () => {
			const action = receiveCountryStates(
				[
					{ code: 'AK', name: 'Alaska' },
					{ code: 'AS', name: 'American Samoa' },
				],
				'US'
			);

			expect( action ).to.eql( {
				type: COUNTRY_STATES_RECEIVE,
				countryCode: 'us',
				countryStates: [
					{ code: 'AK', name: 'Alaska' },
					{ code: 'AS', name: 'American Samoa' },
				],
			} );
		} );
	} );

	describe( '#requestCountryStates()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/domains/supported-states/us' )
				.reply( 200, [
					{ code: 'AK', name: 'Alaska' },
					{ code: 'AS', name: 'American Samoa' },
				] )
				.get( '/rest/v1.1/domains/supported-states/ca' )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestCountryStates( 'us' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: COUNTRY_STATES_REQUEST,
				countryCode: 'us',
			} );
		} );

		test( 'should dispatch country states receive action when request completes', () => {
			return requestCountryStates( 'us' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: COUNTRY_STATES_RECEIVE,
					countryCode: 'us',
					countryStates: [
						{ code: 'AK', name: 'Alaska' },
						{ code: 'AS', name: 'American Samoa' },
					],
				} );
			} );
		} );

		test( 'should dispatch country states request success action when request completes', () => {
			return requestCountryStates( 'us' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: COUNTRY_STATES_REQUEST_SUCCESS,
					countryCode: 'us',
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestCountryStates( 'ca' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: COUNTRY_STATES_REQUEST_FAILURE,
					countryCode: 'ca',
					error: sinon.match( { message: 'A server error occurred' } ),
				} );
			} );
		} );
	} );
} );
