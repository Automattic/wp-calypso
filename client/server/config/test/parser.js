/**
 * External dependencies
 */
import mockFs from 'mock-fs';
import parser from 'calypso/config/parser';

function setValidSecrets() {
	mockFs( {
		'/valid-path/secrets.json': JSON.stringify( {
			secret: 'very',
		} ),
		'/valid-path/empty-secrets.json': JSON.stringify( {
			secret: 'fromempty',
		} ),
	} );
}

function setValidEnvFiles() {
	mockFs( {
		'/valid-path/_shared.json': JSON.stringify( {
			shared_only: 'shared',
			myenv_override: 'shared',
			features: {
				enabledFeature1: true,
				disabledFeature1: false,
				enabledFeature2: true,
				disabledFeature2: false,
			},
		} ),
		'/valid-path/myenv.json': JSON.stringify( {
			myenv_only: 'myenv',
			myenv_override: 'myenv',
			myenvlocal_override: 'myenv',
		} ),
		'/valid-path/myenv.local.json': JSON.stringify( {
			myenvlocal_only: 'myenvlocal',
			myenvlocal_override: 'myenvlocal',
		} ),
	} );
}

function setEmptySecrets() {
	mockFs( {
		'/valid-path/empty-secrets.json': JSON.stringify( {
			secret: 'fromempty',
		} ),
		'/valid-path/_shared.json': JSON.stringify( {
			features: {
				'wpcom-user-bootstrap': true,
			},
		} ),
	} );
}

describe( 'parser', () => {
	afterEach( () => {
		mockFs.restore();
	} );

	test( 'should return empty objects for an invalid path', () => {
		const data = parser( '/invalid-path' );

		expect( data ).toEqual( { serverData: {}, clientData: {} } );
	} );

	test( 'server should have secrets and client should not', () => {
		setValidSecrets();

		const data = parser( '/valid-path' );

		expect( data.clientData ).not.toHaveProperty( 'secret' );
		expect( data.serverData ).toHaveProperty( 'secret' );
	} );

	test( 'should cascade configs', () => {
		setValidEnvFiles();

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

	test( 'should override enabled feature when disabledFeatures set', () => {
		setValidEnvFiles();

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
			disabledFeatures: 'enabledFeature2',
		} );

		expect( data ).toHaveProperty( 'features.enabledFeature2', false );
	} );

	test( 'should override disabled feature when enabledFeatures set', () => {
		setValidEnvFiles();

		const { serverData: data } = parser( '/valid-path', {
			env: 'myenv',
			enabledFeatures: 'disabledFeature2',
		} );

		expect( data ).toHaveProperty( 'features.disabledFeature2', true );
	} );

	test( 'should explicitly set user-bootstrapping to false if there are no real secrets', () => {
		setEmptySecrets();
		const errorSpy = jest.fn();
		global.console = { error: errorSpy };

		const { serverData, clientData } = parser( '/valid-path' );

		expect( serverData.features[ 'wpcom-user-bootstrap' ] ).toBe( false );
		expect( clientData.features[ 'wpcom-user-bootstrap' ] ).toBe( false );
		expect( errorSpy ).toHaveBeenCalledTimes( 1 );
	} );
} );
