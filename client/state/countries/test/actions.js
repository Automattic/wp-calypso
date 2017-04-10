/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	COUNTRIES_RECEIVE,
	COUNTRIES_REQUEST,
	COUNTRIES_REQUEST_SUCCESS,
	COUNTRIES_REQUEST_FAILURE
} from 'state/action-types';
import {
	requestDomainRegistrationSupportedCountries,
	requestPaymentSupportCountries,
	requestSMSSupportCountries
} from '../actions';
import { listTypes } from '../constants';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );
	const countries = deepFreeze( [
		{ code: 'US', name: 'United States' },
		{ code: 'IN', name: 'India' }
	] );

	describe( '#requestDomainRegistrationSupportedCountries', () => {
		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/domains/supported-countries/' )
					.reply( 200, countries );
			} );

			it( 'should dispatch fetch action when thunk triggered', () => {
				requestDomainRegistrationSupportedCountries()( spy );
				expect( spy ).to.have.been.calledWith( { type: COUNTRIES_REQUEST, listType: listTypes.DOMAIN } );
			} );

			it( 'should dispatch receive action when request completes', () => {
				return requestDomainRegistrationSupportedCountries()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( { type: COUNTRIES_RECEIVE, listType: listTypes.DOMAIN, countries } );
				} );
			} );

			it( 'should dispatch request success action when request completes', () => {
				return requestDomainRegistrationSupportedCountries()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( { type: COUNTRIES_REQUEST_SUCCESS, listType: listTypes.DOMAIN } );
				} );
			} );
		} );

		describe( 'error', () => {
			const error = deepFreeze( {
				error: 'server_error',
				message: 'A server error has occurred'
			} );

			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/domains/supported-countries/' )
					.reply( 500, error );
			} );

			it( 'should dispatch request failure action when the request fails', () => {
				return requestDomainRegistrationSupportedCountries()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: COUNTRIES_REQUEST_FAILURE, listType: listTypes.DOMAIN, error: sinon.match( { message: error.message } )
					} );
				} ).catch( err => {
					expect( err ).to.be.an( 'error' );
				} );
			} );
		} );
	} );

	describe( '#requestPaymentSupportCountries', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/me/transactions/supported-countries/' )
				.reply( 200, countries );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestPaymentSupportCountries()( spy );
			expect( spy ).to.have.been.calledWith( { type: COUNTRIES_REQUEST, listType: listTypes.PAYMENT } );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestPaymentSupportCountries()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( { type: COUNTRIES_RECEIVE, listType: listTypes.PAYMENT, countries } );
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestPaymentSupportCountries()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( { type: COUNTRIES_REQUEST_SUCCESS, listType: listTypes.PAYMENT } );
			} );
		} );
	} );

	describe( '#requestSMSSupportCountries', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/meta/sms-country-codes/' )
				.reply( 200, countries );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestSMSSupportCountries()( spy );
			expect( spy ).to.have.been.calledWith( { type: COUNTRIES_REQUEST, listType: listTypes.SMS } );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestSMSSupportCountries()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( { type: COUNTRIES_RECEIVE, listType: listTypes.SMS, countries } );
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestSMSSupportCountries()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( { type: COUNTRIES_REQUEST_SUCCESS, listType: listTypes.SMS } );
			} );
		} );
	} );
} );
