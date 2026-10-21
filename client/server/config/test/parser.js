import fs from 'fs';
import parser from '@automattic/calypso-config/parser';

jest.mock( 'fs', () => ( {
	existsSync: jest.fn(),
	readFileSync: jest.fn(),
} ) );

function mockFs( files ) {
	fs.existsSync.mockImplementation( ( path ) => !! files[ path ] );
	fs.readFileSync.mockImplementation( ( path ) => files[ path ] );
}

const withEnv = ( env = {} ) => {
	for ( const [ k, v ] of Object.entries( env ) ) {
		process.env[ k ] = v;
	}
};

function setValidSecrets() {
	mockFs( {
		'/valid-path/secrets.json': JSON.stringify( {
			secret: 'very',
			wpcom_calypso_rest_api_key: 'rest_api',
			wpcom_calypso_support_session_rest_api_key: 'session_api',
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
			features: {
				enabledFeature2: false,
				myenvFeature: true,
			},
		} ),
		'/valid-path/myenv.local.json': JSON.stringify( {
			myenvlocal_only: 'myenvlocal',
			myenvlocal_override: 'myenvlocal',
		} ),
	} );
}

function setEmptySecrets() {
	mockFs( {
		'/valid-path/secrets.json': JSON.stringify( {
			secret: 'very',
		} ),
		'/valid-path/_shared.json': JSON.stringify( {
			features: {
				'wpcom-user-bootstrap': true,
			},
		} ),
	} );
}

describe( 'parser', () => {
	let realProcessEnv;
	beforeEach( () => {
		realProcessEnv = { ...process.env };
	} );

	afterEach( () => {
		fs.readFileSync.mockReset();
		fs.readFileSync.mockReset();
		process.env = { ...realProcessEnv };
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
		// `features` from later config files merges into (rather than replaces)
		// earlier ones: `enabledFeature1` from `_shared` survives, `enabledFeature2`
		// is overridden by `myenv`, and `myenvFeature` is added.
		expect( data ).toHaveProperty( 'features', {
			enabledFeature1: true,
			enabledFeature2: false,
			disabledFeature1: false,
			disabledFeature2: false,
			myenvFeature: true,
		} );
	} );

	test( 'should ignore a __proto__ config key without polluting or crashing', () => {
		// JSON.parse (unlike an object literal) yields a real own `__proto__` key;
		// a naive `data[ key ] = value` would set the prototype and then crash on
		// `data.hasOwnProperty`. The parser must skip it instead.
		mockFs( {
			'/valid-path/_shared.json': '{ "__proto__": null, "safe": "ok", "features": { "a": true } }',
		} );

		let data;
		expect( () => {
			data = parser( '/valid-path' ).serverData;
		} ).not.toThrow();
		expect( Object.getPrototypeOf( data ) ).toBe( Object.prototype );
		expect( data ).toHaveProperty( 'safe', 'ok' );
		expect( data ).toHaveProperty( 'features', { a: true } );
		expect( {}.polluted ).toBeUndefined();
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

	test( 'should override secrets with env vars', () => {
		withEnv( {
			WPCOM_CALYPSO_REST_API_KEY: 'foo',
			WPCOM_CALYPSO_SUPPORT_SESSION_REST_API_KEY: 'bar',
		} );
		setValidSecrets();

		const { serverData } = parser( '/valid-path' );

		expect( serverData.wpcom_calypso_rest_api_key ).toBe( 'foo' );
		expect( serverData.wpcom_calypso_support_session_rest_api_key ).toBe( 'bar' );
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
