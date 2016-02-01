/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import mocks from './data/mocks';

describe( 'config/parser', () => {
	let parser;

	before( () => {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false,
			useCleanCache: true
		} );

		mockery.registerAllowable( 'fs', true );
	} );

	after( () => {
		mockery.deregisterAll();
	} );

	beforeEach( () => {
		parser = null;
	} );

	afterEach( () => {
		mockery.resetCache(); // reset require cache
	} );

	it( 'should return empty object for invalid path', () => {
		mockery.registerMock( 'fs', mocks.INVALID_PATH );
		parser = require( 'config/parser' );

		let data = parser( '/invalid-path' );

		expect( data ).to.eql( {} );
	} );

	it( 'should not include secrets by default', () => {
		mockery.registerMock( 'fs', mocks.VALID_SECRETS );
		parser = require( 'config/parser' );

		let data = parser( '/valid-path' );

		expect( data ).to.not.have.property( 'secret' );
	} );

	it( 'should include secrets when `includeSecrets` is true', () => {
		mockery.registerMock( 'fs', mocks.VALID_SECRETS );
		parser = require( 'config/parser' );

		let data = parser( '/valid-path', {
			includeSecrets: true
		} );

		expect( data ).to.have.property( 'secret', 'very' );
	} );

	it( 'should cascade configs', () => {
		mockery.registerMock( 'fs', mocks.VALID_ENV_FILES );
		parser = require( 'config/parser' );

		let data = parser( '/valid-path', {
			env: 'myenv'
		} );

		expect( data ).to.have.property( 'shared_only', 'shared' );
		expect( data ).to.have.property( 'myenv_only', 'myenv' );
		expect( data ).to.have.property( 'myenvlocal_only', 'myenvlocal' );
		expect( data ).to.have.property( 'myenv_override', 'myenv' );
		expect( data ).to.have.property( 'myenvlocal_override', 'myenvlocal' );
		expect( data.features ).to.have.property( 'enabledFeature', true );
		expect( data.features ).to.have.property( 'disabledFeature', false );
	} );

	it( 'should override enabled feature', () => {
		mockery.registerMock( 'fs', mocks.VALID_ENV_FILES );
		parser = require( 'config/parser' );

		let data = parser( '/valid-path', {
			env: 'myenv',
			disabledFeatures: 'enabledFeature'
		} );

		expect( data.features ).to.have.property( 'enabledFeature', false );
	} );

	it( 'should override disabled feature', () => {
		mockery.registerMock( 'fs', mocks.VALID_ENV_FILES );
		parser = require( 'config/parser' );

		let data = parser( '/valid-path', {
			env: 'myenv',
			enabledFeatures: 'disabledFeature'
		} );

		expect( data.features ).to.have.property( 'disabledFeature', true );
	} );
} );
