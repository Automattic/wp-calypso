/**
 * External dependencies
 */
import mockery from 'mockery';
import useMockery from 'test/helpers/use-mockery';

/**
 * Internal dependencies
 */
import mocks from './data/mocks';

describe.skip( 'parser', () => {
	let parser;

	useMockery();

	beforeAll( () => {
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

		expect( data ).toEqual( { serverData: {}, clientData: {} } );
	} );

	it( 'server should have secrets and client should not', () => {
		mockery.registerMock( 'fs', mocks.VALID_SECRETS );
		parser = require( 'config/parser' );

		const data = parser( '/valid-path' );
		console.log( data );

		expect( data.clientData ).not.toHaveProperty( 'secret' );
		expect( data.serverData ).toHaveProperty( 'secret' );
	} );

	it( 'should cascade configs', () => {
		mockery.registerMock( 'fs', mocks.VALID_ENV_FILES );
		parser = require( 'config/parser' );

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
		} );

		expect( data ).toHaveProperty( 'shared_only', 'shared' );
		expect( data ).toHaveProperty( 'myenv_only', 'myenv' );
		expect( data ).toHaveProperty( 'myenvlocal_only', 'myenvlocal' );
		expect( data ).toHaveProperty( 'myenv_override', 'myenv' );
		expect( data ).toHaveProperty( 'myenvlocal_override', 'myenvlocal' );
		expect( typeof data ).toBe( 'object' ).that.deep.equals( {
			enabledFeature1: true,
			enabledFeature2: true,
			disabledFeature1: false,
			disabledFeature2: false,
		} );
	} );

	it( 'should override enabled feature when disabledFeatures set', () => {
		mockery.registerMock( 'fs', mocks.VALID_ENV_FILES );
		parser = require( 'config/parser' );

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
			disabledFeatures: 'enabledFeature2',
		} );

		expect( data ).toHaveProperty( 'features.enabledFeature2', false );
	} );

	it( 'should override disabled feature when enabledFeatures set', () => {
		mockery.registerMock( 'fs', mocks.VALID_ENV_FILES );
		parser = require( 'config/parser' );

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
			enabledFeatures: 'disabledFeature2',
		} );

		expect( data ).toHaveProperty( 'features.disabledFeature2', true );
	} );
} );
