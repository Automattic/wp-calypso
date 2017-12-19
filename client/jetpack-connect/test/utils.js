/** @format */

/**
 * Internal dependencies
 */
import { addCalypsoEnvQueryArg } from '../utils';

jest.mock( 'config', () => () => 'mocked-test-env-id' );

describe( 'addCalypsoEnvQueryArg', () => {
	test( 'should add config env_id as calypso_env', () => {
		expect( addCalypsoEnvQueryArg( 'http://example.com' ) ).toBe(
			'http://example.com/?calypso_env=mocked-test-env-id'
		);
	} );
} );
