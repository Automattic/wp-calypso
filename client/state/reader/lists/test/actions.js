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
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_REQUEST_SUCCESS,
	READER_LISTS_REQUEST_FAILURE
} from 'state/action-types';
import {
	receiveLists,
	requestSubscribedLists
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( '#receiveLists()', () => {
		it( 'should return an action object', () => {
			const lists = [ { ID: 841, title: 'Hello World', slug: 'hello-world' } ];
			const action = receiveLists( lists );

			expect( action ).to.eql( {
				type: READER_LISTS_RECEIVE,
				lists
			} );
		} );
	} );

	describe( '#requestSubscribedLists()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.2/read/lists' )
				.reply( 200, {
					found: 2,
					lists: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Mango & Feijoa' }
					]
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestSubscribedLists()( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LISTS_REQUEST
			} );
		} );

		it( 'should dispatch lists receive action when request completes', () => {
			return requestSubscribedLists()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: READER_LISTS_RECEIVE,
					lists: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Mango & Feijoa' }
					]
				} );
			} );
		} );
	} );
} );
