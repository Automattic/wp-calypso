/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	STATES_LIST_RECEIVE,
	STATES_LIST_REQUEST,
	STATES_LIST_REQUEST_FAILURE,
} from 'state/action-types';
import {
	receiveStatesList,
	requestStatesList,
} from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#receiveStatesList()', () => {
		it( 'should return an action object', () => {
			const action = receiveStatesList( [
				{ code: 'AK', name: 'Alaska' },
				{ code: 'AS', name: 'American Samoa' }
			], 'US' );

			expect( action ).to.eql( {
				type: STATES_LIST_RECEIVE,
				countryCode: 'US',
				statesList: [
					{ code: 'AK', name: 'Alaska' },
					{ code: 'AS', name: 'American Samoa' }
				]
			} );
		} );
	} );

	describe( '#requestStatesList()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/domains/supported-states/US' )
				.twice().reply( 200, [
					{ code: 'AK', name: 'Alaska' },
					{ code: 'AS', name: 'American Samoa' }
				] )
				.get( '/rest/v1.1/domains/supported-states/US' )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestStatesList( 'US' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: STATES_LIST_REQUEST,
				countryCode: 'US'
			} );
		} );

		it( 'should dispatch product list receive action when request completes', () => {
			return requestStatesList( 'US' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: STATES_LIST_RECEIVE,
					countryCode: 'US',
					statesList: [
						{ code: 'AK', name: 'Alaska' },
						{ code: 'AS', name: 'American Samoa' }
					]
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestStatesList( 'US' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: STATES_LIST_REQUEST_FAILURE,
					error: sinon.match( { message: 'A server error occurred' } )
				} );
			} );
		} );
	} );
} );
