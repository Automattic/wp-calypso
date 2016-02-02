/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Chai, { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE
} from 'state/action-types';
import {
	fetchSiteStats,
	receiveSiteStats
} from '../actions';

/**
 * Test setup
 */
Chai.use( sinonChai );

describe( '#fetchSiteStats()', () => {
	const spy = sinon.spy();

	before( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( '/rest/v1.1/sites/2916284/publicize-connections' )
			.reply( 200, {
				connections: [
					{ ID: 2, site_ID: 2916284 }
				]
			} )
			.get( '/rest/v1.1/sites/77203074/publicize-connections' )
			.reply( 403, {
				error: 'authorization_required',
				message: 'An active access token must be used to access publicize connections.'
			} );
	} );

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.restore();
	} );

	it( 'should dispatch fetch action when thunk triggered', () => {
		fetchSiteStats( 2916284 )( spy );

		expect( spy ).to.have.been.calledWith( {
			type: SITE_STATS_REQUEST,
			siteId: 2916284
		} );
	} );

	it( 'should dispatch receive action when request completes', ( done ) => {
		fetchSiteStats( 2916284 )( spy ).then( () => {
			expect( spy ).to.have.been.calledTwice;

			const action = spy.getCall( 1 ).args[ 0 ];
			expect( action.type ).to.equal( SITE_STATS_RECEIVE );
			expect( action.siteId ).to.equal( 2916284 );
			expect( action.data.connections ).to.eql( [ { ID: 2, site_ID: 2916284 } ] );

			done();
		} ).catch( done );
	} );

	it( 'should dispatch fail action when request fails', ( done ) => {
		fetchSiteStats( 77203074 )( spy ).then( () => {
			expect( spy ).to.have.been.calledTwice;

			const action = spy.getCall( 1 ).args[ 0 ];
			expect( action.type ).to.equal( SITE_STATS_REQUEST_FAILURE );
			expect( action.siteId ).to.equal( 77203074 );
			expect( action.error.message ).to.equal( 'An active access token must be used to access publicize connections.' );

			done();
		} ).catch( done );
	} );
} );
