/**
 * External dependencies
 */
import Chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import { SET_PAGE_STATE, RESET_PAGE_STATE } from 'state/action-types';

describe( 'reducer', () => {
	let warn, page;

	before( () => {
		Chai.use( sinonChai );

		warn = sinon.stub();
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lib/warn', warn );

		page = require( '../reducer' );
	} );

	beforeEach( () => {
		warn.reset();
	} );

	after( () => {
		mockery.deregisterAll();
		mockery.disable();
	} );

	it( 'should default to an empty object', () => {
		const state = page( undefined, {} );

		expect( state ).to.be.eql( {} );
	} );

	it( 'should accumulate values on SET_PAGE_STATE', () => {
		const original = Object.freeze( {
			foo: 'bar'
		} );

		const state = page( original, {
			type: SET_PAGE_STATE,
			key: 'baz',
			value: 'qux'
		} );

		expect( state ).to.eql( {
			foo: 'bar',
			baz: 'qux'
		} );
	} );

	it( 'should reset to an empty object on RESET_PAGE_STATE', () => {
		const original = Object.freeze( {
			foo: 'bar'
		} );

		const state = page( original, {
			type: RESET_PAGE_STATE
		} );

		expect( state ).to.eql( {} );
	} );

	it( 'should not allow objects to be saved', () => {
		const state = page( undefined, {
			type: SET_PAGE_STATE,
			key: 'foo',
			value: { bar: 'baz' }
		} );

		expect( state ).to.eql( {} );
		expect( warn ).to.have.been.calledOnce;
	} );

	it( 'should not allow unsupported value types to be saved', () => {
		const state = page( undefined, {
			type: SET_PAGE_STATE,
			key: 'foo',
			value: () => {}
		} );

		expect( state ).to.eql( {} );
		expect( warn ).to.have.been.calledOnce;
	} );
} );
