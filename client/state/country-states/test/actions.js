/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
} from 'state/action-types';
import {
	receiveStatesList,
	requestStatesList,
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	const ca_states = [
		{ code: 'AB', name: 'Alberta' },
		{ code: 'BC', name: 'British Columbia' }
	];

	describe( '#receiveCoutryStatesList()', () => {
		it( 'should return an array', () => {
			const action = receiveStatesList( 'CA', { ca_states } );

			expect( action ).to.eql( {
				type: COUNTRY_STATES_RECEIVE,
				country: 'CA',
				statesList: { ca_states },
			} );
		} );
	} );

	describe( '#requestStatesList()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/domains/supported-states/CA' )
				.twice().reply( 200, ca_states )
				.get( '/rest/v1.1/domains/supported-states/CA' )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestStatesList( 'CA' )( spy );

			expect( spy ).to.have.been.calledWith( { type: COUNTRY_STATES_REQUEST, country: 'CA' } );
		} );

		it( 'should dispatch states list receive action when request completes', () => {
			return requestStatesList( 'CA' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: COUNTRY_STATES_RECEIVE,
					country: 'CA',
					statesList: ca_states
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestStatesList( 'CA' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: COUNTRY_STATES_REQUEST_FAILURE,
					error: sinon.match( { message: 'A server error occurred' } )
				} );
			} );
		} );
	} );
} );
