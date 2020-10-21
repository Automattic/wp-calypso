/**
 * Internal dependencies
 */
import getJetpackRemoteInstallErrorCode from 'calypso/state/selectors/get-jetpack-remote-install-error-code';

const url = 'https://yourgroovydomain.com';

describe( 'getJetpackRemoteInstallError()', () => {
	test( 'should return null if no errors', () => {
		const state = {
			jetpackRemoteInstall: {
				errorCode: {},
			},
		};
		expect( getJetpackRemoteInstallErrorCode( state, url ) ).toBeNull();
	} );
	test( 'should return any existing error', () => {
		const state = {
			jetpackRemoteInstall: {
				errorCode: {
					[ url ]: 'SOME_ERROR',
				},
			},
		};
		expect( getJetpackRemoteInstallErrorCode( state, url ) ).toBe( 'SOME_ERROR' );
	} );
} );
