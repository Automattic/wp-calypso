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
	requestCountries
} from '../actions';

const actions = {
	request: 'TEST_REQUEST',
	success: 'TEST_SUCCESS',
	failure: 'TEST_FAILURE'
};

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	it( 'should dispatch REQUEST action', () => {
		const requestCountriesTest = requestCountries( actions, () => {
			return Promise.resolve( [] );
		} );

		requestCountriesTest( spy );

		expect( spy ).to.have.been.calledWith( { type: actions.request } );
	} );
} );
