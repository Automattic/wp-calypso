/**
 * External dependencies
 */
import { expect } from 'chai';
import { match } from 'sinon';

/**
 * Internal dependencies
 */
import { receiveHappinessEngineers, fetchHappinessEngineers } from '../actions';
import {
	HAPPINESS_ENGINEERS_FETCH,
	HAPPINESS_ENGINEERS_RECEIVE,
	HAPPINESS_ENGINEERS_FETCH_FAILURE,
	HAPPINESS_ENGINEERS_FETCH_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	describe( 'receiveHappinessEngineers()', () => {
		test( 'should return an action object', () => {
			const action = receiveHappinessEngineers( [
				{ avatar_URL: 'test 1' },
				{ avatar_URL: 'test 2' },
			] );

			expect( action ).to.eql( {
				type: HAPPINESS_ENGINEERS_RECEIVE,
				happinessEngineers: [ { avatar_URL: 'test 1' }, { avatar_URL: 'test 2' } ],
			} );
		} );
	} );

	describe( 'fetchHappinessEngineers()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/meta/happiness-engineers/' )
					.reply( 200, [ { avatar_URL: 'test 1' } ] );
			} );

			test( 'should dispatch fetch action when thunk triggered', () => {
				fetchHappinessEngineers()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: HAPPINESS_ENGINEERS_FETCH,
				} );
			} );

			test( 'should dispatch receive action when request completes', () => {
				return fetchHappinessEngineers()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith(
						receiveHappinessEngineers( [ { avatar_URL: 'test 1' } ] )
					);
				} );
			} );

			test( 'should dispatch request success action when request completes', () => {
				return fetchHappinessEngineers()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: HAPPINESS_ENGINEERS_FETCH_SUCCESS,
					} );
				} );
			} );
		} );

		describe( 'failed', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/meta/happiness-engineers/' )
					.reply( 500, { error: 'Server Error' } );
			} );

			test( 'should dispatch request failoure when request erorred', () => {
				return fetchHappinessEngineers()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: HAPPINESS_ENGINEERS_FETCH_FAILURE,
						error: match( { error: 'Server Error' } ),
					} );
				} );
			} );
		} );
	} );
} );
