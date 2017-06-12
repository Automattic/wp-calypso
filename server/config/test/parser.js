/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';
import useMockery from 'test/helpers/use-mockery';

/**
 * Internal dependencies
 */
import mocks from './data/mocks';

describe( 'parser', () => {
	let parser;

	useMockery();

	before( () => {
		mockery.registerAllowable( 'fs', true );
	} );

	beforeEach( () => {
		parser = null;
	} );

	afterEach( () => {
		mockery.resetCache(); // reset require cache
	} );

	it( 'should return empty objects for an invalid path', () => {
		mockery.registerMock( 'fs', mocks.INVALID_PATH );
		parser = require( 'config/parser' );

		const data = parser( '/invalid-path' );

		expect( data ).to.eql( { serverData: {}, clientData: {} } );
	} );

	it( 'server should have secrets and client should not', () => {
		mockery.registerMock( 'fs', mocks.VALID_SECRETS );
		parser = require( 'config/parser' );

		const data = parser( '/valid-path' );

		expect( data.clientData ).to.not.have.property( 'secret' );
		expect( data.serverData ).to.have.property( 'secret' );
	} );

	it( 'should cascade configs', () => {
		mockery.registerMock( 'fs', mocks.VALID_ENV_FILES );
		parser = require( 'config/parser' );

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv'
		} );

		expect( data ).to.have.property( 'shared_only', 'shared' );
		expect( data ).to.have.property( 'myenv_only', 'myenv' );
		expect( data ).to.have.property( 'myenvlocal_only', 'myenvlocal' );
		expect( data ).to.have.property( 'myenv_override', 'myenv' );
		expect( data ).to.have.property( 'myenvlocal_override', 'myenvlocal' );
		expect( data ).to.have.property( 'features' )
			.that.is.an( 'object' )
			.that.deep.equals( {
				enabledFeature1: true,
				enabledFeature2: true,
				disabledFeature1: false,
				disabledFeature2: false
			} );
	} );

	it( 'should override enabled feature when disabledFeatures set', () => {
		mockery.registerMock( 'fs', mocks.VALID_ENV_FILES );
		parser = require( 'config/parser' );

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
			disabledFeatures: 'enabledFeature2'
		} );

		expect( data ).to.have.deep.property( 'features.enabledFeature2', false );
	} );

	it( 'should override disabled feature when enabledFeatures set', () => {
		mockery.registerMock( 'fs', mocks.VALID_ENV_FILES );
		parser = require( 'config/parser' );

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
			enabledFeatures: 'disabledFeature2'
		} );

		expect( data ).to.have.deep.property( 'features.disabledFeature2', true );
	} );
} );
