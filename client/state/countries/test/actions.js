/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	COUNTRIES_RECEIVE,
	COUNTRIES_REQUEST,
	COUNTRIES_REQUEST_SUCCESS,
	COUNTRIES_REQUEST_FAILURE
} from 'state/action-types';
import { requestCountries } from '../actions';
import { DOMAIN, SMS, PAYMENT } from '../constants';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );
	describe( '#requestCountries() - Success', () => {
		let countries;
		useNock( nock => {
			countries = [
				{ code: 'US', name: 'United States' },
				{ code: 'IN', name: 'India' }
			];
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/domains/supported-countries/' )
				.reply( 200, countries )
				.get( '/rest/v1.1/meta/sms-country-codes/' )
				.reply( 200, countries )
				.get( '/rest/v1.1/me/transactions/supported-countries/' )
				.reply( 200, countries );
		} );

		[ DOMAIN, SMS, PAYMENT ].forEach( listType => {
			it( `${ listType }: should dispatch fetch action when thunk triggered`, () => {
				requestCountries( listType )( spy );
				expect( spy ).to.have.been.calledWith( { type: COUNTRIES_REQUEST, listType } );
			} );

			it( `${ listType }: should dispatch receive action when request completes`, () => {
				requestCountries( listType )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( { type: COUNTRIES_RECEIVE, listType, countries } );
				} );
			} );

			it( `${ listType }: should dispatch request success action when request completes`, () => {
				requestCountries( listType )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( { type: COUNTRIES_REQUEST_SUCCESS, listType } );
				} );
			} );
		} );
	} );

	describe( '#requestCountries() - Error', () => {
		const error = {
			error: 'server_error',
			message: 'A server error has occurred'
		};
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/domains/supported-countries/' )
				.reply( 500, error )
				.get( '/rest/v1.1/meta/sms-country-codes/' )
				.reply( 500, error )
				.get( '/rest/v1.1/me/transactions/supported-countries/' )
				.reply( 500, error );
		} );
		[ DOMAIN, SMS, PAYMENT ].forEach( listType => {
			it( `${ listType }: should dispatch request fail action when request fails`, () => {
				requestCountries( listType )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: COUNTRIES_REQUEST_FAILURE,
						listType,
						error: sinon.match( { message: error.message } )
					} );
				} );
			} );
		} );
	} );
} );

