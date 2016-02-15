/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	VIDEO_FETCH,
	VIDEO_FETCH_COMPLETED,
	VIDEO_FETCH_FAILED,
	VIDEO_RECEIVE
} from 'state/action-types';
import { fetchVideo } from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( '#fetchVideo()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/videos/kUJmAcSf' )
				.reply( 200, {
					title: 'VideoPress Demo',
					width: 1920,
					height: 1080
				} )
				.get( '/rest/v1.1/videos/abcdefgh' )
				.reply( 404, {
					error: 'unknown_media',
					message: 'The specified video was not found.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			fetchVideo( 'kUJmAcSf' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: VIDEO_FETCH,
				guid: 'kUJmAcSf'
			} );
		} );

		it( 'should dispatch video receive action when request completes', () => {
			return fetchVideo( 'kUJmAcSf' )( spy ).then( () => {
				const action = spy.getCall( 1 ).args[ 0 ];

				expect( action.type ).to.equal( VIDEO_RECEIVE );
				expect( action.guid ).to.equal( 'kUJmAcSf' );
				expect( action.data.title ).to.eql( 'VideoPress Demo' );
				expect( action.data.width ).to.eql( 1920 );
				expect( action.data.height ).to.eql( 1080 );
			} );
		} );

		it( 'should dispatch video fetch completed action when fetching completes', () => {
			return fetchVideo( 'kUJmAcSf' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: VIDEO_FETCH_COMPLETED,
					guid: 'kUJmAcSf'
				} );
			} );
		} );

		it( 'should dispatch video fetch failed action when fetching fails', () => {
			return fetchVideo( 'abcdefgh' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: VIDEO_FETCH_FAILED,
					guid: 'abcdefgh',
					error: sinon.match( { message: 'The specified video was not found.' } )
				} );
			} );
		} );
	} );
} );
