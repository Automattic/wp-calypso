jest.mock( 'fs' );

describe( 'parser', () => {
	let parser;

	it( 'should return empty objects for an invalid path', () => {
		parser = require( 'config/parser' );

		const data = parser( '/invalid-path' );

		expect( data ).toEqual( { serverData: {}, clientData: {} } );
	} );

	it( 'server should have secrets and client should not', () => {
		require( 'fs' ).__setValidSecrets();
		parser = require( 'config/parser' );

		const data = parser( '/valid-path' );

		expect( data.clientData ).not.toHaveProperty( 'secret' );
		expect( data.serverData ).toHaveProperty( 'secret' );
	} );

	it( 'should cascade configs', () => {
		require( 'fs' ).__setValidEnvFiles();
		parser = require( 'config/parser' );

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
		} );

		expect( data ).toHaveProperty( 'shared_only', 'shared' );
		expect( data ).toHaveProperty( 'myenv_only', 'myenv' );
		expect( data ).toHaveProperty( 'myenvlocal_only', 'myenvlocal' );
		expect( data ).toHaveProperty( 'myenv_override', 'myenv' );
		expect( data ).toHaveProperty( 'myenvlocal_override', 'myenvlocal' );
		expect( data ).toHaveProperty( 'features', {
			enabledFeature1: true,
			enabledFeature2: true,
			disabledFeature1: false,
			disabledFeature2: false,
		} );
	} );

	it( 'should override enabled feature when disabledFeatures set', () => {
		require( 'fs' ).__setValidEnvFiles();
		parser = require( 'config/parser' );

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
			disabledFeatures: 'enabledFeature2',
		} );

		expect( data ).toHaveProperty( 'features.enabledFeature2', false );
	} );

	it( 'should override disabled feature when enabledFeatures set', () => {
		require( 'fs' ).__setValidEnvFiles();
		parser = require( 'config/parser' );

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
			enabledFeatures: 'disabledFeature2',
		} );

		expect( data ).toHaveProperty( 'features.disabledFeature2', true );
	} );
} );
