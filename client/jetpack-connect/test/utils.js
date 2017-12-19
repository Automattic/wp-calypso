/** @format */

/**
 * Internal dependencies
 */
import { addCalypsoEnvQueryArg } from '../utils';

jest.mock( 'config', () => input => {
	const lookupTable = {
		env_id: 'mocked-test-env-id',
	};
	if ( input in lookupTable ) {
		return lookupTable[ input ];
	}
	throw new Error( 'Unrecognized input to mocked config' );
} );

describe( 'addCalypsoEnvQueryArg', () => {
	test( 'should add config env_id as calypso_env', () => {
		expect( addCalypsoEnvQueryArg( 'http://example.com' ) ).toBe(
			'http://example.com/?calypso_env=mocked-test-env-id'
		);
	} );
} );
