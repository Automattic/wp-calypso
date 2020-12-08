/**
 * Internal dependencies
 */
import {
	handleError,
	handleSuccess,
	installJetpackPlugin,
	JETPACK_REMOTE_INSTALL_RETRIES,
} from '../';
import {
	jetpackRemoteInstallComplete,
	jetpackRemoteInstallUpdateError,
} from 'calypso/state/jetpack-remote-install/actions';
import { JETPACK_REMOTE_INSTALL, JETPACK_REMOTE_INSTALL_FAILURE } from 'calypso/state/action-types';

const url = 'https://yourgroovydomain.com';
const user = 'blah123';
const password = 'hGhrskf145kst';

const INSTALL_ACTION = {
	type: JETPACK_REMOTE_INSTALL,
	url,
	user,
	password,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
};

const SUCCESS_RESPONSE = { status: true };

const FAILURE_RESPONSE = {
	error: 'COULD_NOT_LOGIN',
	message: 'extra info',
};

const TIMEOUT_RESPONSE = {
	error: 'http_request_failed',
	message: 'cURL error 28: Operation timed out after 10000 milliseconds with 0 bytes received',
};

describe( 'installJetpackPlugin', () => {
	test( 'should return an http request', () => {
		const result = installJetpackPlugin( { url, user, password } );
		expect( result ).toMatchSnapshot();
	} );
} );

describe( 'handleSuccess', () => {
	test( 'should return jetpackRemoteInstallComplete', () => {
		const result = handleSuccess( { url }, SUCCESS_RESPONSE );
		expect( result ).toEqual( expect.objectContaining( jetpackRemoteInstallComplete( url ) ) );
	} );
} );

describe( 'handleError', () => {
	test( 'should return JetpackRemoteInstallUpdateError if not timeout error', () => {
		const result = handleError( INSTALL_ACTION, FAILURE_RESPONSE );
		expect( result ).toEqual(
			expect.objectContaining(
				jetpackRemoteInstallUpdateError( url, 'COULD_NOT_LOGIN', 'extra info' )
			)
		);
	} );

	test( 'should retry on timeout error', () => {
		const result = handleError( INSTALL_ACTION, TIMEOUT_RESPONSE );
		expect( result ).toEqual(
			expect.objectContaining( {
				type: JETPACK_REMOTE_INSTALL,
				url,
				user,
				password,
				meta: {
					dataLayer: {
						retryCount: 1,
						trackRequest: true,
					},
				},
			} )
		);
	} );

	test( 'should trigger an error if max num retries reached', () => {
		const installAction = {
			...INSTALL_ACTION,
			meta: { dataLayer: { retryCount: JETPACK_REMOTE_INSTALL_RETRIES } },
		};
		const result = handleError( installAction, TIMEOUT_RESPONSE );
		expect( result ).toEqual(
			expect.objectContaining( {
				type: JETPACK_REMOTE_INSTALL_FAILURE,
				url,
				errorCode: 'http_request_failed',
				errorMessage:
					'cURL error 28: Operation timed out after 10000 milliseconds with 0 bytes received',
			} )
		);
	} );
} );
