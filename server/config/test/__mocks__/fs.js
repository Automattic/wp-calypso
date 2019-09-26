/**
 * External dependencies
 */

import path from 'path';

const fs = jest.genMockFromModule( 'fs' );
let mockFiles = {};

function toJSON( val ) {
	return JSON.stringify( val );
}

function setValidSecrets() {
	mockFiles = {
		'secrets.json': toJSON( {
			secret: 'very',
		} ),
		'empty-secrets.json': toJSON( {
			secret: 'fromempty',
		} ),
	};
}

function setEmptySecrets() {
	mockFiles = {
		'empty-secrets.json': toJSON( {
			secret: 'fromempty',
		} ),
		'_shared.json': toJSON( {
			features: {
				'wpcom-user-bootstrap': true,
			},
		} ),
	};
}

function setValidEnvFiles() {
	mockFiles = {
		'_shared.json': toJSON( {
			shared_only: 'shared',
			myenv_override: 'shared',
			features: {
				enabledFeature1: true,
				disabledFeature1: false,
				enabledFeature2: true,
				disabledFeature2: false,
			},
		} ),
		'myenv.json': toJSON( {
			myenv_only: 'myenv',
			myenv_override: 'myenv',
			myenvlocal_override: 'myenv',
		} ),
		'myenv.local.json': toJSON( {
			myenvlocal_only: 'myenvlocal',
			myenvlocal_override: 'myenvlocal',
		} ),
	};
}

function existsSync( file ) {
	return Boolean( mockFiles[ path.basename( file ) ] );
}

function readFileSync( file ) {
	return mockFiles[ path.basename( file ) ];
}

fs.__setValidSecrets = setValidSecrets;
fs.__setEmptySecrets = setEmptySecrets;
fs.__setValidEnvFiles = setValidEnvFiles;
fs.existsSync = existsSync;
fs.readFileSync = readFileSync;

export default fs;
