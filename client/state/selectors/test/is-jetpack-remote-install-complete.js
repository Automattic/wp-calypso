/** @format */

/**
 * Internal dependencies
 */
import { isJetpackRemoteInstallComplete } from 'state/selectors';

const url = 'https://yourgroovydomain.com';

describe( 'isJetpackRemoteInstallComplete()', () => {
	test( 'should return true if install is complete', () => {
		const state = {
			jetpackRemoteInstall: {
				isComplete: {
					[ url ]: true,
				},
			},
		};
		expect( isJetpackRemoteInstallComplete( state, url ) ).toBe( true );
	} );
	test( 'should return false if install is not complete', () => {
		const state = {
			jetpackRemoteInstall: {
				isComplete: {},
			},
		};
		expect( isJetpackRemoteInstallComplete( state, url ) ).toBe( false );
	} );
} );
