/**
 * Internal dependencies
 */
import getJetpackRemoteInstallErrorMessage from 'calypso/state/selectors/get-jetpack-remote-install-error-message';

const url = 'https://yourgroovydomain.com';

describe( 'getJetpackRemoteInstallErrorMessage()', () => {
	test( 'should return null if no error code', () => {
		const state = {
			jetpackRemoteInstall: {
				errorMessage: {},
			},
		};
		expect( getJetpackRemoteInstallErrorMessage( state, url ) ).toBeNull();
	} );
	test( 'should return any existing error', () => {
		const state = {
			jetpackRemoteInstall: {
				errorMessage: {
					[ url ]: 'bad username',
				},
			},
		};
		expect( getJetpackRemoteInstallErrorMessage( state, url ) ).toBe( 'bad username' );
	} );
} );
