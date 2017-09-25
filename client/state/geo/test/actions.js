/**
 * External dependencies
 */
import { expect } from 'chai';
import { match } from 'sinon';

/**
 * Internal dependencies
 */
import { receiveGeo, requestGeo } from '../actions';
import { GEO_RECEIVE, GEO_REQUEST, GEO_REQUEST_SUCCESS, GEO_REQUEST_FAILURE } from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( 'receiveGeo()', () => {
		it( 'should return an action object', () => {
			const action = receiveGeo( {
				latitude: '39.36006',
				longitude: '-84.30994',
				country_short: 'US',
				country_long: 'United States',
				region: 'Ohio',
				city: 'Mason'
			} );

			expect( action ).to.eql( {
				type: GEO_RECEIVE,
				geo: {
					latitude: '39.36006',
					longitude: '-84.30994',
					country_short: 'US',
					country_long: 'United States',
					region: 'Ohio',
					city: 'Mason'
				}
			} );
		} );
	} );

	describe( 'requestGeo()', () => {
		it( 'should dispatch fetch action when thunk triggered', () => {
			requestGeo()( spy );

			expect( spy ).to.have.been.calledWith( {
				type: GEO_REQUEST
			} );
		} );

		context( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/geo/' )
					.reply( 200, {
						latitude: '39.36006',
						longitude: '-84.30994',
						country_short: 'US',
						country_long: 'United States',
						region: 'Ohio',
						city: 'Mason'
					} );
			} );

			it( 'should dispatch receive action when request completes', () => {
				return requestGeo()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith(
						receiveGeo( {
							latitude: '39.36006',
							longitude: '-84.30994',
							country_short: 'US',
							country_long: 'United States',
							region: 'Ohio',
							city: 'Mason'
						} )
					);
				} );
			} );

			it( 'should dispatch request success action when request completes', () => {
				return requestGeo()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: GEO_REQUEST_SUCCESS,
					} );
				} );
			} );
		} );

		context( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/geo/' )
					.reply( 500 );
			} );

			it( 'should dispatch fail action when request fails', () => {
				return requestGeo()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: GEO_REQUEST_FAILURE,
						error: match( { message: 'Internal Server Error' } )
					} );
				} );
			} );
		} );
	} );
} );
