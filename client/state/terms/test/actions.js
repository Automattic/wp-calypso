/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_SUCCESS,
	TERMS_REQUEST_FAILURE
} from 'state/action-types';
import {
	receiveTerms,
	requestSiteTerms
} from '../actions';

/**
 * Module Variables
 */
const testTerms = [
	{ ID: 777, name: 'Chicken', slug: 'chicken', description: 'cornel sanders', post_count: 1, number: 0 },
	{ ID: 778, name: 'Ribs', slug: 'ribs', description: 'i want my baby back * 3 ribs', post_count: 100, number: 0 },
];
const siteId = 771234;
const taxonomyName = 'jetpack-testimonials';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( '#receiveTerms()', () => {
		it( 'should return an action object', () => {
			const action = receiveTerms( siteId, taxonomyName, testTerms );

			expect( action ).to.eql( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: testTerms
			} );
		} );
	} );

	describe( '#requestSiteTerms()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms` )
				.reply( 200, {
					found: 2,
					terms: testTerms
				} )
				.get( `/rest/v1.1/sites/12345/taxonomies/chicken-and-ribs/terms` )
				.reply( 400, {
					message: 'The taxonomy does not exist',
					error: 'invalid_taxonomy'
				} );
		} );

		it( 'should dispatch a TERMS_REQUEST', () => {
			requestSiteTerms( siteId, taxonomyName )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: TERMS_REQUEST,
				siteId: siteId,
				taxonomy: taxonomyName,
				query: {}
			} );
		} );

		it( 'should dispatch a TERMS_RECEIVE event on success', () => {
			return requestSiteTerms( siteId, taxonomyName )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_RECEIVE,
					siteId: siteId,
					taxonomy: taxonomyName,
					terms: testTerms
				} );
			} );
		} );

		it( 'should dispatch TERMS_REQUEST_SUCCESS action when request succeeds', () => {
			return requestSiteTerms( siteId, taxonomyName )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_REQUEST_SUCCESS,
					siteId: siteId,
					taxonomy: taxonomyName,
					query: {}
				} );
			} );
		} );

		it( 'should dispatch TERMS_REQUEST_FAILURE action when request fails', () => {
			return requestSiteTerms( 12345, 'chicken-and-ribs' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_REQUEST_FAILURE,
					siteId: 12345,
					taxonomy: 'chicken-and-ribs',
					query: {},
					error: sinon.match( { error: 'invalid_taxonomy' } )
				} );
			} );
		} );
	} );
} );
