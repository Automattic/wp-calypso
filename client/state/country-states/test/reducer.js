/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
	SERIALIZE,
} from 'state/action-types';
import reducer, {
	countryStatesList,
	isFetching,
} from '../reducer';

describe( 'reducer', () => {
	before( () => {
		sinon.stub( console, 'warn' );
	} );

	after( () => {
		console.warn.restore();
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'countryStatesList',
			'isFetching'
		] );
	} );

	describe( '#countryStatesList()', () => {
		it( 'should default to empty object', () => {
			const state = countryStatesList( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should store the states list received', () => {
			const countryStates =  {
				ca: [
					'QUEBEC',
					'ONTARIO',
					'BRITISH COLUMBIA'
				]
			} ;

			const state = countryStatesList( {}, {
				type: COUNTRY_STATES_RECEIVE,
				country: 'ca',
				statesList: countryStates.ca
			} );

			expect( state ).to.eql( countryStates );
		} );
		
	} );

	describe( '#isFetching()', () => {
		it( 'should default to false', () => {
			const state = isFetching( undefined, {} );

			expect( state ).to.eql( false );
		} );

		it( 'should be true after a request begins', () => {
			const state = isFetching( false, { type: COUNTRY_STATES_REQUEST } );
			expect( state ).to.eql( true );
		} );

		it( 'should be false when a request completes', () => {
			const state = isFetching( true, { type: COUNTRY_STATES_RECEIVE } );
			expect( state ).to.eql( false );
		} );

		it( 'should be false when a request fails', () => {
			const state = isFetching( true, { type: COUNTRY_STATES_REQUEST_FAILURE } );
			expect( state ).to.eql( false );
		} );

		it( 'should never persist state', () => {
			const state = isFetching( true, { type: SERIALIZE } );

			expect( state ).to.eql( false );
		} );

		it( 'should never load persisted state', () => {
			const state = isFetching( true, { type: DESERIALIZE } );

			expect( state ).to.eql( false );
		} );
	} );
} );
