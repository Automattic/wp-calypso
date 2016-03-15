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
	requestedSubscribedLists
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
} );
