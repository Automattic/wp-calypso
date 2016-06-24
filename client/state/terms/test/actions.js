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
	TERM_REMOVE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_SUCCESS,
	TERMS_REQUEST_FAILURE
} from 'state/action-types';
import {
	addTerm,
	receiveTerm,
	receiveTerms,
	removeTerm,
	requestSiteTerms
} from '../actions';

/**
 * Module Variables
 */
const testTerms = [
	{ ID: 777, name: 'Chicken', slug: 'chicken', description: 'His Majesty Colonel Sanders', post_count: 1, number: 0 },
	{ ID: 778, name: 'Ribs', slug: 'ribs', description: 'i want my baby back * 3 ribs', post_count: 100, number: 0 },
];
const siteId = 2916284;
const taxonomyName = 'jetpack-testimonials';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( 'addTerm()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms/new` )
				.reply( 200, {
					ID: 123,
					name: 'ribs',
					description: ''
				} )
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/chicken-and-ribs/terms/new` )
				.reply( 400, {
					message: 'The taxonomy does not exist',
					error: 'invalid_taxonomy'
				} );
		} );

		it( 'should dispatch a TERMS_RECEIVE', () => {
			addTerm( siteId, taxonomyName, { name: 'ribs' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: [
					sinon.match( {
						ID: sinon.match( /^temporary/ ),
						name: 'ribs'
					} )
				],
				query: undefined,
				found: undefined
			} );
		} );

		it( 'should dispatch a TERMS_RECEIVE event on success', () => {
			return addTerm( siteId, taxonomyName, { name: 'ribs' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_RECEIVE,
					siteId: siteId,
					taxonomy: taxonomyName,
					terms: [ {
						ID: 123,
						name: 'ribs',
						description: ''
					} ],
					query: undefined,
					found: undefined
				} );
			} );
		} );

		it( 'should dispatch a TERM_REMOVE event on success', () => {
			return addTerm( siteId, taxonomyName, { name: 'ribs' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERM_REMOVE,
					siteId: siteId,
					taxonomy: taxonomyName,
					termId: sinon.match( /^temporary/ )
				} );
			} );
		} );

		it( 'should dispatch a TERM_REMOVE event on failure', () => {
			return addTerm( siteId, 'chicken-and-ribs', { name: 'new term' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERM_REMOVE,
					siteId: siteId,
					taxonomy: 'chicken-and-ribs',
					termId: sinon.match( /^temporary/ )
				} );
			} );
		} );
	} );

	describe( 'receiveTerm()', () => {
		it( 'should return an action object', () => {
			const action = receiveTerm( siteId, taxonomyName, testTerms[ 0 ] );

			expect( action ).to.eql( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: [ testTerms[ 0 ] ],
				query: undefined,
				found: undefined
			} );
		} );
	} );

	describe( '#receiveTerms()', () => {
		it( 'should return an action object', () => {
			const action = receiveTerms( siteId, taxonomyName, testTerms, {}, 2 );

			expect( action ).to.eql( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: testTerms,
				query: {},
				found: 2
			} );
		} );

		it( 'should return an action object with query if passed', () => {
			const action = receiveTerms( siteId, taxonomyName, testTerms, { search: 'foo' }, 2 );

			expect( action ).to.eql( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: testTerms,
				query: { search: 'foo' },
				found: 2
			} );
		} );
	} );

	describe( 'removeTerm()', () => {
		it( 'should return an action object', () => {
			const action = removeTerm( siteId, taxonomyName, 777 );

			expect( action ).to.eql( {
				type: TERM_REMOVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				termId: 777
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
					terms: testTerms,
					query: {},
					found: 2
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
