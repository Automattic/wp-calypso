/** @format */

/**
 * Internal dependencies
 */
import { getJetpackRemoteInstallError } from 'state/selectors';

const url = 'https://yourgroovydomain.com';

describe( 'getJetpackRemoteInstallError()', () => {
	test( 'should return null if no errors', () => {
		const state = {
			jetpackRemoteInstall: {
				error: {},
			},
		};
		expect( getJetpackRemoteInstallError( state, url ) ).toBeNull();
	} );
	test( 'should return any existing error', () => {
		const state = {
			jetpackRemoteInstall: {
				error: {
					[ url ]: 'SOME_ERROR',
				},
			},
		};
		expect( getJetpackRemoteInstallError( state, url ) ).toBe( 'SOME_ERROR' );
	} );
} );
